param([int]$Port = 18080)
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Prefixes.Add("http://[::1]:$Port/")
$listener.Start()
Write-Host "Controller running on $Port..."

while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
        $req = $ctx.Request; $res = $ctx.Response
        
        $res.AddHeader("Access-Control-Allow-Origin", "*")
        $res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $res.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($req.HttpMethod -eq "OPTIONS") {
            $res.StatusCode = 200; $res.OutputStream.Close(); continue
        }

        if ($req.Url.AbsolutePath -eq "/health-report") {
            $healthJson = & "C:\UCONAI-LLM\scripts\health\health-all.ps1" -JsonOutput | Out-String
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($healthJson)
            $res.StatusCode = 200
            $res.ContentType = "application/json; charset=utf-8"
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.OutputStream.Close()
            continue
        }

        if ($req.Url.AbsolutePath -eq "/exec") {
            $reader = [System.IO.StreamReader]::new($req.InputStream)
            $body = $reader.ReadToEnd(); $reader.Close()
            $payload = $body | ConvertFrom-Json
            Start-Process $payload.cmd -ArgumentList ($payload.args -join " ") -WindowStyle Hidden
            $res.StatusCode = 200; $res.OutputStream.Close(); continue
        }
    } catch {
        # Silent error handling
    }
}
