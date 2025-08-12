Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$testDir  = Split-Path -Parent $PSCommandPath
$repoRoot = Resolve-Path (Join-Path $testDir '..')
$loop     = Join-Path $repoRoot 'tools/agent-loop.ps1'
$buildDir = Join-Path $repoRoot 'build'
$tick     = Join-Path $buildDir 'agent-tick.json'

if (-not (Test-Path -LiteralPath $loop -PathType Leaf)) {
  Write-Host "Loop script not found at: $loop" -ForegroundColor Red
  exit 1
}

& pwsh -NoProfile -File $loop
$code = $LASTEXITCODE
if ($code -ne 0) {
  Write-Host "Loop exited with code $code" -ForegroundColor Red
  exit $code
}

if (-not (Test-Path -LiteralPath $tick -PathType Leaf)) {
  Write-Host "Missing tick artifact: $tick" -ForegroundColor Red
  exit 1
}

try {
  $tickObj = Get-Content -LiteralPath $tick -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
} catch {
  Write-Host "Failed to parse tick JSON: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

foreach ($key in @('promptPath','mcpConfigPath','numTasks')) {
  if (-not $tickObj.ContainsKey($key)) {
    Write-Host "tick JSON missing key: $key" -ForegroundColor Red
    exit 1
  }
}

Write-Host "Agent loop smoke test PASS: tick artifact generated and parseable." -ForegroundColor Green
exit 0
