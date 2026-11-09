# Error: La 排查

## 原始事件

- Sentry `PDF-DARK-1A`，issue `7801121704`，event `72fd129da2084cee9a070d60cd24a428`，原始 release `3172261a84dc6752a1cd6e0075daa7b556434064`。
- 北京时间2026-10-20 04:45:53.652 发生，自动捕获的 unhandled promise rejection，消息只有 `La`。
- 堆栈为 `app:///:501:343`、`app:///:196:41 in Ri`、`app:///:197:338`，没有可定位业务文件或源码上下文。不能仅凭此断言来自本站代码或浏览器注入脚本。
- UA 包含 Macintosh 与 CriOS/155，Sentry识别为 Chrome Mobile iOS，device family 为Mac；语言ar、时区Asia/Riyadh。没有实体设备型号或原始PDF可供精确复原。
- 选择文件记录在04:45:26.691，约27秒后报错。回放 `83c7b891a2f9400ca0d7e7e2789d87ad` 已显示阅读页面，报错后仍可滚动到FAQ；没有同时记录业务 PdfProcessingError。回放中的内容与文件名已遮罩，不能断言具体原始文档或对阅读功能的全部影响。

## 自然操作对照

在当前正式站点 `https://pdfdark.org/`、release `52f41c40e7e88542a467c1f8dfbd44d5c2dc9227` 使用自行生成的120页普通PDF。正常选文件、等待全部120页渲染、滚动到FAQ、再等待30秒、切换Sepia、关闭设置与返回阅读区域。浏览器locale为ar、timezone为Asia/Riyadh。

没有注入异常、替换Worker/fetch、拦截网络、伪装Chrome iOS UA或使用原用户的文档。只旁路记录browser errors、Sentry exception envelope、真实PDF业务事件与请求失败。

- 桌面Chrome 155：北京时间11:00:47–11:01:39，全120页完成，pdf_start/pdf_success，浏览器错误0、Sentry异常请求0、请求失败0。
- WebKit26.6手机布局模拟：北京时间11:01:41–11:02:32，全120页完成，pdf_start/pdf_success，浏览器错误0、Sentry异常请求0、请求失败0。最初脚本使用mouse.wheel被移动WebKit测试驱动拒绝，改为滚动到实际页面元素后重新完整运行；驱动错误不计为站点错误或已完成的测试。
- WebKit26.6桌面/触摸布局模拟：北京时间11:02:55–11:03:49，全120页完成，pdf_start/pdf_success，浏览器错误0、Sentry异常请求0、请求失败0。
- 三轮结束后独立核对Sentry：`PDF-DARK-1A`仍为原来1次；新release过滤查询无匹配告警。没有仅凭浏览器监听无异常就认定后台未收到事件。

本地脚本及结果：`/tmp/pdf-la-natural.js`、`/tmp/pdf-la-chrome.js`、`/tmp/pdf-la-*-result.txt`；截图 `output/playwright/la-*.png`。

## 结论边界

上述对照尚未复现 `La`。WebKit的布局/触摸模拟不等于实体iPhone上的Chrome及其浏览器内置脚本环境；当前版本、生成PDF也不同于原事件。因此不能断言已修复、是第三方噪声或与PDF内容完全无关。保留待定位，不添加ignoreErrors/denyUrls规则，不修改功能代码或部署。
