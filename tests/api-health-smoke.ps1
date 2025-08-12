Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')
$health = Join-Path $root 'app/api/health/route.ts'

if (-not (Test-Path -LiteralPath $health -PathType Leaf)) {
  Write-Host 'Missing app/api/health/route.ts' -ForegroundColor Red
  exit 1
}

$content = Get-Content -LiteralPath $health -Raw -Encoding UTF8
$hasExportFn  = ($content -match 'export\s+(?:async\s+)?function\s+GET')
$hasExportConst = ($content -match 'export\s+const\s+GET')
$jsonPattern = @'
NextResponse\.json\s*\(\s*\{\s*status\s*:\s*['"]ok['"]
'@
$hasJson = ($content -match $jsonPattern)

if (-not ($hasExportFn -or $hasExportConst)) {
  Write-Host 'Health route missing exported GET handler' -ForegroundColor Red
  exit 1
}

if (-not $hasJson) {
  Write-Host 'Health route missing NextResponse.json({ status: "ok" })' -ForegroundColor Red
  exit 1
}

Write-Host 'API health endpoint smoke test PASS.' -ForegroundColor Green
exit 0
