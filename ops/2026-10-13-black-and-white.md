# PDF to Black and White：实现与同步记录

本次只在工作区新增功能，未推送或部署。

## 待同步页面映射

用户确认本次云环境无法访问本地知识库及 project-console；先将映射写入仓库，用户拉取后同步。

| 字段 | 值 |
|---|---|
| URL | https://pdfdark.org/pdf-to-black-and-white |
| 主词 | pdf to black and white |
| 同意图候选辅助词 | convert pdf to black and white; color pdf to black and white; pdf to grayscale; convert pdf to grayscale |
| 页面类型 | 独立浏览器工具页 |
| 用户任务 | 将彩色 PDF 转为灰度或纯黑白，预览并保存新 PDF |
| 与已有页面关系 | 主页仍承接深色阅读；/invert-pdf-colors 仍承接反色。新页不改变两者的定位 |
| 状态 | 本地实现，未上线；部署后才可记录为线上页面 |

待用户同步：`~/Documents/SecondBrain/01-产品/pdfdark/PAGES.md` 及 project-console 对应行。此文件只是同步记录，不代表已写入上述资源。

## 第一版范围

- 灰度、纯黑白、纯黑白阈值调整、逐页前后预览、全文件下载、转换进度及取消。
- 所有处理在浏览器内进行，不上传文档；新增页沿用深色背景与琥珀色控件。
- 输出保留页面的物理尺寸和旋转后的视觉方向，但页面视觉内容以 PNG 重建，最高约 144 dpi；超大页面会降低分辨率以控制内存。
- 使用现有文本层帮助保留可支持的搜索/复制文字。旋转页面、部分字符等有已知限制；不会新增 OCR。
- 不保留原始矢量细节、链接、表单、书签和数字签名，也不承诺更小文件或节墨。页面明确说明这些限制。
- 新 URL 加入 sitemap 与英文 footer；原有阅读和反色算法未修改。

## 验证方法

```bash
node --test tests/monochrome.test.mjs
npx tsc --noEmit
npx eslint app/pdf-to-black-and-white/page.tsx components/monochrome-converter.tsx lib/monochrome.ts lib/monochrome-worker.ts lib/monochrome-pdf.ts app/sitemap.ts components/footer.tsx
NODE_USE_ENV_PROXY=1 npm run build
```

浏览器验证使用本地产生的非敏感 PDF，覆盖彩色文字、矢量图形、嵌入彩色图片、第二页旋转、灰度/纯黑白下载、阈值更改、非法文件、取消和手机布局。实际结果如下。


## 实际验证结果

- 5 个颜色算法测试全部通过：灰度主色与黑白端点、透明底合成、阈值边界、阈值方向、已有灰度的幂等性。
- 新增及修改文件的 ESLint（零警告）和 TypeScript 检查通过。仓库原有 pdf-viewer.tsx 的 3 处 lint 错误属于此前已记录的问题，本次未修改。
- 最终源码复制到独立临时目录后，Next.js Turbopack 生产构建通过，43/43 静态页面生成完成；此操作没有部署。
- Chromium 验证通过：桌面/390px 手机布局无横向溢出、逐页预览、灰度和纯黑白下载、阈值更改、非法 PDF 报错及取消转换；无页面 JavaScript 错误。
- 两页样例包含彩色文字、矢量矩形、嵌入彩色图片、90° 旋转页面。下载结果的页面尺寸为 400×400、400×600 PDF 点，与原始视觉尺寸一致。
- 使用 Ghostscript 将下载结果渲染为图片：灰度输出非灰度像素 0，175 个灰度级；纯黑白输出非灰度像素 0，仅 2 个灰度级。
- pdftotext 可提取普通页面的原文字；旋转页面按已知限制不添加文字层，页面中已有说明。
- 样例转换过程无 HTTP POST/上传文档请求。该检查不等于网站完全没有普通资源请求。
- 新 URL 在 sitemap 中可见；仓库 diff 检查通过。

截图和浏览器测试产物位于当前云环境 `/workspace/pdf-dark-browser-tests/`，不随 Git 同步；主源码、颜色测试及此同步记录位于仓库。此版本尚未推送、部署或写入用户本地知识库/project-console。

## 四类效果样例验证（用户要求）

通过实际页面导出同一份四页测试 PDF 的灰度、纯黑白阈值 128、纯黑白阈值 190 三个版本，再使用 Ghostscript 渲染下载文件、通过浏览器生成对比截图；不是用 CSS 滤镜模拟转换。

- 白底黑字：灰度外观基本保持，纯黑白的文字边缘更硬。
- 彩色标题与图表：灰度保留不同明暗；阈值 128 下黄色柱和浅黄色高亮消失，红/蓝/绿柱都变黑，因此颜色编码的区分会丢失。
- 照片：使用 Pillow 仓库公开照片测试样例 hopper.jpg；灰度保留明暗层次，纯黑白明显丢失面部和衣服细节。
- 浅灰文字及灰底扫描件：使用可控制灰度与渐变阴影的模拟扫描位图。阈值 128 丢失浅色文字；190 恢复灰度 170 的文字，但较暗的纸张阴影变黑；灰度 190/210 的更浅文字仍可能消失。当前统一阈值不能当作扫描清理或增强功能。

4 页 × 3 输出设置共 12 项像素检查通过：全部无非灰度像素，所有纯黑白输出恰好包含 0 和 255 两个灰度值。浏览器无 JavaScript 错误。结果只代表这些样例，不代表所有 PDF 的质量保证。

原始 PDF、导出 PDF、截图和像素统计保存于云环境 `/workspace/pdf-dark-browser-tests/cases/`。应用代码未因这次验证而修改，也没有推送或部署。

## 网站效果示例区

同一工具页下新增四类可切换示例：彩色图表、照片、文字文档、扫描件。显示原始、灰度和纯黑白三栏；扫描件的纯黑白栏支持阈值 128 / 190 对照。图片取自本工具实际导出的测试 PDF，仅裁去测试标题并缩小为网页资源，未使用 CSS 滤镜伪造转换结果。

每类提供独立的单页样例 PDF；“Try this sample PDF”会读取本站静态样例并加载到上方工具中，让用户直接预览和转换，无须提供自己的文件。图片和样例保存在 public/examples/black-and-white；源照片来自 Pillow 的 hopper.jpg 测试样例，页面保留来源说明。其余文档/扫描示例自行生成。文件读取错误、样例切换及转换取消沿用工具的错误与资源清理流程。

此项属于同页内容和体验补充，不改变 URL、关键词或页面定位；没有推送或上线。

示例区验证结果：生产构建、TypeScript、变更文件 ESLint 零警告检查通过；浏览器验证四类切换、全部 13 张图片加载、扫描阈值切换、样例载入与实际灰度下载、390px 手机无横向溢出，均通过且无 JavaScript 错误。桌面/手机截图位于云环境 /workspace/pdf-dark-browser-tests/examples-desktop.png 与 examples-mobile.png。


## 发布交付

用户在验证页面与效果示例后明确授权推送代码触发部署。页面映射仍由用户在拉取后同步本地 PAGES.md 与 project-console；正式发布状态以 Git 提交和托管平台部署记录为准。
