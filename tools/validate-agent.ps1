Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSCommandPath
$root = Resolve-Path (Join-Path $root '..')

$requiredFiles = @(
  '.cursor/rules.json',
  '.cursor/context.json',
  'smart-prompts/agent.md',
  'mcp/project.mcp.yaml',
  'tasks.md'
)

$problems = @()

foreach ($rel in $requiredFiles) {
  $path = Join-Path $root $rel
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    $problems += "Missing: $rel"
    continue
  }
  try {
    $item = Get-Item -LiteralPath $path
    if ($item.Length -eq 0) {
      $problems += "Empty file: $rel"
    }
  } catch {
    $problems += "Unreadable: $rel (`$($_.Exception.Message)`)"
  }
}

# Stronger checks when files exist
# JSON validity for .cursor files
foreach ($jsonRel in @('.cursor/rules.json','.cursor/context.json')) {
  $path = Join-Path $root $jsonRel
  if (Test-Path -LiteralPath $path -PathType Leaf) {
    try { Get-Content -LiteralPath $path -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable | Out-Null }
    catch { $problems += "Invalid JSON: $jsonRel (`$($_.Exception.Message)`)" }
  }
}

# tasks.md must contain at least one list item
$tasksPath = Join-Path $root 'tasks.md'
if (Test-Path -LiteralPath $tasksPath -PathType Leaf) {
  try {
    $tasksRaw = Get-Content -LiteralPath $tasksPath -Raw -Encoding UTF8
    $hasList = $false
    foreach ($line in ($tasksRaw -split "`r?`n")) {
      if ($line.Trim() -match '^(?:[-*]|\d+\.)\s+') { $hasList = $true; break }
    }
    if (-not $hasList) { $problems += 'tasks.md contains no list items' }
  } catch { $problems += "Unable to read tasks.md (`$($_.Exception.Message)`)" }
}

if ($problems.Count -gt 0) {
  Write-Host "Single-agent workflow validation FAILED:" -ForegroundColor Red
  $problems | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
} else {
  Write-Host "Single-agent workflow validation OK" -ForegroundColor Green
  Write-Host " - Loaded working prompt: smart-prompts/agent.md"
  Write-Host " - MCP config present:   mcp/project.mcp.yaml"
  Write-Host " - Cursor context:       .cursor/context.json (valid JSON)"
  Write-Host " - Cursor rules:         .cursor/rules.json (valid JSON)"
  Write-Host " - Task plan:            tasks.md (lists detected)"
  exit 0
}
