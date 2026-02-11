# DCP Secret Management Utility (Generic Credentials)
# Chapter 2-4: 비밀 관리 시스템
#
# This script uses Windows Credential Manager to store and retrieve secrets.

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class CredentialManager {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct CREDENTIAL {
        public uint Flags;
        public uint Type;
        public IntPtr TargetName;
        public IntPtr Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public uint CredentialBlobSize;
        public IntPtr CredentialBlob;
        public uint Persist;
        public uint AttributeCount;
        public IntPtr Attributes;
        public IntPtr TargetAlias;
        public IntPtr UserName;
    }

    [DllImport("advapi32.dll", EntryPoint = "CredWriteW", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CredWrite(ref CREDENTIAL credential, uint flags);

    [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CredRead(string target, uint type, uint reservedFlag, out IntPtr credentialPtr);

    [DllImport("advapi32.dll", EntryPoint = "CredFree", SetLastError = true)]
    private static extern void CredFree(IntPtr credentialPtr);

    private const uint CRED_TYPE_GENERIC = 1;
    private const uint CRED_PERSIST_LOCAL_MACHINE = 2;

    public static bool SaveSecret(string target, string secret) {
        byte[] blob = Encoding.Unicode.GetBytes(secret);
        IntPtr blobPtr = Marshal.AllocCoTaskMem(blob.Length);
        Marshal.Copy(blob, 0, blobPtr, blob.Length);

        CREDENTIAL cred = new CREDENTIAL();
        cred.Type = CRED_TYPE_GENERIC;
        cred.TargetName = Marshal.StringToCoTaskMemUni(target);
        cred.CredentialBlobSize = (uint)blob.Length;
        cred.CredentialBlob = blobPtr;
        cred.Persist = CRED_PERSIST_LOCAL_MACHINE;
        cred.UserName = Marshal.StringToCoTaskMemUni(Environment.UserName);

        bool result = CredWrite(ref cred, 0);

        Marshal.FreeCoTaskMem(cred.TargetName);
        Marshal.FreeCoTaskMem(cred.UserName);
        Marshal.FreeCoTaskMem(blobPtr);

        return result;
    }

    public static string GetSecret(string target) {
        IntPtr credPtr;
        if (CredRead(target, CRED_TYPE_GENERIC, 0, out credPtr)) {
            CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
            byte[] blob = new byte[cred.CredentialBlobSize];
            Marshal.Copy(cred.CredentialBlob, blob, 0, blob.Length);
            CredFree(credPtr);
            return Encoding.Unicode.GetString(blob);
        }
        return null;
    }
}
"@

function Set-DCPSecret {
    param(
        [Parameter(Mandatory = $true)] [string]$Name,
        [Parameter(Mandatory = $true)] [string]$Value
    )
    $target = "DCP_Secret_$Name"
    if ([CredentialManager]::SaveSecret($target, $Value)) {
        Write-Host "✅ Secret '$Name' saved successfully to Windows Credential Manager." -ForegroundColor Green
    }
    else {
        Write-Error "❌ Failed to save secret '$Name'."
    }
}

function Get-DCPSecret {
    param(
        [Parameter(Mandatory = $true)] [string]$Name
    )
    $target = "DCP_Secret_$Name"
    return [CredentialManager]::GetSecret($target)
}

# 자동 완성/치환 유틸리티
function Resolve-DCPConfigSecrets {
    param(
        [Parameter(Mandatory = $true)] [string]$Content
    )
    # Pattern: ${CRED:key}
    $pattern = "\$\{CRED:([^}]+)\}"
    $matches = [regex]::Matches($Content, $pattern)
    
    $resolvedContent = $Content
    foreach ($match in $matches) {
        $key = $match.Groups[1].Value
        $secret = Get-DCPSecret -Name $key
        if ($secret) {
            $resolvedContent = $resolvedContent.Replace($match.Value, $secret)
        }
        else {
            Write-Warning "Secret key '$key' not found in Credential Manager."
        }
    }
    return $resolvedContent
}
