param(
  [ValidateSet('h5', 'mp-weixin', 'app-plus')][string]$Platform = 'h5',
  [string]$HBuilderRoot = $env:HBUILDERX_ROOT
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
if (!$HBuilderRoot) {
  $candidates = @('F:\应用\HBuilderX', 'C:\Program Files\HBuilderX', 'E:\Program Files\HBuilderX')
  $HBuilderRoot = $candidates | Where-Object { Test-Path -LiteralPath (Join-Path $_ 'plugins\uniapp-cli\bin\uniapp-cli.js') } | Select-Object -First 1
}
if (!$HBuilderRoot) { throw 'Set HBUILDERX_ROOT or pass -HBuilderRoot to an installed HBuilderX with the uni-app Vue 2 compiler.' }
$compilerRoot = Join-Path $HBuilderRoot 'plugins\uniapp-cli'
$compilerNode = Join-Path $HBuilderRoot 'plugins\node18\node.exe'
if (!(Test-Path -LiteralPath $compilerNode)) { $compilerNode = (Get-Command node -ErrorAction Stop).Source }
$env:UNI_INPUT_DIR = Join-Path $taskRoot 'miniprogram'
$env:UNI_OUTPUT_DIR = Join-Path $taskRoot "miniprogram\unpackage\dist\build\$Platform"
$env:UNI_PLATFORM = $Platform
$env:NODE_ENV = 'production'
$env:UNI_CLI_CONTEXT = $compilerRoot
$env:VUE_CLI_CONTEXT = $compilerRoot
$env:UNI_HBUILDERX_PLUGINS = Join-Path $HBuilderRoot 'plugins'
Push-Location -LiteralPath $compilerRoot
try {
  & $compilerNode (Join-Path $compilerRoot 'bin\uniapp-cli.js')
  if ($LASTEXITCODE -ne 0) { throw "$Platform compilation failed: $LASTEXITCODE" }
  Write-Output "Compiled $Platform -> $env:UNI_OUTPUT_DIR"
} finally { Pop-Location }
