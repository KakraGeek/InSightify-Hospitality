Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$files = @(
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'next-env.d.ts'
)

$missing = @()
foreach ($f in $files) {
  $p = Join-Path $root $f
  if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { $missing += $f }
}
if ($missing.Count -gt 0) {
  Write-Host 'Missing app skeleton files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

$globals = Get-Content -LiteralPath (Join-Path $root 'app/globals.css') -Raw -Encoding UTF8
$v3ok = ($globals -match '@tailwind\s+base' -and $globals -match '@tailwind\s+components' -and $globals -match '@tailwind\s+utilities')
$v4Pattern = @'
@import\s+['"]tailwindcss['"];?
'@
$v4ok = ($globals -match $v4Pattern)
if (-not ($v3ok -or $v4ok)) {
  Write-Host 'globals.css missing Tailwind v3 directives or v4 import' -ForegroundColor Red
  exit 1
}

$layout = Get-Content -LiteralPath (Join-Path $root 'app/layout.tsx') -Raw -Encoding UTF8
$hasImport = $layout.Contains("./globals.css")
$hasDefaultExport = ($layout -match 'export\s+default\s+function')
if (-not ($hasImport -and $hasDefaultExport)) {
  Write-Host 'layout.tsx missing globals import or default export' -ForegroundColor Red
  exit 1
}

$page = Get-Content -LiteralPath (Join-Path $root 'app/page.tsx') -Raw -Encoding UTF8
if ($page -notmatch 'InSightify\s+–\s+Hospitality') {
  Write-Host 'page.tsx missing expected hero heading text' -ForegroundColor Red
  exit 1
}

Write-Host 'App skeleton smoke test PASS.' -ForegroundColor Green
exit 0
