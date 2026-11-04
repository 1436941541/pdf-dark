# 2026-11-04 原始异常日志发布

已按授权手动部署到 https://pdfdark.org。部署 `dpl_27mB5ddF6hjbqZmt6FnLbkTnamgF`，release `pdf-diag4-a633869fca`，源码指纹 `a633869fca8eb84cbf3cbc1bdf0a785df60e53ee5b22e3323c6e5e330879e6fc`。保留现有 Sentry/Pulse；本次不更新平台、不迁移数据库、不提交/推送 Git、不创建任务。

## 范围

相对刚发布的实际生产源码，仅修改 `lib/pdf-image-diagnostics.ts`，新增 `lib/pdf-original-error-diagnostics.ts`。工作区其他未上线修改保留且未带入候选。相关测试增加/接入新helper和版本4标识。

- `pdf_original_error`：固定白名单完整原始错误消息及类别，未知消息仅状态和长度；安全name、有限32位数值code（含0）、最多两层平铺cause摘要。不会将原始Error/cause对象挂回安全错误或上传任意消息。
- `pdf_image_read`：图片读取尝试序号、原取消检查通过时的active状态；区分fetch/Blob/bitmap同步抛错与Promise拒绝。记录收到返回值和能否读取原生Response元数据，允许status/type/consumed；不读URL/headers/body。
- 失败时检查输入结构：最多96字符header及4096字符payload首尾样本，只返回固定枚举/数值/布尔。明确complete或edges_only，不解码、不保留数据URL和文件内容。
- 原内存/缓存/页面诊断继续保留，诊断版本4。成功路径只加少量标量阶段记录；失败探测受保护。原fetch、blob、bitmap调用和await、原异常identity、取消检查及告警分组保持原样。

## 验收

27个测试文件共280项通过，含21项新增诊断case。独立14组新旧行为对照通过，覆盖同步/异步错误、this/参数/顺序/单次await、返回、取消和bitmap关闭。ESLint、TypeScript、本地及真实远程Next production build均通过。

实际便携SDK和桥接函数输出经过与已部署平台逐字节相同的normalize/privacy函数离线验收，新context和累计缓存完整保留，私有标记未泄漏；不调用数据库或网络。首次全套测试中仅JSON null-prototype对象比较方式不当，修正为比较真实传输JSON后重跑全套全部通过；原日志保留在证据目录。

真实构建33份map上传，共6,404,606B；33个artifact对应JS均200，3个包含v4诊断的JS的map URL均404。暂存/正式四个页面title/H1、脚本和release检查通过。

本地及正式Chrome：正常PDF可读，900x900图像完整；OLED切换完成并恢复Midnight；反色自动下载成功。正式下载文件已解析验证：1页600x600pt、2568B。浏览器警告/错误0，有限runtime扫描error0，新release记录0。没有在线上注入模拟错误，失败分支仅本地单元测试；自然报错的实际v4事件仍待下一次发生。

## 能力边界

若浏览器确实提供了已知原始消息、数值code或cause，下次能保留更多原始事实并区分失败边界；但不能保证每次直接确认根因。Safari可能只给TypeError/Load failed、无code/cause且无内存API，这不能直接证明OOM。

未添加成功编码来源溯源、完整任务generation/取消历史、跨页资源趋势，也没有修改渲染/重试/缓存清理/取消策略或自动上传PDF。尝试序号不是文档/会话ID，active_at_failure仅表示原取消检查当时通过。

详细证据：`.seo-cache/original-error-logs/2026-11-04/`，包含范围、源码清单、测试输出、离线采集链路、暂存/正式页面和下载验证。

## 后续生产观测与源码入库

13:55:35和13:55:58，自建监控收到同一安卓访问的两条自然v4事件：invert在File.arrayBuffer读取原始PDF时返回NotFoundError/code8，新增原始异常摘要已保留。此后桌面对照未复现安卓故障；具体文件来源/URI失效原因仍未确认。该观测补充上文“发布验收时新事件0”的时间边界，不代表已修复该故障。

本次源码整理将已部署且验证过的监控接入、私有源码映射、v4日志、相关测试与发布记录提交到main。未上线的旧客户端诊断、临时探针和本地产物继续保留在工作区；阅读器Blob路径改造尚未实施。Git发布候选的运行源码与上述已部署快照一致。
