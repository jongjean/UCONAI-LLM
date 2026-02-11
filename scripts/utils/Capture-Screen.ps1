param(
    [int]$MonitorIndex = 0
)

# Debug Log
$LogFile = "C:\UCONAI-LLM\logs\vision_capture_$(Get-Date -Format 'HHmmss').log"
"Monitor Index Requested: $MonitorIndex" | Out-File $LogFile

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$Screens = [System.Windows.Forms.Screen]::AllScreens
"Total Screens: $($Screens.Count)" | Out-File $LogFile -Append

if ($MonitorIndex -ge $Screens.Count) {
    $MonitorIndex = 0
}

$Screen = $Screens[$MonitorIndex]
$Width = $Screen.Bounds.Width
$Height = $Screen.Bounds.Height
$Left = $Screen.Bounds.Left
$Top = $Screen.Bounds.Top

"Capturing Monitor $MonitorIndex : ${Width}x${Height} at ($Left, $Top)" | Out-File $LogFile -Append

$Bitmap = New-Object System.Drawing.Bitmap -ArgumentList $Width, $Height
$Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
$Graphics.CopyFromScreen($Left, $Top, 0, 0, $Bitmap.Size)

# 타임스탬프 추가로 캐시 회피
$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$OutputPath = "C:\UCONAI-LLM\frontend\public\vision_M${MonitorIndex}_${Timestamp}.jpg"
$Bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

# 최신 파일로 심볼릭 링크 (항상 vision_capture.jpg로 참조)
$LatestPath = "C:\UCONAI-LLM\frontend\public\vision_capture.jpg"
if (Test-Path $LatestPath) { Remove-Item $LatestPath -Force }
Copy-Item $OutputPath $LatestPath -Force

$Graphics.Dispose()
$Bitmap.Dispose()

"Success: $OutputPath" | Out-File $LogFile -Append
Write-Host "CAPTURE_SUCCESS: Monitor $MonitorIndex -> $OutputPath"
