Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$files = @(
  'drizzle.config.ts',
  'lib/db.ts',
  'db/schema/users.ts'
)

$missing = @()
foreach ($f in $files) {
  $p = Join-Path $root $f
  if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { $missing += $f }
}
if ($missing.Count -gt 0) {
  Write-Host 'Missing DB scaffolding files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

$pkgPath = Join-Path $root 'package.json'
$pkg = Get-Content -LiteralPath $pkgPath -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
if (-not $pkg.scripts.ContainsKey('db:generate') -or -not $pkg.scripts.ContainsKey('db:migrate')) {
  Write-Host 'package.json missing db:generate or db:migrate scripts' -ForegroundColor Red
  exit 1
}

Write-Host 'DB scaffold smoke test PASS.' -ForegroundColor Green
exit 0
