Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')
$seed = Join-Path $root 'scripts/seed-admin.ts'

if (-not (Test-Path -LiteralPath $seed -PathType Leaf)) {
  Write-Host 'Missing scripts/seed-admin.ts' -ForegroundColor Red
  exit 1
}

$content = Get-Content -LiteralPath $seed -Raw -Encoding UTF8
if ($content -notmatch 'getDb' -or $content -notmatch 'users' -or $content -notmatch 'roles' -or $content -notmatch 'user_roles') {
  Write-Host 'Seed script missing expected imports or references' -ForegroundColor Red
  exit 1
}

Write-Host 'Seed script smoke test PASS.' -ForegroundColor Green
exit 0
