$http = New-Object System.Net.HttpListener
$http.Prefixes.Add("http://+:8080/")
$http.Start()
Write-Host "Server running at http://localhost:8080"

$rootDir = "d:\杂\TRAE SOLO CN\math-game"

while ($http.IsListening) {
    $context = $http.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $urlPath = $request.Url.LocalPath -replace "^/", ""
    if ($urlPath -eq "" -or $urlPath -eq "/") {
        $urlPath = "index.html"
    }
    
    $filePath = Join-Path $rootDir $urlPath
    
    $mimeTypes = @{
        ".html" = "text/html; charset=utf-8"
        ".css" = "text/css; charset=utf-8"
        ".js" = "application/javascript; charset=utf-8"
        ".png" = "image/png"
        ".jpg" = "image/jpeg"
        ".gif" = "image/gif"
        ".svg" = "image/svg+xml"
    }
    
    $extension = [System.IO.Path]::GetExtension($filePath)
    $contentType = $mimeTypes[$extension] ?? "application/octet-stream"
    
    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentLength64 = $bytes.Length
        $response.ContentType = $contentType
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $errorBytes = [System.Text.Encoding]::UTF8.GetBytes("<html><body><h1>404 Not Found</h1></body></html>")
        $response.ContentLength64 = $errorBytes.Length
        $response.ContentType = "text/html"
        $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
    }
    
    $response.Close()
}
