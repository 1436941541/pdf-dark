# 2026-11-09 反色导出长文档在手机上失败：Blob 存储耗尽

## 线上现象

Pulse 问题 `5b3af6e1`：2026-11-09 10:42（北京时间），Android Chrome 156、8GB 内存，930 页 PDF（2.6MB）反色导出到第 544 页时失败。`createImageBitmap` 报 `InvalidStateError: The source image could not be decoded.`（code 11，`bitmap_promise_rejected`），此时已缓存 543 页、约 104MB 的 Blob，JS 堆只用了 47MB。11-05 在 iOS 上也出现过 2 次同类报错。

## 原因

反色导出把每一页调暗后的 JPEG 都留到最后组装时再用，但 `buildDarkPdf` 只有在页面走不了对象模式时才会用到它；文字页走对象模式，直接修改原 PDF 的内容流，根本用不上这张 JPEG。Chromium 对 Blob 存储设有上限：桌面版是 2GB；Android 约为物理内存的 1%，8GB 设备约 80MB。无痕模式下 Blob 不能换到磁盘。存储满了以后，解码新图片会报上面这个错误，读取新的 Blob 则会报 `NotReadableError`。

## 复现（playwright-stealth，本地生产构建，无痕上下文）

- 只用浏览器原生 API：累积到上限后，解码一张正常 JPEG 会报相同的 `InvalidStateError` 和相同的错误信息，读取 Blob 会报 `NotReadableError`。用读取 2MB Blob 做探测，测得上限稳定在 2030MB。
- 在应用里复现：先在同一上下文的另一个标签页预填 1970MB（余量 60MB），再导出 930 页文字 PDF。旧版本（HEAD `b51f657` 构建）在第 319 页失败，诊断字段和线上一致：已缓存 318 页、74MB，`darkify_page` → `decode_image_bitmap`、`bitmap_promise_rejected`、`InvalidStateError`。

## 修复

- `lib/build-dark-pdf.ts`：新增 `prepareDarkPdf()`，渲染循环开始前就加载对象模式文档，每页渲染、亮度采样完成后马上 `recolorPage()`。对象模式成功的页面不再编码 JPEG、不再调暗，也不保留 `displayBlob`。扫描页、需要反转图片的页、pdf-lib 打不开的文档照旧保留 JPEG。`buildDarkPdf()` 不传 draft 时的行为不变。
- `components/downloader.tsx`：接入以上流程，新增步骤 `recolor_page`。

## 验证

- 300 项 Node 测试（新增 2 项）、ESLint、TypeScript、生产 build 通过。
- 同样预填 1970MB 时，新版本完整导出 930 页，用时 19 秒。
- 不加内存压力时，930 页旧版本用时 107 秒，新版本 17 秒；两份输出逐页对比，内容流、图片和页面尺寸都没有差异，文字抽取一致。有内存压力时新版本的输出同样一致。
- 60 页混合 PDF（扫描页、插图页、文字页，其中 40 页带图片），新旧版本逐页内容流和图片字节完全一致。只测了默认图片模式。
- 没有在真实 Android 设备上验证。上限数值依据 Chromium 源码和桌面实测推断。

## 未覆盖

扫描件和需要反转图片的页面仍然每页保留一张 JPEG，这类文档的页数足够多时还可能碰到同样的上限。阅读器的缓存是另一条路径，这次没有改。
