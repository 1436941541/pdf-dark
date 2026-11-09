# 客户端异步异常诊断补充

针对PDF-DARK-1C原始事件没有堆栈的问题，补充未来事件的安全诊断上下文，不追补或伪造历史堆栈。

## 记录与含义

- Sentry beforeSend附加`contexts.client_diagnostics`，标签`client_diagnostics=v1`及`reported_stack=present/missing`。该标签只表示上报中是否有栈，不宣称是根因原始栈。
- 最近10个HTTP fetch：白名单化服务/页面类别、方法、RSC标志、开始/结束时间、HTTP状态、成功/拒绝/同步抛出状态、安全异常类型、显式AbortSignal状态、发起位置。发起位置为当前部署JS文件与行列，标注为initiator，不冒充拒绝时的调用栈。
- 最近8个PDF操作：工具、阶段、单次结束状态、发起位置。复用现有beginPdfOperation入口，不修改PDF算法或事件计数语义。
- 最近3次原生unhandledrejection观察：只记录值类型；若事件promise恰好为诊断fetch返回的Promise，则保存明确的请求编号。派生链/其他来源无法匹配时不填编号，不用时间接近猜测归因。
- 页面就绪状态、可见性、在线状态、pagehide/pageshow、最近Next客户端导航。不安装beforeunload监听，不调用preventDefault，不吞掉拒绝。
- 仍使用原Sentry错误上报：不额外captureException、不发送成功请求调试日志，不开启tracing，不改变fingerprint、Replay遮罩或告警过滤规则。有效的原Breadcrumb span关联ID保留。

## 隐私与行为

不记录PDF数据/图片、文件名、异常原文、请求体、请求头、Cookie、URL参数值、未知域名/路径、访问令牌或tracker ID。data/blob、大型URL及Sentry自身请求绕过诊断；站内非白名单路径映射为other。代码位置只允许本站当前部署`/_next/static/`的JS地址，剔除函数名及其他来源。

fetch只对观察的请求附加同一返回链上的处理器，保留原始参数、this、Response、拒绝值/对象及AbortSignal；不创建游离拒绝Promise。捕获函数内部失败时不影响原请求。缓冲区容量固定；快照复制，不持续保留请求对象或Error内容。诊断模块不会重写原异常栈。

## 验证

- 46项Node回归通过。新增覆盖：脱敏、原始参数/this/Response、undefined拒绝传播与直接Promise匹配、派生链不强行匹配、生命周期只观察、固定容量、AbortError与单次结算、Breadcrumb白名单/Span保留、同步错误传播、客户端入口监听顺序/Router转发、日志钩子不可用时的故障隔离。
- 本次文件ESLint、TypeScript、生产构建通过。
- Chrome和WebKit本地生产流程：阅读8页、Sepia、站内跳转、黑白转换真实来回拖动、下载8页PDF均通过，浏览器错误0、异常事件0。下载产物重新由PDFDocument打开，8页核对通过。
- 本地构建使用公开假DSN`example.invalid`，外部统计变量关闭；仅该测试接收地址在浏览器本地收集，不向生产Sentry制造告警。没有在生产环境注入错误。事件字段与接线由本地单元测试验证，正常浏览器流程用于检查不引入回归。

无URL、目标词或页面定位变化，不更新PAGES.md。当前为本地改动，未提交、推送或部署；上线后才可用于新事件。日志无法保证还原任意第三方匿名Promise的内部调用栈。
