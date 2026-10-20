# 阅读器跳转取消误报

## 依据与复现

Sentry `PDF-DARK-19` 的 `39da00f4`、`a4e51369`、`7d924d86` 三个事件，均发生在点击阅读器设置里的“反转颜色并保存”链接后不到一秒；其中两个事件的安全诊断为 `read_image_blob`。这是导航中断的强线索，不能据此把该分组的全部六次失败都判为取消。

本地使用生成的 12 页 PDF，在真实 Chromium 中延迟第二页的图片 Blob 读取，并在点击该链接后注入 TypeError、延迟目标页响应。旧版会在成功跳转前记录 `pdf_error`，复现了 React 卸载清理晚于读取失败的竞争时序。此为受控故障复现，未声称重现原设备的浏览器底层故障。

## 修改

- 设置里的转换链接使用 Next.js `Link`，在 `onNavigate` 中同步取消初次阅读和主题预览循环，不再等待组件卸载。
- 使用 `onNavigate` 保留 Cmd/Ctrl 点击另开页面时当前阅读继续运行的语义。
- 图片读取失败时先检查调用方取消状态；显式取消转为 AbortError，不记录图片错误诊断。未取消的真实失败仍保留原有上报。
- 不改变 URL、目标词或页面定位，不需要更新 PAGES.md。

## 验证

- `node --test tests/*.test.mjs`：34 项通过。新增回归覆盖 Blob 读取期间取消与未取消的对照，验证取消不会进入 Sentry，而真实失败仍保留安全诊断。
- 开发与生产构建均通过真实 Chromium 的五个场景：初次阅读中跳转、主题预览中跳转、Cmd 点击另开页面、未取消时读取失败、正常完整阅读。测试使用本地事件捕获并阻断外部统计请求，禁用测试构建的 Sentry DSN；不向生产 Sentry 发送虚构事件。
- `NEXT_PUBLIC_SENTRY_DSN='' npm run build`：成功，TypeScript 通过，生成 46 个路由。
- 原样 scoped ESLint 未通过：`pdf-viewer.tsx` 原有三处 `react-hooks/set-state-in-effect`。用 HEAD 源码通过 stdin 检查，确认同样三处；仅排除该既有规则后，本次修改的三个代码/测试文件检查通过。`git diff --check` 通过。
- 浏览器截图位于本地 `output/playwright/`。本次只修复设置中转换链接的取消时序，未声称解决 Worker 加载告警或 `Error: La`。

发布后的结论以对应生产部署及线上自然回归结果为准，不将本地验证等同于已在线上生效。

## 线上自然复现核查（2026-10-20）

用户要求不注入模拟错误后，直接访问 `https://pdfdark.org/`，使用生成的普通 PDF，通过浏览器真实选文件、点击设置和转换链接。没有 `addInitScript`、fetch/blob 替换、路由拦截、网络故障注入或错误注入；只旁路记录 console、pageerror、失败请求及应用自身发出的监控请求。

- Chrome：北京时间 10:07:43–10:08:07，共 4 次。40 页 PDF 处理到第 4 页、第 5 页时分别跳转；8 页 PDF 完成后切换 Sepia，立即跳转及等待 150ms 后跳转。全部到达转换页，没有 console error、pageerror、失败请求或 Sentry exception envelope。
- 线上复现前，Sentry `PDF-DARK-19` 总事件数仍为 6，最近一次约 15 小时前。

- WebKit 26.6、Playwright iPhone 模拟环境：北京时间 10:09:19–10:09:47，进行同样四次自然操作。两次阅读中跳转均出现 `FileReader failed`，点击到上报分别约 336ms、238ms。切换 Sepia 后等待 150ms 再跳转，出现一次 FileReader 失败和三次自然的 `fetch_image_data` 失败；立即切换并跳转那次没有异常。
- 对应 Sentry event ID：阅读 `496c27ece2564dc4aed1fdd96b3f57a6`、`4f0876d8385845c9a1ea0f6ebfd39fa9`；预览 `012e207b96254897af44af6355fd3472`、`41b636becfe64f02950fc9a31a333058`、`cb304d8a1bda4f03a335fc63c396f763`、`3559c073f91e4c51a5c81fb2b5977525`。在 Sentry UI 独立核对，该组总计由 6 增至 12，最新事件为同一 WebKit 操作与线上 release `3172261`。
- 对照：同一 WebKit 环境，同样的 40 页 PDF 等待完整阅读完成，以及同样的 8 页 PDF 切换 Sepia 后停留 5 秒；均完成且无应用错误、无 Sentry exception envelope。
- 这 6 条是本次有意执行线上真实操作自然产生的事件，不能计作新的真实访客故障。浏览器原生错误中的第三方统计取消单独区分，不作为 PDF 根因证据。

**结论边界：线上自然操作加不跳转对照，已确认 WebKit 的跳转会中断本地图片读取并触发该误报路径；未注入错误、修改 API 或拦截请求。不能据此把该分组中此前全部六条历史错误都归为相同原因。WebKit 的 iPhone 模拟不等同于在实体 iPhone 上实测。**

本地修复版另做自然验证：关闭 Sentry/GA/Clarity/Umami 环境变量后重新构建并 `next start`，同一 WebKit 环境与相同两份 PDF，重复同样四次操作。北京时间 10:11:54–10:12:11 全部成功跳转，console error、pageerror、失败请求均为零，没有注入错误或替换 fetch/blob。此处监控关闭，确认依据是旁路浏览器日志；取消/真实失败的监控语义由前述独立回归测试验证。

## 发布前审查

- 检查导航同步取消、初次渲染与主题预览的回调注销、Strict Mode 清理、Cmd 点击语义、真实错误继续上报及诊断隐私；未发现阻塞本次发布的问题。
- 刷新 origin/main 后仅有两个已有诊断提交 `1c7d35e`、`f684872` 待推送，与此次故障调查相关；本次只新增提交阅读器、图片诊断、监控回归测试和本文档四个文件。
- 再次运行 34 项测试和 scoped lint（排除已确认的既有 effect 规则问题），并启动本地生产服务成功。保留无关未跟踪文件。
