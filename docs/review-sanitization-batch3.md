# 第三批未提交复盘（2026-09-30）

结论：先修本批生成器和产物问题，再提交；未处理的装饰图/字体授权可单独继续。此次只核对差异、生成器、图片视觉和二进制结构，未重新运行素材生成器、单测或浏览器，未改业务/素材。

## P1：favicon 仍保留旧文件尾部

scripts/generate-demo-brand-assets.cjs 曾用 File.OpenWrite，覆盖已有文件但不截断。当时 favicon.ico 长 4286 字节，新 ICO 目录引用的数据仅到 766 字节，余下 3520 字节逐字节等于 HEAD 旧图标同偏移尾部。

必须使用 File.Create 或显式截断，重新生成后断言文件长度等于图标目录引用终点（或其他明确允许的结构），确保不携带旧尾部。不能只看浏览器图标变了就宣称原素材字节已移除。

### 处理（2026-09-30）

- `New-Favicon` 改为 `[IO.File]::Create`；新增 `--favicon-only` / `npm run demo:favicon`，本轮只重写 `public/favicon.ico`，未跑完整素材生成，未覆盖已恢复的六份 Logo/标题。
- 连续两次生成：长度均为 **766**；ICO `type=1`、`count=1`、条目 `32×32`、`imageOffset=22`、`bytesInRes=744`、`blockEnd=766`，`length === blockEnd`。
- 与 HEAD 旧文件（4286）对比：长度不同；不存在「766 起旧尾部」残留。DIB 签名 `biSize=40`，位图块合法。
- 预览：由 ICO 导出 `public/demo/brand/favicon-preview.png`，可见深蓝底白字 **SF**。
- 六份已恢复品牌图 git 状态未变（仍为原品牌，未脱敏）。

## P2：Logo 与标题透明背景丢失

生成器 New-Title:48 清为 Black，New-Logo 调用也传入黑色。已直接查看 company-title.png、logo2.png，确认都是不透明黑矩形。Dashboard.vue:38–41 将这些图叠在原页面背景上，会带来黑色贴片，与保留页面视觉目标冲突。

建议恢复透明背景，透明图避免 ClearType 黑色边缘；重新检查中英文标题、首页、楼宇页截图，而非仅运行不检查像素的功能回归。

## P2：文件扩展名与真实编码不符

- loginImages/weixin.jpg 的签名字节是 PNG；生成器 New-Placeholder 始终用 Save-Png。改成真正 JPEG，或同步修改扩展名和引用，不依赖浏览器嗅探。
- 28 份 .xls 全部以 HTML 开头，统一 demo_col_1/2/3，并额外含 TEMPLATE 占位行。它们不是原有字段契约的 Excel 空模板，可能触发格式警告，也不能证明导入兼容。README 已声明不保证业务 schema，这限制应继续保留。
- 若本轮仅清理未开放模板，优先明确隔离/移除不可下载资源及对应非演示入口；若保留 .xls，生成真实格式并使用经审核的字段定义。不应以占位 HTML 冒充“合成空表已完成”。脚本还匹配 .xlsx，未来会写入同样 HTML，需同时约束。

## P2：生成器注释对 Git 历史描述不准确

generate-demo-xls.cjs:3 声称 clears original workbook bytes from git。它只覆盖工作区文件，不修改已有提交；应明确旧工作簿仍在历史中，勿与历史 Key 清理混淆。

## 可保留及残留

- iconfont 演示页去外部 CDN、字体运行时本地引用、GLB 署名保留，方向正确。
- package 只新增两条生成命令，不增加依赖；无需仅为 scripts 改动重建锁文件。
- 通用标识/未接入占位方向可保留，先修上述生成问题，不需回退全部第三批。
- DataV 装饰图 OCR/授权、iconfont 字形授权、旧 Git 历史内容尚未处理；不把这些残留误写成已完成，也不据此确认公开推送安全。

建议另 AI 的下一小批只修以上问题并补字节/格式/视觉验证，完成后停止，暂不同时替换所有装饰素材。
# 最新补充：P2 文件格式已处理（2026-09-30）

微信 PNG 使用正确 .png 后缀，引用和生成器同步。28 份 HTML 伪 XLS、生成脚本及命令已移除；模板下载明确未接入，不发起下载。真实 Excel 模板尚未实现，不清除 Git 历史。12 套 67 项单测通过；favicon P1 待另 AI 处理，恢复的原品牌仍未脱敏。

# 最新补充：新 Logo 验收与旧 PNG 移除（2026-09-30）

- P2 黑底 Logo/标题：页面已改用 `facility-logo.svg` + 首页活字标题，不再依赖 company-title/logo PNG。六份旧 PNG 经全仓静态检索无 Vue/JS 引用后删除；`--replace-brand` 删除。
- favicon P1 截断修复保持；新增 favicon.svg；品牌 UI Edge 脚本通过，截图见 `public/demo/brand/ui-shots/`。
- 残留不变：DataV 装饰图/字形许可、Git 历史中的旧品牌字节与地图 Key；不可据此批准公开推送。
- 未自动提交。
# 品牌验收收尾（2026-09-30）

已修正浏览器验收等待条件与演示语言存储键读取，并通过本地 Edge 1440×900 实测。中英文登录/首页、楼宇、后台导航截图移至 docs/evidence/brand-ui；旧 public 截图移除。楼宇和导航稳定后没有原截图中的叠层。favicon SVG/ICO 均加载解码且透明角点断言通过。此项验收关闭，其他素材残留、许可与历史脱敏不属于已完成结论，见下一任务第四批提示词。
