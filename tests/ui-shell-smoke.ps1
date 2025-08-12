Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$appShell = Join-Path $root 'components/layout/AppShell.tsx'
$layout   = Join-Path $root 'app/layout.tsx'

$missing = @()
foreach ($p in @($appShell,$layout)) { if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { $missing += $p } }
if ($missing.Count -gt 0) {
  Write-Host 'Missing UI shell files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

$layoutContent = Get-Content -LiteralPath $layout -Raw -Encoding UTF8
if ($layoutContent -notmatch 'AppShell') {
  Write-Host 'layout.tsx does not wrap children in AppShell' -ForegroundColor Red
  exit 1
}

Write-Host 'UI shell smoke test PASS.' -ForegroundColor Green
exit 0
