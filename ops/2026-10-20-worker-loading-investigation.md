# Worker 脚本加载错误：线上自然复现

## 历史会话

目标：Sentry `PDF-DARK-N`，issue `7647300101`；Windows 回放 `d5870401c79c406c8a55f944c9eb9325`，46 条错误。

回放记录从 Google 进入首页，进入黑白转换页、选择本地文件、切换黑白模式后集中报错。资源记录中 Worker bootstrap 返回 200；Worker 内部 importScripts 子请求的历史响应没有完整保存，无法仅凭该回放确定是 HTTP 失败还是取消。旧 bootstrap、runtime、monochrome chunk 在调查时均返回 200，Content-Type 为 application/javascript。

## 线上真实操作

时间：2026-10-20 北京时间约 10:29。站点 `https://pdfdark.org/`，release `18f0112a2f741f0e5e33ae7ed90df48033ed3cf0`。使用本机 Chrome 155 / macOS，**不是 Windows 真机**，未伪装操作系统。

使用自生成的 40 页普通 PDF，通过真实文件选择、radio、键盘和鼠标拖动操作。没有 route、网络限速/中断、addInitScript、API/Worker 替换或异常注入。Playwright 只旁路记录真实 request/response/requestfailed、worker 创建/关闭、console、pageerror，以及应用自行发出的监控请求。

| 操作 | Worker 总数（含 PDF.js） | ERR_ABORTED 请求 | 发出的 Sentry 异常 |
|---|---:|---:|---:|
| 按普通节奏切换模式、键盘调阈值 | 9 | 0 | 0 |
| 阈值滑块来回真实拖动两轮 | 164 | 68 | 68 |
| 连续切换灰度/黑白模式 | 16 | 0 | 0 |
| 连续切换预览页 | 14 | 0 | 0 |

快速拖动由 mouse move/down/up 完成，每个方向 40 步，不是通过脚本设置表单状态。68 个失败请求均为 Worker 的 runtime/chunk 脚本，浏览器实际报告 `net::ERR_ABORTED`；每次失败都发生在 Worker close 的 0–1ms 内。162 个 Worker 生命周期短于 500ms。

应用自行发送的异常为原问题相同的 `Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope' ... failed to load`，文件同为 `turbopack-051h3wkc2cs9c.js`、`0ul08-4it9mfo.js`。

后台独立核对：同组 `PDF-DARK-N` 的最新事件 `f2fadad8734a4c0db1fef4df7169b0cf`，新回放 `5d1771ddff5e469ba4c89be6a6a94bfd`，release 为本次线上版本。核对时近30天事件从92增到157：请求侧观察到68条异常发出，后台当时已显示65条新增，不把发出数当作全部入库数。这些新增来自本轮授权复现，分析真实访客时应排除。

停止操作后四组都恢复为两张有效预览，转换按钮可用；快速拖动组没有生成业务 `pdf_error`，但全局 Worker 错误被 Sentry 捕获。由此不能把所有历史 Worker 告警等同于用户最终转换失败。

## 原因与范围

`components/monochrome-converter.tsx` 的预览 effect 直接依赖 threshold、mode、page；每次滑块变化立即清理旧 effect、调用 processor.dispose()，下一个 effect 又创建新 Worker。`lib/monochrome-pdf.ts` 的 dispose 直接 terminate；Worker bootstrap 尚在 importScripts 时终止，浏览器取消脚本请求并产生 NetworkError。这解释了真实拖动时短时间产生大量同类告警。

已确认这一根因路径存在于线上，并能解释历史 Windows 会话相同的错误和批量分布；没有原始 Windows HAR，不能声称逐条证明此前46条均为这一原因。

调查阶段建议优先减少滑动期间的 Worker 重建（复用或防抖并保留过期结果隔离），并将主动销毁的错误与真正启动失败区分。不能直接全局忽略 importScripts 错误，否则会掩盖真实加载失败。该阶段未修改或部署功能代码，后续获授权的修复见下节。

本地证据：`/tmp/pdf-worker-natural.js`、`/tmp/pdf-worker-natural-result.txt`，截图 `output/playwright/worker-*.png`。

## 后续修复与发布前审查

用户授权修复、审查、推送上线并再次真实拖动验证后，完成以下修改：

- 每份 PDF 复用一个像素处理 Worker，预览与导出共享；只在文件替换或组件卸载时释放。
- Worker 延迟到像素真正就绪时创建；预览变化等待120ms，取消过时的渲染与任务，不再销毁 Worker。
- 每个任务保留独立 ID 和 AbortSignal，取消后移除待处理项与监听，迟到响应不能覆盖新设置。已销毁的 processor 禁止重新运行或误入主线程 fallback。
- 仅对主动关闭 Worker 的迟到错误 preventDefault；仍在使用的 Worker 首次启动/运行失败继续拒绝任务，并保留全局错误上报。没有全局按错误字符串屏蔽。
- URL、目标词和页面定位未变化，不需要更新 PAGES.md。

验证与审查：

- 38项 Node 测试通过（新增4项覆盖延迟启动、同 Worker 多任务/响应顺序、单任务取消与迟到响应、文件关闭释放与已销毁拒绝）。组件、处理器与新测试 scoped ESLint 通过。
- 本地生产构建通过并启动成功。浏览器使用真实输入重复原来的四组操作，每份 PDF 均只创建1个像素 Worker，Worker脚本失败0；关闭测试页时被取消的 Next路由预取请求单独区分。
- 通过真实键盘 Home/End 调整阈值，同一已知图形区域预览分别为白色255和黑色0，验证显示为最新设置。取消40页导出后仍是同一 Worker；换8页文件时旧 Worker释放、新 Worker创建；成功导出8页，PDFDocument重新打开核对页数与Creator通过。
- 复核 source/组件生命周期、AbortSignal监听清理、旧响应隔离、取消导出/换文件、Strict Mode延迟启动、fallback取消和真实错误上报路径，未发现阻塞发布的问题。
- 本地自然验证不注入异常、不替换 fetch/Worker、不拦截请求。测试构建关闭外部监控环境变量；部署后对实际生产监控与同样的真实拖动做独立验证，最终发布与验证结果以交付记录为准。
