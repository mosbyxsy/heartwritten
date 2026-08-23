import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 脚本可能从任意工作目录执行，因此根据当前模块路径反推出项目根目录，
// 不依赖 process.cwd()，也就不会因调用位置不同而读错文件。
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'docs');
const assetsDirectory = path.join(outputDirectory, 'assets');
const htmlPath = path.join(outputDirectory, 'index.html');

/**
 * 把 HTML 中的相对资源地址解析为 docs 内的绝对文件路径。
 * 这里只允许本地构建资源：远程 URL/data URL 无法读取为文件；路径穿越检查则
 * 防止意外读取 docs 目录之外的内容。
 */
function resolveLocalAsset(assetUrl) {
  if (/^(?:[a-z]+:)?\/\//i.test(assetUrl) || assetUrl.startsWith('data:')) {
    throw new Error(`不能内联远程资源：${assetUrl}`);
  }

  const assetPath = path.resolve(outputDirectory, assetUrl.replace(/^\.\//, ''));
  const relativePath = path.relative(outputDirectory, assetPath);

  // path.relative 返回 .. 开头或绝对路径时，说明目标已逃逸出 docs。
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`资源超出 docs 目录：${assetUrl}`);
  }

  return assetPath;
}

/**
 * 查找一类 HTML 标签，异步读取每个标签对应资源，再逐个替换为内联内容。
 * 当 Vite 输出结构发生变化、完全找不到目标资源时主动失败，避免悄悄产出一个
 * 看似成功但无法离线运行的 HTML。
 */
async function inlineMatches(html, pattern, label, createReplacement) {
  const matches = [...html.matchAll(pattern)];
  let result = html;

  if (matches.length === 0) {
    throw new Error(`没有找到可内联的${label}资源。`);
  }

  for (const match of matches) {
    const replacement = await createReplacement(match);
    // 使用替换函数可避免 replacement 中的 $&、$1 等字符被当作替换模板解析。
    result = result.replace(match[0], () => replacement);
  }

  return result;
}

// Vite 已先完成打包，当前 HTML 中的资源名包含内容哈希，不能提前写死文件名。
let html = await readFile(htmlPath, 'utf8');

// 将全部本地 stylesheet 链接替换为 style 标签。
html = await inlineMatches(
  html,
  /<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi,
  '样式',
  async (match) => {
    const css = await readFile(resolveLocalAsset(match[1]), 'utf8');
    // 防止 CSS 文本意外包含 </style，从而过早关闭内联标签。
    return `<style>\n${css.replace(/<\/style/gi, '<\\/style')}\n</style>`;
  },
);

// 将全部带 src 的脚本替换为内联 ES module。
html = await inlineMatches(
  html,
  /<script\b(?=[^>]*\bsrc=["']([^"']+)["'])[^>]*><\/script>/gi,
  '脚本',
  async (match) => {
    const javascript = await readFile(resolveLocalAsset(match[1]), 'utf8');
    // 单文件产物不再保留 assets 下的 map，因此同时移除 sourceMappingURL 注释。
    const withoutSourceMap = javascript.replace(/\n?\/\/# sourceMappingURL=.*$/gm, '');
    // 与 CSS 同理，转义可能出现在字符串中的闭合脚本标签。
    return `<script type="module">\n${withoutSourceMap.replace(/<\/script/gi, '<\\/script')}\n</script>`;
  },
);

// 统一换行符，保证不同操作系统上生成结果稳定。
html = html.replace(/\r\n?/g, '\n');
await writeFile(htmlPath, html, 'utf8');

// 所有内容均已进入 index.html，删除 assets 后最终目录只保留一个可交付文件。
await rm(assetsDirectory, { recursive: true, force: true });

// 输出 UTF-8 实际字节数，方便观察单文件体积变化。
const size = Buffer.byteLength(html);
console.log(`单文件已生成：docs/index.html (${(size / 1024).toFixed(1)} KiB)`);
