Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')
$pagePath = Join-Path $root 'app/kpis/page.tsx'

if (-not (Test-Path -LiteralPath $pagePath -PathType Leaf)) {
  Write-Host 'Missing app/kpis/page.tsx' -ForegroundColor Red
  exit 1
}

$content = Get-Content -LiteralPath $pagePath -Raw -Encoding UTF8
$hasImport = ($content -like "*../../kpi/catalog.json*")
if (-not $hasImport) {
  Write-Host 'KPIs page missing catalog import' -ForegroundColor Red
  exit 1
}

if ($content -notmatch 'Occupancy Rate' -or $content -notmatch 'Average Daily Rate \(ADR\)' -or $content -notmatch 'Revenue per Available Room \(RevPAR\)') {
  Write-Host 'KPIs page missing expected featured KPI names' -ForegroundColor Red
  exit 1
}

Write-Host 'KPIs page smoke test PASS.' -ForegroundColor Green
exit 0
