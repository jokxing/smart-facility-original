/**
 * Generate generic demo WeChat placeholders + favicon without npm installs.
 * Uses Windows System.Drawing via PowerShell.
 *
 * Active chrome logos use facility-logo.svg / favicon.svg (hand-authored).
 * This script does NOT regenerate those SVGs or any legacy logo/title PNGs.
 *
 *   node scripts/generate-demo-brand-assets.cjs              # WeChat placeholders + favicon
 *   node scripts/generate-demo-brand-assets.cjs --favicon-only
 */
const {spawnSync} = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const systemImages = path.join(root, 'src/assets/systemImages');
const publicDir = path.join(root, 'public');
const loginImages = path.join(root, 'src/assets/loginImages');
const faviconOnly = process.argv.includes('--favicon-only');

if (process.argv.includes('--replace-brand')) {
  console.error('Removed: --replace-brand no longer generates legacy logo/title PNGs.');
  console.error('Active marks are facility-logo.svg and favicon.svg. Aborting.');
  process.exit(1);
}

const ps = `
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

function Save-Png($bmp, $path) {
  $dir = Split-Path $path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

function New-Placeholder($path, $w, $h, $text) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#2a2a2a'))
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#9e9e9e'))
  $font = New-Object System.Drawing.Font 'Microsoft YaHei', 14
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = 'Center'
  $sf.LineAlignment = 'Center'
  $g.DrawString($text, $font, $brush, (New-Object System.Drawing.RectangleF 8,8,($w-16),($h-16)), $sf)
  $g.Dispose(); $brush.Dispose(); $font.Dispose()
  Save-Png $bmp $path
}

function New-Favicon($path) {
  $dir = Split-Path $path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $bmp = New-Object System.Drawing.Bitmap 32, 32
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.SmoothingMode = 'AntiAlias'
  $g.ScaleTransform(0.5, 0.5)
  $outline = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#168aad')), 7
  $inner = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#69e1ed')), 3
  foreach ($pen in @($outline, $inner)) {
    $pen.StartCap = 'Round'; $pen.EndCap = 'Round'; $pen.LineJoin = 'Round'
    $g.DrawLines($pen, [System.Drawing.PointF[]]@((New-Object System.Drawing.PointF 8,54),(New-Object System.Drawing.PointF 8,22),(New-Object System.Drawing.PointF 28,10),(New-Object System.Drawing.PointF 28,54)))
    $g.DrawLines($pen, [System.Drawing.PointF[]]@((New-Object System.Drawing.PointF 28,30),(New-Object System.Drawing.PointF 48,20),(New-Object System.Drawing.PointF 48,54)))
    $g.DrawLine($pen,4,54,54,54)
  }
  $g.DrawLine($inner,17,27,17,32); $g.DrawLine($inner,17,40,17,45); $g.DrawLine($inner,38,35,38,40)
  $nodeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#168aad'))
  $nodePen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#c8fbff')), 2
  $g.FillEllipse($nodeBrush,43,15,10,10); $g.DrawEllipse($nodePen,43,15,10,10)
  $outline.Dispose(); $inner.Dispose(); $nodeBrush.Dispose(); $nodePen.Dispose()
  $icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
  # File.Create truncates; OpenWrite does not and leaves old ICO tails.
  $fs = [System.IO.File]::Create($path)
  try {
    $icon.Save($fs)
    $fs.Flush()
  } finally {
    $fs.Close()
    $fs.Dispose()
  }
  $icon.Dispose(); $g.Dispose(); $bmp.Dispose()
}

$sys = '${systemImages.replace(/\\/g, '\\\\')}'
$pub = '${publicDir.replace(/\\/g, '\\\\')}'
$login = '${loginImages.replace(/\\/g, '\\\\')}'
$faviconOnly = ${faviconOnly ? '$true' : '$false'}

if ($faviconOnly) {
  New-Favicon (Join-Path $pub 'favicon.ico')
  Write-Host 'favicon-only written'
  exit 0
}

New-Placeholder (Join-Path $sys 'official-account.png') 200 200 "演示未接入\`n公众号"
New-Placeholder (Join-Path $sys 'official-account-msg.png') 200 200 "演示未接入\`n消息提醒"
New-Placeholder (Join-Path $sys 'qrcode.png') 200 200 "演示未接入\`n二维码"
New-Placeholder (Join-Path $login 'weixin.png') 240 240 "演示未接入\`n微信登录"
New-Favicon (Join-Path $pub 'favicon.ico')
Write-Host 'brand assets written'
`;

const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], {
  encoding: 'utf8',
  windowsHide: true
});
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.status !== 0) {
  console.error('Failed to generate brand assets');
  process.exit(result.status || 1);
}
if (faviconOnly) {
  console.log('OK: favicon-only regenerated at public/favicon.ico');
} else {
  console.log('OK: WeChat placeholders + favicon regenerated (SVGs untouched)');
}
