# 2026-11-03 PDF Dark 启用并行错误采集

- 用户授权开启采集并次日人工查看；没有新增定时任务或邮件。
- 正式部署：`dpl_CPjTVVqZhXDhnAPucCaWTLVNrvfk`，`https://pdfdark.org`；版本标签 `pdf-pulse-20261103-f5730a7c`。基于HEAD93c931b的干净源码，只覆盖6个接入生产文件；旧instrumentation-client/pdf-monitoring/client-diagnostics改动未发布。此次为手动部署，未提交推送Git。
- 生产环境变量 `NEXT_PUBLIC_PULSE_ERRORS=true` 已保存，需要新build生效。`NEXT_PUBLIC_PULSE_RELEASE` 为本次build-only版本标签，优先于Git系统变量。
- 根布局统一接入，英文/es/pt/de继承。脚本带 `data-errors=true`、正确websiteId和版本；启用时追加 `pulse-errors=0.1.0` 绕开旧缓存，关闭时保持原src字节不变。
- Sentry并行保留。既有真实PDF诊断、Worker步骤同步给Pulse；框架堆栈只提取代码URL origin/path与行列，丢弃多行message夹带文本、URL凭据和query，不改原异常。
- 干净候选256 tests、工作区264 tests、相关ESLint通过；本地build首次外部图标CDN TLS失败，原样重试成功。远端生产build和TypeScript通过，Sentry原source maps照常上传。
- 候选首页/反色/es均HTTP200并带开启flag、正确id与版本；正式站点实际正常PDF阅读、反色与下载成功，浏览器无新增console error，真实pdf_start/pdf_success进入原统计。没有往生产注入模拟错误。观测该版本0条错误是正常流量测试结果，不是强制制造的成功事件。
- 此次不修改既有按AbortError处理的业务调用点，也不在自动window通道新增深度enrich。纯启动/无原始stack等浏览器边界仍在；Pulse的独立source-map上传尚未接到PDF构建，先保留原始代码位置与详细context，Sentry用于对照。
- 明天查看：监控平台 → PDF Dark → 错误 → 刷新；需要时按版本标签筛选。生产已打开的旧页面需刷新/重新打开后启用新脚本。
- 验证文件：`.seo-cache/pulse-enable/2026-11-03/production-verification.json`（ignored）。
