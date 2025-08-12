Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$files = @(
  'app/login/page.tsx',
  'app/protected/page.tsx',
  'lib/auth/session.ts',
  'lib/auth/permissions.ts'
)

$missing = @()
foreach ($f in $files) { if (-not (Test-Path -LiteralPath (Join-Path $root $f) -PathType Leaf)) { $missing += $f } }
if ($missing.Count -gt 0) {
  Write-Host 'Missing auth pages/helpers:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host 'Auth pages smoke test PASS.' -ForegroundColor Green
exit 0
