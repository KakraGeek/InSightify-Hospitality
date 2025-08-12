Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$header = Join-Path $root 'components/Header.tsx'
$footer = Join-Path $root 'components/Footer.tsx'
$layout = Join-Path $root 'app/layout.tsx'
$appShell = Join-Path $root 'components/layout/AppShell.tsx'

$missing = @()
foreach ($f in @($header,$footer,$layout,$appShell)) {
  if (-not (Test-Path -LiteralPath $f -PathType Leaf)) { $missing += $f }
}
if ($missing.Count -gt 0) {
  Write-Host 'Missing branding component files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

$layoutContent = Get-Content -LiteralPath $layout -Raw -Encoding UTF8
$appShellContent = Get-Content -LiteralPath $appShell -Raw -Encoding UTF8

# Pass if layout directly references Header/Footer
$direct = ($layoutContent -match 'Header') -and ($layoutContent -match 'Footer')
# Or pass if layout uses AppShell and AppShell references Header/Footer
$viaShell = ($layoutContent -match 'AppShell') -and ($appShellContent -match 'Header') -and ($appShellContent -match 'Footer')

if (-not ($direct -or $viaShell)) {
  Write-Host 'Layout does not reference Header/Footer directly or via AppShell' -ForegroundColor Red
  exit 1
}

Write-Host 'Branding components smoke test PASS.' -ForegroundColor Green
exit 0
