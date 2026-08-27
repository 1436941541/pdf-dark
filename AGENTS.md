<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SEO 开发规约（2026-08-09 起，本仓库是 SEO 站）

1. **动结构先走规范**：新增/合并/下线页面、改路由、改 metadata/schema/sitemap 这类结构性改动，动手前先加载 `seo-site-dev` skill 并按它执行——不要凭默认习惯写。
2. **改完落知识库**：本次改动若涉及 **URL、目标关键词或页面定位的变化**（新增/合并/下线页面、换主打词/近义词、页面改版导致定位/意图变了），完成后必须同步更新 `~/Documents/SecondBrain/01-产品/pdfdark/PAGES.md`（本站「URL ↔ 目标词」的唯一记录），并同步 project-console 数据库对应行。纯内容优化（文案打磨/加截图/修 bug/改交互）不改变映射，不用动 PAGES.md——git 和站点 changelog 已记录。忘了这步 = 改动没做完。
