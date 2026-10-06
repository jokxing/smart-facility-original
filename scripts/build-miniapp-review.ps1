$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$compilerRoot = 'F:\应用\HBuilderX\plugins\uniapp-cli'
$compilerNode = 'F:\应用\HBuilderX\plugins\node18\node.exe'
$env:UNI_INPUT_DIR = Join-Path $taskRoot 'miniprogram'
$env:UNI_OUTPUT_DIR = Join-Path $taskRoot 'miniprogram\unpackage\review\mp-weixin'
$env:UNI_PLATFORM = 'mp-weixin'
$env:NODE_ENV = 'production'
$env:UNI_CLI_CONTEXT = $compilerRoot
$env:VUE_CLI_CONTEXT = $compilerRoot
$env:UNI_HBUILDERX_PLUGINS = 'F:\应用\HBuilderX\plugins'
Push-Location -LiteralPath $compilerRoot
try {
  & $compilerNode (Join-Path $compilerRoot 'bin\uniapp-cli.js')
  if ($LASTEXITCODE -ne 0) { throw "Miniapp compilation failed: $LASTEXITCODE" }
} finally {
  Pop-Location
}
