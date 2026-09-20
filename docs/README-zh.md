# Zhiyi Chen 个人网站

网站已由 Jekyll 迁移为 React、TypeScript 和 Vite，配合 Tailwind CSS、Framer Motion 与 Lucide。主页借鉴 Xiang Liu 网站的版式，使用自己的研究内容与论文配图；配色采用红色、橙黄色与淡粉色，浅色模式使用淡粉底色，深色模式使用深玫瑰底色搭配淡粉装饰。

## 本地运行

继续使用 `cozy-site` Conda 环境：

```bash
conda env update -n cozy-site -f environment.yml
bash scripts/with-cozy-env.sh npm ci
bash run_server.sh
```

新机器将第一行替换为 `conda env create -f environment.yml`。启动脚本自动选择环境，并明确优先使用环境内的 Node.js 22/npm，避免 IDE 的 PATH 意外选中系统 Node。

## 修改内容

- `_data/profile.yml`：个人资料、新闻、研究兴趣、论文、首屏亮点、教育、奖项、活动与 Diagram 地址。
- `_posts/`：Markdown 文章。`published: false` 的草稿不会进入前端包或生产页面；当前草稿仍未发布。
- `public/images/`：线上使用的头像、论文配图和图标。两张原始个人照片仍保存在 `images/`；旧头像和未使用的图片版本归档在本地 `local-backups/`，不会提交或部署。
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

GitHub Actions 构建并发布 `dist/`。当前仓库 Settings → Pages 的 Source 已切换为 GitHub Actions；复制项目到新仓库时也需使用该设置。本地开发不会推送或发布网站。

## 旧文件清理

旧 Jekyll 空目录、项目内 Ruby 依赖与缓存、`_site/` 构建产物、未接入的 Scholar 抓取脚本、模板图片、重复图标和临时参考站截图脚本均已清理。旧代码可从 Git 历史恢复；博客草稿、原始个人照片、头像备份和许可证保留。当前开发依赖 `node_modules/` 与构建输出 `dist/` 仍用于新版网站。
