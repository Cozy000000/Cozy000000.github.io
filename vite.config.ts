import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { generateContent, pageHtml, pageList, projectRoot, writeStaticPages } from './scripts/generate-content.mjs';

function siteContent(): Plugin {
  let content: Awaited<ReturnType<typeof generateContent>>;
  let outDir = '';
  return {
    name: 'site-content',
    async configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      content = await generateContent(config.root);
    },
    transformIndexHtml(html, context) {
      const route = pageList(content).find((page) => page.url === context.path) ?? pageList(content)[0];
      return pageHtml(html, route, content.profile);
    },
    configureServer(server) {
      server.watcher.add([path.join(projectRoot, '_data'), path.join(projectRoot, '_posts')]);
      const rebuild = async (file: string) => {
        if (!file.startsWith(path.join(projectRoot, '_data/')) && !file.startsWith(path.join(projectRoot, '_posts/'))) return;
        try {
          content = await generateContent();
          server.ws.send({ type: 'full-reload' });
        } catch (error) {
          server.config.logger.error(String(error));
          server.ws.send({ type: 'error', err: { message: String(error), stack: '' } });
        }
      };
      server.watcher.on('add', rebuild).on('change', rebuild).on('unlink', rebuild);
      // Serve the same React entry at real site routes during development.
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '/';
        const route = pageList(content).find((page) => page.url === url || page.url === `${url}/`);
        if (!route || url === '/') return next();
        try {
          const template = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
          const html = await server.transformIndexHtml(route.url, template);
          res.statusCode = route.noindex ? 404 : 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (error) { next(error as Error); }
      });
    },
    async writeBundle() {
      await writeStaticPages(outDir, content);
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [siteContent(), react()],
  build: { outDir: 'dist', emptyOutDir: true },
});
