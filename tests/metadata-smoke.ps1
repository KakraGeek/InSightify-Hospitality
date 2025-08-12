Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$layout = Join-Path $root 'app/layout.tsx'
if (-not (Test-Path -LiteralPath $layout -PathType Leaf)) {
  Write-Host 'Missing app/layout.tsx' -ForegroundColor Red
  exit 1
}

$content = Get-Content -LiteralPath $layout -Raw -Encoding UTF8
if ($content -notmatch 'export\s+const\s+metadata') {
  Write-Host 'layout.tsx missing exported metadata' -ForegroundColor Red
  exit 1
}

$favicon = Join-Path $root 'public/favicon.ico'
if (-not (Test-Path -LiteralPath $favicon -PathType Leaf)) {
  Write-Host 'Missing public/favicon.ico' -ForegroundColor Red
  exit 1
}

Write-Host 'Metadata smoke test PASS.' -ForegroundColor Green
exit 0
