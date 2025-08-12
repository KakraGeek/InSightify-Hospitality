Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$files = @(
  'db/schema/users.ts',
  'db/schema/roles.ts',
  'db/schema/user_roles.ts',
  'db/schema/accounts.ts',
  'db/schema/sessions.ts'
)

$missing = @()
foreach ($f in $files) { if (-not (Test-Path -LiteralPath (Join-Path $root $f) -PathType Leaf)) { $missing += $f } }
if ($missing.Count -gt 0) {
  Write-Host 'Missing DB schema files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

$users = Get-Content -LiteralPath (Join-Path $root 'db/schema/users.ts') -Raw -Encoding UTF8
$roles = Get-Content -LiteralPath (Join-Path $root 'db/schema/roles.ts') -Raw -Encoding UTF8
$link  = Get-Content -LiteralPath (Join-Path $root 'db/schema/user_roles.ts') -Raw -Encoding UTF8
$acc   = Get-Content -LiteralPath (Join-Path $root 'db/schema/accounts.ts') -Raw -Encoding UTF8
$sess  = Get-Content -LiteralPath (Join-Path $root 'db/schema/sessions.ts') -Raw -Encoding UTF8

if ($users -notmatch 'pgTable' -or $roles -notmatch 'pgTable' -or $link -notmatch 'pgTable' -or $acc -notmatch 'pgTable' -or $sess -notmatch 'pgTable') {
  Write-Host 'One or more schema files missing pgTable definitions' -ForegroundColor Red
  exit 1
}

Write-Host 'DB schema smoke test PASS.' -ForegroundColor Green
exit 0
