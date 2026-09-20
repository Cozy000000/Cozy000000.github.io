# Zhiyi Chen 个人网站

网站已由 Jekyll 迁移为 React、TypeScript 和 Vite，配合 Tailwind CSS、Framer Motion 与 Lucide。主页借鉴 Xiang Liu 网站的版式，使用自己的研究内容与论文配图；配色以《新世纪福音战士》明日香为灵感，采用红色、橙黄色与炭黑，支持浅色和深色模式。

## 本地运行

继续使用 `cozy-site` Conda 环境：

```bash
conda env update -n cozy-site -f environment.yml
bash scripts/with-cozy-env.sh npm ci
bash run_server.sh
```

新机器将第一行替换为 `conda env create -f environment.yml`。启动脚本自动选择环境，并明确优先使用环境内的 Node.js 22/npm，避免 IDE 的 PATH 意外选中系统 Node。既有环境中的 Ruby 不需要删除。

## 修改内容

- `_data/profile.yml`：个人资料、新闻、研究兴趣、论文、首屏亮点、教育、奖项、活动与 Diagram 地址。
- `_posts/`：Markdown 文章。`published: false` 的草稿不会进入前端包或生产页面；当前草稿仍未发布。
- `public/images/`：线上使用的压缩头像与论文配图。原始个人照片仍保存在 `images/`。
- `src/components/` 与 `src/styles.css`：页面布局、组件与样式。

代表作和首屏论文亮点使用论文 ID 读取同一份数据。论文配图来源见 [asset-sources.md](asset-sources.md)。

## 验证

```bash
bash scripts/with-cozy-env.sh npm run lint
bash scripts/with-cozy-env.sh npm run build
bash scripts/with-cozy-env.sh npm test
bash scripts/with-cozy-env.sh npm run test:static
bash scripts/with-cozy-env.sh npm run test:browser
bash scripts/with-cozy-env.sh npm run preview
```

构建输出为 `dist/`，保留 `/blog/`、`/drawing/` 以及 `/about/`、`/about.html` 的跳转。首页兼容旧章节锚点。Blog、Diagram 入口已移到页脚。

GitHub Actions 可构建并发布 `dist/`。上线前在仓库 Settings → Pages 中确认 Source 为 GitHub Actions；本地开发不会推送或发布网站。
