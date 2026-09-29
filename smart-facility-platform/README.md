# 智慧设施平台（本地演示副本）

Vue 2 第二版 Web 工程的本地演示副本，用于展示已接入的中控地图、设备详情/历史曲线与告警处理等链路。本目录可脱敏修改，**不是**生产部署包，也不连接原公司业务服务。

更完整的背景与履历表述见仓库根目录 `docs/PROJECT_CONTEXT.md`。

## 启动演示

```powershell
npm run demo
```

端口以终端为准。账号、开放路由与操作路径见 `docs/demo-guide.md`。

## 限制（本批已对齐）

- 演示模式走统一 Mock 与 CSP，禁止直连远程业务服务或旧工具包入口。
- 演示模式不加载外部地图 SDK；运输地图页会明确提示未接入。
- 文件上传组件保留 UI，但未接入存储：选择文件时提示不可用，不伪造成功，不回退到原上传目标。
- 非演示 `serve` / `build` 脚本仍保留历史工程结构；本地代理仅指向本机占位地址，不得配置为原内部服务。

## 验证

```powershell
npm run test:demo -- --watch=false
npm run test:demo:browser
```

浏览器回归要求外部应用请求与未捕获异常均为 0（需本机已启动演示服务）。

## 自定义配置

通用 Vue CLI 配置见官方文档。演示相关见 `config/demo.js`、`.env.demo` 与 `docs/` 下交接文档。

品牌元数据、素材与 XLS 等后续分批处理，见 `docs/precommit-content-audit.md`。
