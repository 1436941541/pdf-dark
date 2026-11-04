# 2026-11-04 监控补齐发布验收

已按授权手动发布，未提交或推送 Git；未创建定时任务、用户、API key 或数据库迁移。保留工作区其他改动，PDF 读取/渲染/转换逻辑没有改动。

- 平台：https://yj-pulse.vercel.app，deployment `dpl_GAi2PhMyqw55H5KWbhVSZXR6YJkA`，source `21b267277323032c1750e092a402a943d931faff86369f2bf0b66d3fb0f919a3`。
- PDF Dark：https://pdfdark.org，deployment `dpl_4SMsWhuTmr3gwhJMWdjnyaLBf9XU`，release `pdf-monitor-011-e2a97124e0`，source `e2a97124e011ddafe9b895c0dfe9b2c2dec988dc85d85cf36497b97d2d334b8b`。
- 本次发布：私有源码映射、脱敏有界操作轨迹、累计缓存数字保留、错误按查看者时区分日。现有 Sentry、流量、爬虫和 GSC 保留。

## 验收

平台195项原定向测试、修正后的上传器32项测试、8项PDF桥接/构建组合测试、独立24项安全边界复验及相关lint通过。平台全仓类型检查仍有3项已有诊断；新PDF真实远程构建及TypeScript通过。

平台暂存/正式各10项只读检查通过；同一真实事件在北京时间归入11月4日、UTC归入11月3日，计数一致。实际登录浏览器可读取旧错误详情。

最初PDF暂存构建因Sentry indexed map超过限制而停止，未切换生产。复审进一步发现先前本地映射fixture使用了不存在的JS URL。上传器已改为实际JS的sourceMappingURL绑定，并保留单section行偏移；复杂格式明确失败，不放大后端限制。真实构建551,164段映射与原AnyMap等价，三个实际fetch坐标准确还原至TypeScript第274行。旧验收遗漏和替代证据均保留，详见 `verification-correction.md`。

生产实际33份artifact，共6,297,439B，最大1,198,084B。暂存33个对应JS均200，其33个引用map均404；四个公开页面title/H1保持不变。正式浏览器确认采集开启、release一致及0.1.1脚本；正常PDF阅读、OLED主题切换并恢复Midnight、反色自动下载通过。实际下载文件可解析：1页600x600pt、2568B。浏览器警告/错误0，PDF部署runtime error0；平台仅8条原有PG SSL兼容性警告。

未注入线上模拟错误。有限扫描中新release报错0，今日所有版本仍为旧事件1次；后续自然错误的新增轨迹和缓存字段尚待自然发生验证，不能宣称已经验证该自然错误不存在。

## 今日PDF报错的定位边界

已确认手机在阅读第104页时，在 `lib/pdf-image-diagnostics.ts:274` 的 `fetch(dataURL)` 失败；这是本地图片数据读取，不是远程网络请求。尚未确认根因，也没有证实内存耗尽。

业务层将原始异常包装成固定错误，仅保留部分message分类（本次为other），未保留原始code/cause。因此不能断言Safari没有提供更多原因；旧事件中缺失的原始信息无法恢复。本次没有修改这段业务日志或PDF算法。

建议下一步补脱敏错误摘要/code/cause、同步抛错或Promise拒绝的阶段、已有输入校验/编码路径、操作ID/取消/后台切换状态和资源变化。未知消息不原样上传，不上传用户PDF，不为诊断重新解码大数据。补齐仍无法保证浏览器能报告内部资源失败或OOM，必要时需相同设备和文件复现。

## 证据

详细记录：`.seo-cache/monitoring-release/2026-11-04/`。此前本地验收：`.seo-cache/monitoring-improvements/2026-11-04/`。密钥仅服务端配置，不在报告或源码中。
