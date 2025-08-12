Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$required = @(
  'tsconfig.json',
  'next.config.ts',
  'postcss.config.js',
  'tailwind.config.ts'
)

$missing = @()
foreach ($f in $required) {
  $p = Join-Path $root $f
  if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { $missing += $f }
}

if ($missing.Count -gt 0) {
  Write-Host 'Missing frontend config files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

# Basic tsconfig validity (JSON parse)
try { Get-Content -LiteralPath (Join-Path $root 'tsconfig.json') -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable | Out-Null }
catch { Write-Host "Invalid tsconfig.json: $($_.Exception.Message)" -ForegroundColor Red; exit 1 }

# Accept Tailwind v3 or v4 syntax in globals.css
$globalsPath = Join-Path $root 'app/globals.css'
if (Test-Path -LiteralPath $globalsPath -PathType Leaf) {
  $globals = Get-Content -LiteralPath $globalsPath -Raw -Encoding UTF8
  $isV3 = ($globals -match '@tailwind\s+base' -and $globals -match '@tailwind\s+components' -and $globals -match '@tailwind\s+utilities')
  $v4Pattern = @'
@import\s+['"]tailwindcss['"];?
'@
  $isV4 = ($globals -match $v4Pattern)
  if (-not ($isV3 -or $isV4)) {
    Write-Host 'globals.css missing Tailwind v3 directives or v4 import' -ForegroundColor Red
    exit 1
  }
}

Write-Host 'Frontend config smoke test PASS.' -ForegroundColor Green
exit 0
