Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')
$pkgPath  = Join-Path $repoRoot 'package.json'

if (-not (Test-Path -LiteralPath $pkgPath -PathType Leaf)) {
  Write-Host "Missing package.json at repo root" -ForegroundColor Red
  exit 1
}

try {
  $pkg = Get-Content -LiteralPath $pkgPath -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
} catch {
  Write-Host "Invalid JSON in package.json: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

if (-not $pkg.ContainsKey('scripts')) {
  Write-Host "package.json missing 'scripts'" -ForegroundColor Red
  exit 1
}

$scripts = $pkg.scripts
$required = @('dev','build','start','lint','format','test','e2e','db:generate','db:migrate')
$missing = @()
foreach ($k in $required) {
  if (-not $scripts.ContainsKey($k) -or [string]::IsNullOrWhiteSpace([string]$scripts[$k])) { $missing += $k }
}

if ($missing.Count -gt 0) {
  Write-Host "package.json missing required scripts:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host "Config smoke test PASS: package.json scripts OK." -ForegroundColor Green
if ($pkg.devDependencies -and ($pkg.devDependencies.vitest -or $pkg.devDependencies.ContainsKey('vitest'))) {
  Write-Host " - vitest present" -ForegroundColor Green
} else {
  Write-Host " - vitest not found (informational)" -ForegroundColor Yellow
}
if ($pkg.devDependencies -and ($pkg.devDependencies.'@playwright/test' -or $pkg.devDependencies.ContainsKey('@playwright/test'))) {
  Write-Host " - @playwright/test present" -ForegroundColor Green
} else {
  Write-Host " - @playwright/test not found (informational)" -ForegroundColor Yellow
}
exit 0
