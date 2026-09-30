# 仓库内容审查清单（2026-09-29，素材批更新 2026-09-30）

## 范围与结论

脱敏分三批推进；小程序尚未放入。未找到适用 AGENTS.md。

**结论（持续）：工作区品牌图与导入模板已替换为演示合成物；公开推送仍受历史提交中地图 Key、以及未逐一 OCR 的装饰性 UI 图等限制。** 不输出原始配置值；不重写 Git 历史；不声称凭证已失效。GLB 第三方署名保留。

**第一批：** 地图 Key / 上传目标 / README·代理。  
**第二批：** package·i18n·客户路径·注释地址·样例数据；微信未接入文案已补修。  
**第三批（本批）：** 登录/首页/楼宇品牌 PNG、favicon、微信占位图；28 份 XLS 改为合成空表；iconfont 演示页去掉外链 CDN；生成脚本可复现。

## 按优先级分类

| 优先级 / 分类 | 文件依据 | 发现和建议 | 处理状态 |
| --- | --- | --- | --- |
| P1 地图 Key / 上传 / README | 见前批 | — | **已处理** |
| P1 历史地图 Key | 历史提交 | 不重写历史 | **仍待核实** |
| P2 元数据与文本 | package / i18n / 客户路径等 | — | **已处理** |
| P2 / 替换 | logo*、company-title*、building-logo、favicon、微信相关图 | 自制通用标识 | **已演进**：活动 chrome 用 `facility-logo.svg` + 活字标题；六份旧 PNG 已删；`--replace-brand` 已移除；微信「未接入」占位保留；`npm run demo:favicon` / `demo:brand` |
| P2 / 待核实→替换 | public/static 28 份 XLS | 重建合成模板 | **已调整**：伪 HTML XLS 已移除；模板下载提示未接入；不保留 demo:xls |
| P2 / 字体演示页外链 | iconfontSource/demo* | 去掉 CDN | **本批已处理**：本地 stub；运行时仍用本地 woff/ttf |
| P2 / 待核实 | DataV/中控等大量装饰 PNG、iconfont 字形 | 未做完整 OCR/许可核验 | **部分残留**：非品牌 wordmark 的 UI 图未整批替换；iconfont 字形许可未重新核验 |
| 保留 | demo floors/devices SVG、Mock、GLB 署名 | — | **保留** |
| 延后 | ChuxouUpload 目录名 | — | **延后** |

## 环境与验证（第三批）

- 未安装新依赖；品牌图由本机 System.Drawing 经脚本生成。
- 单测 11/65 通过；Edge 回归 `externalAttempts: 0`。
- 未对每一张 DataV 装饰图做 OCR；不能据此批准「全部素材已安全」。

## 下一轮最小修改建议

1. ~~配置与地址 / 元数据文本 / 关键品牌图与 XLS~~ → 已完成。  
2. 可选：继续审查 DataV/中控装饰图与 iconfont 字形许可；清理客户专用死 helper；历史 Key 轮换。  
3. 用户决定是否提交本批并是否公开推送（历史 Key 仍在）。
