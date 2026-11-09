# 2026-11-09 追踪没有结果的 PDF 操作

## 背景

2026-11-02 至 11-09 的 Umami 数据：pdf_start 1644，pdf_success 1356 + pdf_cancel 91 + pdf_error 19，共 178 次开始后没有任何结果，是报错数的 9 倍多。reader 154 次（15%），invert 24 次（4%），其他工具 0。reader 要把所有页渲染完才记 success，读了前几页就离开也会计入其中，所以这个数字本身不能直接当作故障数。

## 改动

- `lib/pdf-operation-lifecycle.ts`：每个进行中的操作在 sessionStorage 里留一份脱敏记录，包含工具、阶段、文件大小区间、页数、当前步骤、页码、后台时长，不含任何 PDF 数据或文件名。
  - `pdf_abandon`：pagehide 时操作还没结束（关页、刷新、跳走），上报后清除记录。
  - `pdf_interrupted`：页面加载时发现上次的记录还在，说明上一次页面没有触发 pagehide 就结束了，比如被系统杀掉或崩溃。同时向 Pulse 报一条 `PdfOperationInterrupted`，按 tool/stage/step 分组。这条没有堆栈，也不伪造堆栈。
  - `background=1`：页面结束时正处于后台。对 interrupted 来说，指最后一次记录更新时页面在后台。iOS 在后台回收内存时多属于这种情况。
- reader（`components/pdf-viewer.tsx`）和 invert 导出（`components/downloader.tsx`）每进入一步就记录当前步骤和页码。其他工具只记录工具和阶段。
- 页面启动时在 `instrumentation-client.ts` 安装，不依赖 Sentry。

## 验证

- 298 项 Node 测试、TypeScript、生产 build 通过。改动文件的 ESLint：`pdf-viewer.tsx` 有 3 处 set-state-in-effect，原来就有，和本次改动无关；其余文件通过。
- playwright-stealth 本地生产构建，使用假 DSN 和模拟的 umami，不往线上发数据：
  - 2 页 PDF 阅读：start → success，记录被清除。
  - 150 页 PDF 读到第 4 页时跳到 /about：`pdf_abandon`（step=encode_page，at_page=4，pages=150），下一页不会误报中断。
  - 中断恢复：用读到第 5 页时的真实记录启动新页面，上报 `pdf_interrupted`（encode_page，第 5/150 页），记录被清除，再次刷新也不重复。真实的 `Page.crash` 之后，工具会换一个新标签页，sessionStorage 不会保留，所以「同一标签页崩溃后重新加载」这一步改用注入记录模拟。
  - 150 页反色导出：start → success → download，产物有 150 页，记录被清除。
  - 页面没有 JS 错误。控制台里只有假 Sentry 地址连接失败，以及 CSP 拦截 Sentry Replay 的 blob worker，后者原来就有。

## 已知边界

- 页面被杀后用户如果不再打开这个标签页，这次中断就不会被上报。中断要等用户回到该标签页时才会上报。
- iOS 后台杀页面之后，重新打开时 sessionStorage 是否还保留，没有在真机上验证过。
- 页面从 bfcache 恢复后，已上报 abandon 的操作仍可能继续并成功（`persisted=1`），这时同一次操作会同时有 abandon 和 success 两条记录。

无 URL、目标词或页面定位变化，不更新 PAGES.md。
