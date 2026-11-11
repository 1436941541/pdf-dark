# 2026-11-11 浏览器读不到所选文件时给出明确提示

## 线上现象

11-10 上线 `949b7d8` 后，Pulse 和 Sentry（`PDF-DARK-20`）各记到同一条：Windows 10 + Chrome 156，阅读器通过文件选择框选了 818MB 的 PDF，`file.arrayBuffer()` 在 204 毫秒时报 `NotReadableError`（`reader_step=read_file`）。读前读后文件大小、类型、修改时间不变，修改时间在 1 天内，页面在前台、在线，JS 堆约 16MB。Chrome 对这类错误只给通用说明，无法区分具体原因；可能是文件被其他程序锁住、网盘占位文件或外接盘断开，或一次申请 818MB 内存失败（后者未核实）。用户看到的是「Couldn't read that PDF. Try another file?」，会被误解为文件损坏。

11-07 的 `8ecffa9` 曾给反色工具加过同类提示，`7c1caa1` 为了让黑白导出那次发布只带内存改动而撤回，并非否定该提示。

## 改动

- `lib/i18n.ts`：恢复四种语言的 `errors.fileUnavailable`（译文与 `8ecffa9` 相同）。
- `lib/pdf-load-error.ts`：新增 `pdfOpenErrorText(e, locale)`。只有 `readPdfFile` 读文件失败、且 `error_kind` 为 `not_found` 或 `not_readable` 时返回该提示；其他情况沿用原有密码/损坏提示或通用提示。同名错误若不是在读文件这一步发生，不会被误判。
- `components/pdf-viewer.tsx`、`components/downloader.tsx`：出错提示改用 `pdfOpenErrorText`。上报逻辑不变，这类错误仍进 Pulse 和 Sentry。
- 黑白、纠偏、去底色三个工具不走 `readPdfFile`，未改。

## 验证

- 302 项 Node 测试（新增 `tests/pdf-open-error-text.test.mjs` 2 项）、TypeScript、生产 build 通过。ESLint 在 `pdf-viewer.tsx` 报 2 处 set-state-in-effect，是原有写法，与本次无关。
- 本地生产构建，Playwright Chromium 无头，拦截所有非 localhost 请求。注入脚本让指定文件的 `arrayBuffer()` 以 `NotReadableError` 拒绝：阅读器（`/`、`/es`）和反色（`/invert-pdf-colors`、`/de/invert-pdf-colors`）都显示对应语言的新提示；正常文件阅读器出图、反色导出完成；页面无 JS 错误。
- 未在真实 Windows 网盘/锁文件场景下复现。

无 URL、目标词或页面定位变化，不更新 PAGES.md。
