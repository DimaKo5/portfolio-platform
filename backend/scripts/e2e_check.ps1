$ErrorActionPreference = "Stop"
$base = "http://localhost:8000/api/v1"

function Invoke-Api {
    param($Method, $Path, $Body, $Token, $FilePath)
    $req = [System.Net.HttpWebRequest]::Create("$base$Path")
    $req.Method = $Method
    if ($Token) { $req.Headers.Add("Authorization", "Bearer $Token") }
    if ($Body) {
        $req.ContentType = "application/json"
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Body)
        $req.ContentLength = $bytes.Length
        $s = $req.GetRequestStream(); $s.Write($bytes, 0, $bytes.Length); $s.Close()
    }
    if ($FilePath) {
        $boundary = "----Boundary" + [guid]::NewGuid().ToString("N")
        $req.ContentType = "multipart/form-data; boundary=$boundary"
        $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
        $fileName = [System.IO.Path]::GetFileName($FilePath)
        $ms = New-Object System.IO.MemoryStream
        $w = New-Object System.IO.BinaryWriter($ms)
        $w.Write([System.Text.Encoding]::UTF8.GetBytes("--$boundary`r`nContent-Disposition: form-data; name=`"file`"; filename=`"$fileName`"`r`nContent-Type: image/png`r`n`r`n"))
        $w.Write($fileBytes)
        $w.Write([System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--`r`n"))
        $arr = $ms.ToArray(); $req.ContentLength = $arr.Length
        $s = $req.GetRequestStream(); $s.Write($arr, 0, $arr.Length); $s.Close()
    }
    try {
        $resp = $req.GetResponse()
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        return @{ status = [int]$resp.StatusCode; body = $reader.ReadToEnd() }
    } catch [System.Net.WebException] {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        return @{ status = [int]$_.Exception.Response.StatusCode; body = $reader.ReadToEnd() }
    }
}

$step = { param($name, $ok) if ($ok) { Write-Host "PASS  $name" } else { Write-Host "FAIL  $name"; exit 1 } }

$runId = (Get-Date).ToString("HHmmss")

# 1. Register
$r = Invoke-Api -Method "POST" -Path "/auth/register" -Body ('{"email":"demo' + $runId + '@example.com","username":"demo' + $runId + '","password":"demopass123"}')
& $step "register (201) -> $($r.status)" ($r.status -eq 201)
$token = ($r.body | ConvertFrom-Json).access_token

# 2. Login
$r = Invoke-Api -Method "POST" -Path "/auth/login" -Body ('{"email":"demo' + $runId + '@example.com","password":"demopass123"}')
$token = ($r.body | ConvertFrom-Json).access_token
& $step "login (200) -> $($r.status)" ($r.status -eq 200 -and $token)

# 3. Me
$r = Invoke-Api -Method "GET" -Path "/auth/me" -Token $token
& $step "me (200, username=demo) -> $($r.status)" ($r.status -eq 200 -and $r.body -match '"username"')

# 4. Profile update
$r = Invoke-Api -Method "PUT" -Path "/profile" -Token $token -Body '{"display_name":"Demo Developer","headline":"Full-Stack Developer","bio":"I build automation tools.","location":"Moscow","github_url":"https://github.com/demo"}'
& $step "profile update (200) -> $($r.status)" ($r.status -eq 200 -and $r.body -match "Demo Developer")

# 5. Create project
$r = Invoke-Api -Method "POST" -Path "/projects" -Token $token -Body ('{"title":"Telegram CRM ' + $runId + '","short_description":"CRM system for Telegram-based businesses.","problem":"Businesses were managing leads manually.","solution":"Built a centralized CRM with Telegram integration.","result":"Automated lead management.","role":"Full-Stack Developer","github_url":"https://github.com/demo/telegram-crm","live_url":"https://example.com"}')
$project = $r.body | ConvertFrom-Json
& $step "create project (201) -> $($r.status)" ($r.status -eq 201)

# 6. Second project + reorder
$r = Invoke-Api -Method "POST" -Path "/projects" -Token $token -Body '{"title":"Analytics Dashboard","short_description":"Real-time analytics."}'
$project2 = $r.body | ConvertFrom-Json
& $step "create project 2 (201) -> $($r.status)" ($r.status -eq 201)

$r = Invoke-Api -Method "PUT" -Path "/projects/reorder" -Token $token -Body ('{"project_ids":["' + $project2.id + '","' + $project.id + '"]}')
& $step "reorder (204) -> $($r.status)" ($r.status -eq 204)

# 7. Technologies
$r = Invoke-Api -Method "GET" -Path "/technologies"
$techs = $r.body | ConvertFrom-Json
$ids = ($techs | Where-Object { $_.name -in @("Python","FastAPI","React") } | ForEach-Object { $_.id })
$body = '{"technology_ids":[' + (($ids | ForEach-Object { '"' + $_ + '"' }) -join ",") + ']}'
$r = Invoke-Api -Method "PUT" -Path "/projects/$($project.id)/technologies" -Token $token -Body $body
& $step "set technologies (200, 3 items) -> $($r.status)" ($r.status -eq 200 -and $r.body -match "FastAPI")

# 8. Image upload
$pngPath = Join-Path $env:TEMP "e2e_test.png"
[IO.File]::WriteAllBytes($pngPath, [byte[]](0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x06,0x00,0x00,0x00,0x1F,0x15,0xC4,0x89,0x00,0x00,0x00,0x0D,0x49,0x44,0x41,0x54,0x78,0x9C,0x63,0x00,0x01,0x00,0x00,0x05,0x00,0x01,0x0D,0x0A,0x2D,0xB4,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,0x42,0x60,0x82))
$r = Invoke-Api -Method "POST" -Path "/projects/$($project.id)/images" -Token $token -FilePath $pngPath
$image = $r.body | ConvertFrom-Json
& $step "upload image (201) -> $($r.status)" ($r.status -eq 201 -and $image.url -match "^/uploads/")

# 9. Set cover
$r = Invoke-Api -Method "PUT" -Path "/projects/$($project.id)" -Token $token -Body ('{"cover_image_url":"' + $image.url + '"}')
& $step "set cover (200) -> $($r.status)" ($r.status -eq 200 -and $r.body -match "uploads")

# 10. Publish project 2, keep project 1 draft initially
$r = Invoke-Api -Method "POST" -Path "/projects/$($project2.id)/publish" -Token $token
& $step "publish (200, PUBLISHED) -> $($r.status)" ($r.status -eq 200 -and $r.body -match "PUBLISHED")

# 11. Draft invisible publicly
$r = Invoke-Api -Method "GET" -Path "/public/$("demo$runId")"
$pub = $r.body | ConvertFrom-Json
& $step "public portfolio shows only published (1 project) -> $($r.status)" ($r.status -eq 200 -and $pub.projects.Count -eq 1)

# 12. Publish project 1 and check case page
Invoke-Api -Method "POST" -Path "/projects/$($project.id)/publish" -Token $token | Out-Null
$r = Invoke-Api -Method "GET" -Path "/public/$("demo$runId")"
$pub = $r.body | ConvertFrom-Json
& $step "public portfolio now has 2 projects and skills -> $($r.status)" ($pub.projects.Count -eq 2 -and $pub.skills.Count -ge 3)
$r = Invoke-Api -Method "GET" -Path "/public/$("demo$runId")/projects/$($project.slug)"
& $step "public project page (200, problem present) -> $($r.status)" ($r.status -eq 200 -and $r.body -match "managing leads manually")

# 13. Ownership: second user cannot touch demo's project
$r2 = Invoke-Api -Method "POST" -Path "/auth/register" -Body ('{"email":"attacker' + $runId + '@example.com","username":"attacker' + $runId + '","password":"attackpass123"}')
$atkToken = ($r2.body | ConvertFrom-Json).access_token
$r = Invoke-Api -Method "PUT" -Path "/projects/$($project.id)" -Token $atkToken -Body '{"title":"HACKED"}'
& $step "ownership: attacker gets 404 -> $($r.status)" ($r.status -eq 404)

# 14. Error format check
$r = Invoke-Api -Method "GET" -Path "/public/nosuchuser"
& $step "404 unified error format" ($r.status -eq 404 -and $r.body -match '"code"')

# 15. Unpublish hides
Invoke-Api -Method "POST" -Path "/projects/$($project.id)/unpublish" -Token $token | Out-Null
$r = Invoke-Api -Method "GET" -Path "/public/$("demo$runId")/projects/$($project.slug)"
& $step "unpublish hides project (404) -> $($r.status)" ($r.status -eq 404)

Write-Host ""
Write-Host "E2E COMPLETE"
