Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$files = @(
  'app/dashboard/page.tsx',
  'components/kpi/KpiCard.tsx',
  'components/kpi/KpiGrid.tsx'
)

$missing = @()
foreach ($f in $files) { if (-not (Test-Path -LiteralPath (Join-Path $root $f) -PathType Leaf)) { $missing += $f } }
if ($missing.Count -gt 0) {
  Write-Host 'Missing dashboard files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host 'Dashboard smoke test PASS.' -ForegroundColor Green
exit 0
