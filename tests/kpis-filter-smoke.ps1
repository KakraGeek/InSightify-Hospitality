Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')
$pagePath = Join-Path $root 'app/kpis/page.tsx'

if (-not (Test-Path -LiteralPath $pagePath -PathType Leaf)) {
  Write-Host 'Missing app/kpis/page.tsx' -ForegroundColor Red
  exit 1
}

$content = Get-Content -LiteralPath $pagePath -Raw -Encoding UTF8
if ($content -notmatch 'searchParams' -or $content -notmatch '\?dept=') {
  Write-Host 'KPIs page missing department filter via searchParams or link' -ForegroundColor Red
  exit 1
}

Write-Host 'KPIs filter smoke test PASS.' -ForegroundColor Green
exit 0
