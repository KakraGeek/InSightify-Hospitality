Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) '..')

$route = Join-Path $root 'app/api/auth/[...nextauth]/route.ts'
$options = Join-Path $root 'lib/auth/options.ts'

$missing = @()
foreach ($p in @($route,$options)) { if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { $missing += $p } }
if ($missing.Count -gt 0) {
  Write-Host 'Missing auth files:' -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

$routeContent = Get-Content -LiteralPath $route -Raw -Encoding UTF8
if ($routeContent -notmatch 'NextAuth' -or $routeContent -notmatch 'export\s+\{\s*handler\s+as\s+GET') {
  Write-Host 'Auth route missing NextAuth handler or GET export' -ForegroundColor Red
  exit 1
}

$optionsContent = Get-Content -LiteralPath $options -Raw -Encoding UTF8
$hasCreds = ($optionsContent -match 'CredentialsProvider')
$hasJwt = ($optionsContent -match 'session') -and ($optionsContent -match 'strategy') -and ($optionsContent -match 'jwt')
if (-not ($hasCreds -and $hasJwt)) {
  Write-Host 'Auth options missing credentials provider or JWT session strategy' -ForegroundColor Red
  exit 1
}

Write-Host 'Auth foundation smoke test PASS.' -ForegroundColor Green
exit 0
