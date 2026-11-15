# 2026-11-15 反色导出：生成下载文件前先释放内存

## 线上现象

Pulse：2026-11-11 16:39–16:46（北京时间），一位 iOS 用户把同一份 687 页、10–50MB 的 PDF 反色导出了 3 次，3 次都报 `PdfOperationInterrupted`，`step=download`，`at_page=687`。所有页都已处理完，页面在走到 `operation.success()` 之前就没了，每次中断的时间点都正好是页面自动重新加载的时间点，推断是 iOS 在生成下载文件时杀掉了页面进程。用户最后没有导出成功。线上版本 `1276a78`。

## 原因（看代码推断）

组装完成后到触发下载之间，内存里同时留着：原文件 `srcBytes`、pdf-lib 解析出的文档（`draft`）、pdf.js worker 里的文档、栅格页的 JPEG（`pages[].displayBlob`），外加输出 `outBytes`、一份多余的 `copy`，以及 `Blob` 本身。这一刻是整个导出流程里内存最高的时候。

## 改动

- `components/downloader.tsx`
  - 组装完成后新增 `release_resources` 步骤：先记下页数和输出大小，再清空 `pages`、释放 `srcBytes` 和 `draft` 的引用，并提前销毁 pdf.js 文档（`loadingTask` 置空，`finally` 不会再销毁一次；销毁出错只记日志，不影响下载）。
  - `create_blob` 步骤：直接用 `outBytes` 生成 Blob，去掉 MVP 时期留下的整份 `copy`。Blob 生成后释放 `outBytes`。
  - `download` 步骤：只负责触发下载。下载链接改为 60 秒后释放，原来点击后 0 毫秒就释放，和旁边注释说的"Safari 要保留这个链接"矛盾。开始下一次转换时会立刻释放上一个链接，组件卸载时也会释放。
- `lib/pdf-image-diagnostics.ts`：`PdfInvertStep` 增加 `release_resources`、`create_blob`。`download` 沿用原名，和 Pulse 里的历史数据衔接。

渲染、调暗、重新着色、组装这些决定输出内容的代码都没有改动。黑白、纠偏、去底色三个工具也有同样的整份复制写法，没有报错证据，这次没动。

## 验证

- TypeScript：源码 0 错误。`.next/dev/types` 里有 11-15 下线的 blog 页留下的旧类型报错，属于开发缓存，与本次无关。ESLint（改动的两个文件）、302 项 Node 测试、生产 build 都通过。
- 在本地把改动前（HEAD `08b8b75`）和改动后各构建一份生产版本。Sentry DSN 置空，浏览器拦截所有非 localhost 请求，没有往线上发数据。
- 输出一致：用对象级比对（跳过文档信息字典和 ObjStm/XRef 容器；同一版本导出两次，这样比对的结果是 0 差异）。纯文字 50 页、文字图片混排 60 页、扫描件 30 页、687 页 45.9MB 图片文档，在 Chromium 和 WebKit 里改动前后输出都是 0 处差异，耗时持平，页面没有 JS 报错。
- WebKit 里 687 页文档完整导出并下载成功（140 秒，输出 212MB）。同一页面连续导出两次（"Convert another"），两个浏览器里第二次都能正常下载。
- 内存（Chromium，687 页 45.9MB，导出输出 145.7MB；每 0.1 秒采样一次 Playwright Chromium 进程的 RSS，各跑两轮）：

| | 改动前 | 改动后 |
|---|---|---|
| 下载阶段渲染进程峰值 | 1361 / 1322MB | 1215 / 1215MB |
| 下载阶段所有进程合计峰值 | 1754 / 1630MB | 1551 / 1618MB |

  渲染进程的峰值降了约 110–145MB（8–11%），比按代码估算的少一半左右。推测原因：释放引用后，原文件和 pdf-lib 的副本要等垃圾回收才会真正回收，生成 Blob 时未必已经回收。合计值包含浏览器进程里的 Blob 存储，波动较大。

## 已知边界

- iOS 单页内存上限无法在电脑上模拟，也没有在 iOS 真机上验证。省下的 110–145MB 够不够让那位用户导出成功，要看上线后 iOS 上 `create_blob` / `download` 还有没有中断。
- 测试文件的输出是输入的 3 倍（每页的图片被重新编码），真实文档的比例可能不同。

无 URL、目标词或页面定位变化，不更新 PAGES.md。
