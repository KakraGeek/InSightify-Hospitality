Set-StrictMode -Version Latest
$ErrorActionPreference = 'Continue'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')
$tests = @(
  'tests/config-smoke.ps1',
  'tests/frontend-config-smoke.ps1',
  'tests/lint-config-smoke.ps1',
  'tests/app-skeleton-smoke.ps1',
  'tests/deps-smoke.ps1',
  'tests/branding-components-smoke.ps1',
  'tests/api-health-smoke.ps1',
  'tests/kpis-page-smoke.ps1',
  'tests/kpis-filter-smoke.ps1',
  'tests/metadata-smoke.ps1',
  'tests/ui-shell-smoke.ps1',
  'tests/db-scaffold-smoke.ps1',
  'tests/db-schema-smoke.ps1',
  'tests/seed-script-smoke.ps1',
  'tests/auth-foundation-smoke.ps1',
  'tests/auth-pages-smoke.ps1',
  'tests/dashboard-smoke.ps1',
  'tests/ingest-smoke.ps1',
  'tests/agent-smoke.ps1',
  'tests/agent-runner.ps1',
  'tests/agent-loop-smoke.ps1',
  'tests/agent-state-smoke.ps1'
) | ForEach-Object { Join-Path $root $_ }

$failures = 0

foreach ($t in $tests) {
  Write-Host ("\n=== Running {0} ===" -f (Split-Path -Leaf $t)) -ForegroundColor Cyan
  & pwsh -NoProfile -File $t
  if ($LASTEXITCODE -ne 0) {
    Write-Host ("Test FAILED: {0}" -f $t) -ForegroundColor Red
    $failures++
  } else {
    Write-Host ("Test PASSED: {0}" -f $t) -ForegroundColor Green
  }
}

if ($failures -gt 0) {
  Write-Host ("\n{0} test(s) failed." -f $failures) -ForegroundColor Red
  exit 1
}

Write-Host "\nAll tests passed." -ForegroundColor Green
exit 0
