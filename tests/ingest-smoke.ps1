Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$route = Join-Path $root 'app/api/ingest/route.ts'
$types = Join-Path $root 'lib/ingest/types.ts'

$missing = @()
foreach ($p in @($route,$types)) { if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { $missing += $p } }
if ($missing.Count -gt 0) {
  Write-Host 'Missing ingest files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host 'Ingest smoke test PASS.' -ForegroundColor Green
exit 0
