# 新告警1C与今日hydration记录

## 实际事件

- `PDF-DARK-1C`，issue7802666812，事件前缀b435beb2：北京时间2026-10-20 23:23:37.665，Safari18.6/macOS，线上release52f41c4。只有1次，Non-Error promise rejection captured with value: undefined，没有堆栈。邮件发送时间23:25:42，不能把收件日期当作实际发生日期。
- 回放21c6a2b1ec00487bbc82bc3b5447a8a5只有首页载入，无选文件/转换/拖动操作；报错时仍为上传占位界面。此前有黑白页预加载fetch与region1 Google Analytics请求失败，但不能仅凭时间关联确定因果，不将它直接归为Worker修复复发。
- 另有`PDF-DARK-R`旧分组今日复发：issue7648990492，事件前缀0dde0ab1，北京时间2026-10-21 07:56:57，Windows Chrome155，release52f41c4，近24小时1次。
- hydration HTML Diff/Mutations中有`<div id="open-incognito-widget" role="button" ...>`节点在React恢复时移除，导航按钮useId从服务器样式ID变为客户端恢复样式ID。仓库与调查时线上原始HTML均无incognito节点。优先怀疑浏览器扩展/外部DOM插入，但未确认具体扩展；ID差异本身也不能作为useId业务bug的结论。

## 不注入错误的线上自然复现

北京时间2026-10-21 11:52–11:54，直接访问pdfdark.org。浏览器locale en-GB、timezone Europe/Berlin，与1C记录一致。未选文件，未修改应用脚本、Worker或fetch，未拦截/模拟失败请求，也未安装扩展或插入incognito节点。

| 操作 | Chrome155.0.8059.85/macOS | WebKit26.6/macOS |
|---|---|---|
| 首次访问首页，静置20秒 | 无异常 | 无异常 |
| 悬停工具链接、滚动到FAQ，等待15秒 | 无异常 | 无异常 |
| 进入黑白转换页后浏览器返回，等待12秒 | 无异常 | 无异常 |
| 首页快速进入工具页并返回，等待12秒 | 无异常 | 无异常 |

全部8组：浏览器错误0，Sentry事件请求0，失败请求0，incognito节点0。没有把网络请求失败简单等同于1C；该轮连历史记录里的失败请求也未重现。关闭测试页时的事件同样保留在观测结果中。

结束后独立读取Sentry近24小时列表：1C仍为原1次，R仍为今日1次，最近发生时间仍对应历史事件；本轮测试没有新增后台记录。

这是WebKit引擎对照，不是实体Safari18.6；Chrome也不是Windows真机。原用户的浏览器隐私/扩展、网络环境尚不具备，无法排除环境相关故障。没有可验证的根因或修复点，不添加忽略规则，不修改业务代码、不提交或部署。

本地证据：`/tmp/pdf-1c-natural.js`、`/tmp/pdf-1c-webkit-result.txt`、`/tmp/pdf-1c-chrome-result.txt`；截图`output/playwright/1c-*.png`。

## 原始事件堆栈核验

通过Sentry界面实际JSON链接读取完整事件`b435beb243b347c4a236c7065cb351d1`，只提取诊断字段，未保存/输出访客身份或请求凭据。exception.values[0]只有type/value/mechanism，没有stacktrace或raw_stacktrace；顶层也没有stacktrace、threads、debug_meta、processing errors。不是已有栈帧等待source map还原，而是这条上报本身没有栈。

Trace上下文client_sample_rate=0，动态采样sampled=false、sample_rate=0.0，只有关联ID和请求breadcrumbs，没有完整采样调用链。两个失败fetch breadcrumbs只有method/url/__span，没有HTTP状态或更具体原因，不能将它们直接定为异常来源。

核对当前已安装Sentry SDK的globalhandlers实现：primitive rejection（包括undefined）进入_eventFromRejectionWithPrimitive，仅生成类型与消息；不走带attachStacktrace的eventFromUnknownInput分支。因此仅开启attachStacktrace或重新上传source maps不能为这条历史事件找回原始调用点。若后续要加强定位，需要在可控异步任务的发起/处理位置保留Error及安全阶段元数据，而不是在全局捕获器临时造栈并冒充原始调用栈。本轮未修改监控配置。
