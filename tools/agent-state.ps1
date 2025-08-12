Param(
  [switch]$Init,
  [switch]$Current,
  [switch]$Start,
  [switch]$Complete,
  [switch]$Next,
  [int]$SetIndex = -1
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$paths = @{
  Prompt   = Join-Path $root 'smart-prompts/agent.md'
  MCP      = Join-Path $root 'mcp/project.mcp.yaml'
  TasksMd  = Join-Path $root 'tasks.md'
  BuildDir = Join-Path $root 'build'
  State    = Join-Path $root 'build/state.json'
}

function Parse-TasksFromMarkdown {
  Param([string]$markdown)
  $tasks = @()
  $lines = $markdown -split "`r?`n"
  $idx = 0
  foreach ($line in $lines) {
    $trim = $line.Trim()
    if ($trim -match '^(?:[-*]|\d+\.)\s+\[(?<checked>[ xX])\]\s+(?<text>.+)$') {
      $tasks += [pscustomobject]@{
        index  = $idx
        text   = $Matches['text'].Trim()
        status = ((($Matches['checked']) -match 'x|X') ? 'done' : 'todo')
      }
      $idx++
    } elseif ($trim -match '^(?:[-*]|\d+\.)\s+(?<text>.+)$') {
      $tasks += [pscustomobject]@{
        index  = $idx
        text   = $Matches['text'].Trim()
        status = 'todo'
      }
      $idx++
    }
  }
  return ,$tasks
}

function Read-State {
  if (Test-Path -LiteralPath $paths.State -PathType Leaf) {
    try { return (Get-Content -LiteralPath $paths.State -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable) } catch {}
  }
  return $null
}

function Write-State {
  Param([hashtable]$state)
  New-Item -ItemType Directory -Force -Path $paths.BuildDir | Out-Null
  ($state | ConvertTo-Json -Depth 8) | Set-Content -LiteralPath $paths.State -Encoding UTF8
}

function Init-State {
  $tasksRaw = Get-Content -LiteralPath $paths.TasksMd -Raw -Encoding UTF8
  $parsed = Parse-TasksFromMarkdown -markdown $tasksRaw
  if ($parsed.Count -eq 0) { throw 'No tasks parsed from tasks.md' }
  $firstTodo = ($parsed | Where-Object { $_.status -ne 'done' } | Select-Object -First 1)
  $currentIndex = if ($firstTodo) { $firstTodo.index } else { 0 }
  $state = @{
    timestamp    = (Get-Date).ToString('o')
    promptPath   = (Resolve-Path $paths.Prompt).Path
    mcpConfig    = (Resolve-Path $paths.MCP).Path
    numTasks     = $parsed.Count
    currentIndex = $currentIndex
    tasks        = @()
  }
  foreach ($t in $parsed) {
    $state.tasks += @{ index = $t.index; text = $t.text; status = $t.status }
  }
  Write-State -state $state
  return $state
}

function Ensure-State { $s = Read-State; if ($null -eq $s) { $s = Init-State }; return $s }

function Get-CurrentTask {
  Param([hashtable]$state)
  $idx = [int]$state.currentIndex
  $tasks = @($state.tasks)
  if ($idx -ge 0 -and $idx -lt $tasks.Count) { return $tasks[$idx] }
  return $null
}

# Entry points
if ($Init) {
  $s = Init-State
  Write-Host ("Initialized state with {0} tasks. Current index: {1}" -f $s.numTasks, $s.currentIndex) -ForegroundColor Green
  exit 0
}

$s = Ensure-State

if ($SetIndex -ge 0) {
  $count = [int]$s.numTasks
  if ($SetIndex -ge $count) {
    Write-Host ("SetIndex out of range. Must be 0..{0}" -f ($count - 1)) -ForegroundColor Red
    exit 1
  }
  $s.currentIndex = [int]$SetIndex
  Write-State -state $s
  Write-Host ("Set current index to {0}" -f $s.currentIndex) -ForegroundColor Cyan
  exit 0
}

if ($Current) {
  $cur = Get-CurrentTask -state $s
  if ($cur -ne $null) { Write-Host ("Current [{0}] {1} - {2}" -f $cur.index, $cur.status, $cur.text) } else { Write-Host 'No current task' }
  exit 0
}

if ($Start) {
  $cur = Get-CurrentTask -state $s
  if ($cur -ne $null -and $cur.status -eq 'todo') { $cur.status = 'in_progress'; Write-State -state $s; Write-Host 'Marked current task in_progress' -ForegroundColor Yellow; exit 0 }
  Write-Host 'No todo task to start (maybe already in_progress or done)' -ForegroundColor DarkYellow
  exit 0
}

if ($Complete) {
  $cur = Get-CurrentTask -state $s
  if ($cur -ne $null -and $cur.status -ne 'done') { $cur.status = 'done'; Write-State -state $s; Write-Host 'Marked current task done' -ForegroundColor Green; exit 0 }
  Write-Host 'No current task to complete (maybe already done)' -ForegroundColor DarkYellow
  exit 0
}

if ($Next) {
  $tasks = @($s.tasks)
  $nextTask = $tasks | Where-Object { $_.status -ne 'done' -and $_.index -gt [int]$s.currentIndex } | Select-Object -First 1
  if (-not $nextTask) { $nextTask = $tasks | Where-Object { $_.status -ne 'done' -and $_.index -lt [int]$s.currentIndex } | Select-Object -First 1 }
  if ($nextTask) {
    $s.currentIndex = [int]$nextTask.index
    Write-State -state $s
    Write-Host ("Moved to next task index: {0}" -f $s.currentIndex) -ForegroundColor Cyan
    exit 0
  } else {
    Write-Host 'No remaining todo tasks' -ForegroundColor DarkYellow
    exit 0
  }
}

# Default: show brief summary
Write-Host ("State: {0} tasks, current index {1}" -f $s.numTasks, $s.currentIndex)
$cur = Get-CurrentTask -state $s
if ($cur -ne $null) { Write-Host (" - Current: [{0}] {1} - {2}" -f $cur.index, $cur.status, $cur.text) }
exit 0
