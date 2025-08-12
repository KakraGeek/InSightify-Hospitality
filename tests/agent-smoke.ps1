Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$testDir = Split-Path -Parent $PSCommandPath
$repoRoot = Resolve-Path (Join-Path $testDir '..')
$validator = Join-Path $repoRoot 'tools/validate-agent.ps1'

if (-not (Test-Path -LiteralPath $validator -PathType Leaf)) {
  Write-Host "Validator not found at: $validator" -ForegroundColor Red
  exit 1
}

& pwsh -NoProfile -File $validator
$code = $LASTEXITCODE

if ($code -eq 0) {
  Write-Host "Smoke test PASS: single-agent prerequisites present." -ForegroundColor Green
  exit 0
} else {
  Write-Host "Smoke test FAIL: validator exited with code $code." -ForegroundColor Red
  exit $code
}
