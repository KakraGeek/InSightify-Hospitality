Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')
$nodeModules = Join-Path $root 'node_modules'

if (-not (Test-Path -LiteralPath $nodeModules -PathType Container)) {
  Write-Host 'node_modules not found. Did you run npm install?' -ForegroundColor Red
  exit 1
}

$packages = @(
  'next',
  'react',
  'react-dom',
  'typescript',
  'tailwindcss',
  'postcss',
  'autoprefixer',
  'eslint',
  'prettier'
)

$missing = @()
$bad = @()
foreach ($pkg in $packages) {
  $pkgJson = Join-Path $nodeModules (Join-Path $pkg 'package.json')
  if (-not (Test-Path -LiteralPath $pkgJson -PathType Leaf)) {
    $missing += $pkg
    continue
  }
  try {
    $json = Get-Content -LiteralPath $pkgJson -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
    if (-not $json.ContainsKey('version') -or [string]::IsNullOrWhiteSpace([string]$json.version)) {
      $bad += $pkg
    }
  } catch {
    $bad += $pkg
  }
}

if ($missing.Count -gt 0 -or $bad.Count -gt 0) {
  if ($missing.Count -gt 0) {
    Write-Host 'Missing npm packages:' -ForegroundColor Red
    $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  }
  if ($bad.Count -gt 0) {
    Write-Host 'Installed packages with invalid metadata:' -ForegroundColor Red
    $bad | ForEach-Object { Write-Host " - $_ (invalid package.json or version)" -ForegroundColor Red }
  }
  exit 1
}

Write-Host 'Dependency smoke test PASS: required packages installed with valid metadata.' -ForegroundColor Green
exit 0
