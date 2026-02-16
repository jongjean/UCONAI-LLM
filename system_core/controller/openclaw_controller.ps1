param(
  [int]$Port = 17777
)

$prefix = "http://127.0.0.1:$Port/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()

function Write-Json($res, $obj, $status = 200) {
  # Clean up: only wrap in array if it looks like it needs to be an array of objects
  # PowerShell hashtables/objects shouldn't be wrapped by default
  $json = ($obj | ConvertTo-Json -Depth 4 -Compress)
  $res.StatusCode = $status
  $res.ContentType = "application/json; charset=utf-8"
  $res.AddHeader("Access-Control-Allow-Origin", "*")
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
  $res.OutputStream.Close()
}

$LogBuffer = [System.Collections.Generic.List[string]]::new()
$LogBuffer.Add("[SYS] Controller Nerve Center Online")

function Add-To-Log($msg) {
  $time = Get-Date -Format "HH:mm:ss"
  $LogBuffer.Add("[$time] $msg")
  if ($LogBuffer.Count -gt 50) { $LogBuffer.RemoveAt(0) }
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response

  # CORS Preflight
  if ($req.HttpMethod -eq "OPTIONS") {
    $res.AddHeader("Access-Control-Allow-Origin", "*")
    $res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $res.AddHeader("Access-Control-Allow-Headers", "Content-Type")
    $res.StatusCode = 200
    $res.Close()
    continue
  }

  try {
    if ($req.Url.AbsolutePath -eq "/logs") {
      # For /logs, we WANT an array
      $json = ($LogBuffer.ToArray() | ConvertTo-Json -Compress)
      if ($LogBuffer.Count -eq 1) { $json = "[$json]" }
      $bytes = [Text.Encoding]::UTF8.GetBytes($json)
      $res.StatusCode = 200
      $res.ContentType = "application/json; charset=utf-8"
      $res.AddHeader("Access-Control-Allow-Origin", "*")
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $res.OutputStream.Close()
      continue
    }

    if ($req.Url.AbsolutePath -eq "/log-push") {
      $reader = New-Object System.IO.StreamReader($req.InputStream)
      $body = $reader.ReadToEnd(); $reader.Close()
      $payload = $body | ConvertFrom-Json
      Add-To-Log $payload.message
      Write-Json $res @{ ok = $true }
      continue
    }

    if ($req.Url.AbsolutePath -eq "/health-report") {
      # This one is complex, just pass through
      $json = PowerShell -NoProfile -ExecutionPolicy Bypass -File C:\UCONAI-LLM\scripts\health\health-all.ps1 -JsonOutput
      $bytes = [Text.Encoding]::UTF8.GetBytes($json)
      $res.StatusCode = 200
      $res.ContentType = "application/json; charset=utf-8"
      $res.AddHeader("Access-Control-Allow-Origin", "*")
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $res.OutputStream.Close()
      continue
    }

    if ($req.Url.AbsolutePath -eq "/exec") {
      $reader = New-Object System.IO.StreamReader($req.InputStream)
      $body = $reader.ReadToEnd(); $reader.Close()
      $payload = $body | ConvertFrom-Json
      
      Add-To-Log "Executing: $($payload.cmd) $($payload.args -join ' ')"

      $psi = New-Object System.Diagnostics.ProcessStartInfo
      $psi.FileName = $payload.cmd
      $psi.Arguments = ($payload.args -join " ")
      $psi.UseShellExecute = $true
      $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
      
      try {
        $p = [System.Diagnostics.Process]::Start($psi)
        Write-Json $res @{ ok = $true; pid = $p.Id }
      }
      catch {
        Add-To-Log "Execution Failed: $($_.Exception.Message)"
        Write-Json $res @{ ok = $false; error = $_.Exception.Message } 500
      }
      continue
    }

    Write-Json $res @{ ok = $true; status = "alive" }
  }
  catch {
    Write-Json $res @{ ok = $false; error = $_.Exception.Message } 500
  }
}
