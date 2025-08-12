Param(
  [switch]$EmitJson = $true
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
}

# Load JSON configs if possible
$rulesObj = $null; $rulesRaw = ''
try {
  $rulesRaw = Get-Content -LiteralPath $paths.Rules -Raw -Encoding UTF8
  $rulesObj = $rulesRaw | ConvertFrom-Json -AsHashtable
} catch {}

$contextObj = $null; $contextRaw = ''
try {
  $contextRaw = Get-Content -LiteralPath $paths.Context -Raw -Encoding UTF8
  $contextObj = $contextRaw | ConvertFrom-Json -AsHashtable
} catch {}

# Load prompt and MCP config as raw text
$prompt = Get-Content -LiteralPath $paths.Prompt -Raw -Encoding UTF8
$mcpRaw = Get-Content -LiteralPath $paths.MCP -Raw -Encoding UTF8

# Load and parse tasks from Markdown bullets or ordered lists
$tasksRaw = Get-Content -LiteralPath $paths.Tasks -Raw -Encoding UTF8
$taskLines = @()
$tasksRaw -split "`r?`n" | ForEach-Object {
  $line = $_.Trim()
  if ($line -match '^(?:[-*]\s+|\d+\.\s+)(.+)$') {
    $taskLines += ($Matches[1].Trim())
  }
}
$tasksParsed = @()
for ($i = 0; $i -lt $taskLines.Count; $i++) {
  $tasksParsed += [pscustomobject]@{
    index = $i
    text  = $taskLines[$i]
  }
}

# Human-readable summary
Write-Host 'Single-agent runner' -ForegroundColor Cyan
Write-Host (" - Prompt: {0} chars" -f ($prompt.Length))
Write-Host (" - MCP config: {0} chars" -f ($mcpRaw.Length))
if ($rulesObj -ne $null) {
  Write-Host (" - Rules keys: {0}" -f ([string]::Join(', ', $rulesObj.Keys)))
} else { Write-Host ' - Rules: JSON parse skipped/failed' }
if ($contextObj -ne $null) {
  Write-Host (" - Context keys: {0}" -f ([string]::Join(', ', $contextObj.Keys)))
} else { Write-Host ' - Context: JSON parse skipped/failed' }
Write-Host (" - Tasks detected: {0}" -f $tasksParsed.Count)
if ($tasksParsed.Count -gt 0) {
  $tasksParsed | Select-Object -First 3 | ForEach-Object {
    Write-Host ("   * {0}" -f $_.text)
  }
}

# Optional JSON artifacts
if ($EmitJson) {
  New-Item -ItemType Directory -Force -Path $paths.BuildDir | Out-Null
  $statusObj = [pscustomobject]@{
    timestamp        = (Get-Date).ToString('o')
    promptPath       = (Resolve-Path $paths.Prompt).Path
    promptLength     = $prompt.Length
    mcpConfigPath    = (Resolve-Path $paths.MCP).Path
    mcpConfigLength  = $mcpRaw.Length
    rulesPath        = (Resolve-Path $paths.Rules).Path
    contextPath      = (Resolve-Path $paths.Context).Path
    tasksPath        = (Resolve-Path $paths.Tasks).Path
    numTasks         = $tasksParsed.Count
  }
  $tasksObj = [pscustomobject]@{ tasks = $tasksParsed }

  $statusJson = $statusObj | ConvertTo-Json -Depth 6
  $tasksJson  = $tasksObj | ConvertTo-Json -Depth 6

  Set-Content -LiteralPath (Join-Path $paths.BuildDir 'agent-status.json') -Value $statusJson -Encoding UTF8
  Set-Content -LiteralPath (Join-Path $paths.BuildDir 'tasks.json')        -Value $tasksJson  -Encoding UTF8
  Write-Host (" - Wrote build artifacts to {0}" -f $paths.BuildDir)
}

exit 0
