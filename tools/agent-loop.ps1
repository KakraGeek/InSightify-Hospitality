Param(
  [int]$TaskIndex = -1
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$paths = @{
  Rules   = Join-Path $root '.cursor/rules.json'
  Context = Join-Path $root '.cursor/context.json'
  Prompt  = Join-Path $root 'smart-prompts/agent.md'
  MCP     = Join-Path $root 'mcp/project.mcp.yaml'
  Tasks   = Join-Path $root 'tasks.md'
  BuildDir = Join-Path $root 'build'
  State    = Join-Path $root 'build/state.json'
}

# Load minimal inputs
$rulesObj = $null; $contextObj = $null
try { $rulesObj   = Get-Content -LiteralPath $paths.Rules   -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable } catch {}
try { $contextObj = Get-Content -LiteralPath $paths.Context -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable } catch {}
$prompt = Get-Content -LiteralPath $paths.Prompt -Raw -Encoding UTF8
$mcpRaw = Get-Content -LiteralPath $paths.MCP -Raw -Encoding UTF8
$tasksRaw = Get-Content -LiteralPath $paths.Tasks -Raw -Encoding UTF8

function Parse-Tasks {
  Param([string]$markdown)
  $tasksParsed = @()
  $lines = $markdown -split "`r?`n"
  $idx = 0
  foreach ($line in $lines) {
    $trim = $line.Trim()
    if ($trim -match '^(?:[-*]|\d+\.)\s+\[(?<checked>[ xX])\]\s+(?<text>.+)$') {
      $tasksParsed += [pscustomobject]@{
        index   = $idx
        text    = $Matches['text'].Trim()
        checked = (($Matches['checked']) -match 'x|X')
      }
      $idx++
    } elseif ($trim -match '^(?:[-*]|\d+\.)\s+(?<text>.+)$') {
      $tasksParsed += [pscustomobject]@{
        index   = $idx
        text    = $Matches['text'].Trim()
        checked = $false
      }
      $idx++
    }
  }
  return ,$tasksParsed
}

# Prefer persisted state if present
$state = $null
if (Test-Path -LiteralPath $paths.State -PathType Leaf) {
  try { $state = Get-Content -LiteralPath $paths.State -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable } catch {}
}

$currentTask = $null
$numTasks = 0
$currentStatus = $null

if ($state -ne $null -and $state.ContainsKey('tasks')) {
  $numTasks = [int]$state.numTasks
  $sel = [int]$state.currentIndex
  if ($TaskIndex -ge 0 -and $TaskIndex -lt $state.tasks.Count) { $sel = $TaskIndex }
  $task = @($state.tasks) | Where-Object { $_.index -eq $sel } | Select-Object -First 1
  if ($task) { $currentTask = $task; $currentStatus = $task.status }
} else {
  $parsed = Parse-Tasks -markdown $tasksRaw
  $numTasks = $parsed.Count
  $sel = $TaskIndex
  if ($sel -lt 0 -or $sel -ge $parsed.Count) {
    $firstUnchecked = $parsed | Where-Object { -not $_.checked } | Select-Object -First 1
    if ($firstUnchecked) { $sel = $firstUnchecked.index } else { $sel = 0 }
  }
  $currentTask = $parsed | Where-Object { $_.index -eq $sel } | Select-Object -First 1
  if ($currentTask) { $currentStatus = ($currentTask.checked ? 'done' : 'todo') }
}

Write-Host 'Agent loop tick' -ForegroundColor Cyan
Write-Host (" - Prompt: {0} chars" -f ($prompt.Length))
Write-Host (" - MCP config: {0} chars" -f ($mcpRaw.Length))
Write-Host (" - Tasks: {0}" -f $numTasks)
if ($currentTask -ne $null) {
  Write-Host (" - Selected task [{0}]: {1}" -f $currentTask.index, $currentTask.text)
  if ($currentStatus) { Write-Host (" - Status: {0}" -f $currentStatus) }
} else {
  Write-Host ' - No tasks detected'
}

# Emit tick artifact
New-Item -ItemType Directory -Force -Path $paths.BuildDir | Out-Null
$tick = [pscustomobject]@{
  timestamp     = (Get-Date).ToString('o')
  promptPath    = (Resolve-Path $paths.Prompt).Path
  mcpConfigPath = (Resolve-Path $paths.MCP).Path
  numTasks      = $numTasks
  currentTask   = $currentTask
  status        = $currentStatus
}

$tick | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $paths.BuildDir 'agent-tick.json') -Encoding UTF8
Write-Host (" - Wrote tick artifact: {0}" -f (Join-Path $paths.BuildDir 'agent-tick.json'))

exit 0
