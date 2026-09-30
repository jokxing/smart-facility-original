# Demo brand assets

Final brand UI verification (2026-09-30): local Edge at 1440x900 passed after waiting for route transitions, visible logos and the building scene. Real Chinese/English menu switching was verified on login/dashboard. Both favicon resources were fetched, decoded and checked for transparent corners. Stable screenshots live in `docs/evidence/brand-ui` at repository root; obsolete public UI screenshots were removed. The earlier building/dashboard overlap was a premature capture, not reproduced after settling. Historical browser cache and other viewport sizes are not covered.

Active chrome logos use `src/assets/systemImages/facility-logo.svg` (building/node + SF, transparent). Dashboard titles are live text (`智慧设施智能监控平台` / `Smart Facility Monitoring`). Login title uses i18n `login.companyName`（智慧设施 / Smart Facility）. Navbar falls back to the SVG when demo `getLogo` returns empty `logoUrl`. `public/favicon.svg` and truncated `public/favicon.ico` share the building mark.

## Removed legacy PNGs (2026-09-30)

After a full static/dynamic reference search, these unused files were deleted from the tree (still present in Git history):

- `src/assets/systemImages/logo.png`
- `src/assets/systemImages/logo2.png`
- `src/assets/systemImages/logo-gold.png`
- `src/assets/systemImages/company-title.png`
- `src/assets/systemImages/company-title1.png`
- `src/assets/centerControl/building-logo.png`

`--replace-brand` was removed from `scripts/generate-demo-brand-assets.cjs`; invoking it now exits with an error. The generator only refreshes WeChat placeholders + favicon.

## Remaining placeholders

| File | Role |
| --- | --- |
| `src/assets/systemImages/qrcode.png` etc. | WeChat UI placeholders（演示未接入） |
| `src/assets/loginImages/weixin.png` | WeChat login placeholder |
| `public/favicon.ico` | Demo favicon（`npm run demo:favicon`；File.Create 截断） |
| `public/favicon.svg` | SVG favicon |
| `public/demo/brand/favicon-preview.png` | ICO preview |
| `public/demo/brand/ui-shots/` | Brand UI acceptance screenshots |

```powershell
npm run demo:favicon
node scripts/generate-demo-brand-assets.cjs
# optional local acceptance (demo must be running):
node scripts/check-demo-brand-ui.cjs
```

Does not cover third-party glyph/decoration licensing or Git history sanitization.
