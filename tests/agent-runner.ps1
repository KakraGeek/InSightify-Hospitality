Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$testDir  = Split-Path -Parent $PSCommandPath
$repoRoot = Resolve-Path (Join-Path $testDir '..')
$runner   = Join-Path $repoRoot 'tools/run-agent.ps1'
$buildDir = Join-Path $repoRoot 'build'

if (-not (Test-Path -LiteralPath $runner -PathType Leaf)) {
  Write-Host "Runner not found at: $runner" -ForegroundColor Red
  exit 1
}

& pwsh -NoProfile -File $runner
$code = $LASTEXITCODE
if ($code -ne 0) {
  Write-Host "Runner exited with code $code" -ForegroundColor Red
  exit $code
}

$status = Join-Path $buildDir 'agent-status.json'
$tasks  = Join-Path $buildDir 'tasks.json'

$missing = @()
foreach ($f in @($status, $tasks)) {
  if (-not (Test-Path -LiteralPath $f -PathType Leaf)) { $missing += $f }
}
if ($missing.Count -gt 0) {
  Write-Host "Missing artifact(s):" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

try {
  $statusObj = Get-Content -LiteralPath $status -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
  $tasksObj  = Get-Content -LiteralPath $tasks  -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable
} catch {
  Write-Host "Failed to parse emitted JSON: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

if (-not $statusObj.ContainsKey('promptPath') -or -not $statusObj.ContainsKey('numTasks')) {
  Write-Host "agent-status.json missing expected keys" -ForegroundColor Red
  exit 1
}

if (-not $tasksObj.ContainsKey('tasks')) {
  Write-Host "tasks.json missing 'tasks' key" -ForegroundColor Red
  exit 1
}

Write-Host "Runner smoke test PASS: artifacts generated and parseable." -ForegroundColor Green
exit 0
