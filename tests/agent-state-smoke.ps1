Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$testDir  = Split-Path -Parent $PSCommandPath
$repoRoot = Resolve-Path (Join-Path $testDir '..')
$script   = Join-Path $repoRoot 'tools/agent-state.ps1'
$state    = Join-Path $repoRoot 'build/state.json'

if (-not (Test-Path -LiteralPath $script -PathType Leaf)) {
  Write-Host "State script not found at: $script" -ForegroundColor Red
  exit 1
}

& pwsh -NoProfile -File $script -Init
if ($LASTEXITCODE -ne 0) { Write-Host 'Init failed' -ForegroundColor Red; exit 1 }

if (-not (Test-Path -LiteralPath $state -PathType Leaf)) { Write-Host 'State file not created' -ForegroundColor Red; exit 1 }

function Read-State { Get-Content -LiteralPath $state -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable }

$s = Read-State
if (-not $s.ContainsKey('currentIndex') -or -not $s.ContainsKey('tasks')) { Write-Host 'State missing keys' -ForegroundColor Red; exit 1 }
$curIdx = [int]$s.currentIndex
$cur = @($s.tasks)[$curIdx]
if ($null -eq $cur) { Write-Host 'Current task not found' -ForegroundColor Red; exit 1 }

& pwsh -NoProfile -File $script -Start
$s = Read-State
$cur = @($s.tasks)[$curIdx]
if ($cur.status -ne 'in_progress' -and $cur.status -ne 'done') { Write-Host 'Start did not set status to in_progress/done' -ForegroundColor Red; exit 1 }

& pwsh -NoProfile -File $script -Complete
$s = Read-State
$cur = @($s.tasks)[$curIdx]
if ($cur.status -ne 'done') { Write-Host 'Complete did not set status to done' -ForegroundColor Red; exit 1 }

& pwsh -NoProfile -File $script -Next
$s = Read-State
$newIdx = [int]$s.currentIndex
if ($newIdx -eq $curIdx) { Write-Host 'Next did not advance to a new task' -ForegroundColor Red; exit 1 }

Write-Host 'Agent state smoke test PASS: init/start/complete/next transitions OK.' -ForegroundColor Green
exit 0
