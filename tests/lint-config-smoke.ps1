Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$files = @(
  '.eslintrc.json',
  '.eslintignore',
  '.prettierrc',
  '.prettierignore'
)

$missing = @()
foreach ($f in $files) {
  $p = Join-Path $root $f
  if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { $missing += $f }
}

if ($missing.Count -gt 0) {
  Write-Host 'Missing lint/format config files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

try {
  $eslint = Get-Content -LiteralPath (Join-Path $root '.eslintrc.json') -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
} catch {
  Write-Host "Invalid JSON in .eslintrc.json: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

try {
  $prettier = Get-Content -LiteralPath (Join-Path $root '.prettierrc') -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
} catch {
  Write-Host "Invalid JSON in .prettierrc: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

if (-not $eslint.ContainsKey('extends')) {
  Write-Host ".eslintrc.json missing 'extends'" -ForegroundColor Red
  exit 1
}

Write-Host 'Lint/format config smoke test PASS.' -ForegroundColor Green
exit 0
