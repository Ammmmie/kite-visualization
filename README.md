# 板鹞风筝科普交互网页

这是一个用于展示板鹞风筝制作流程、骨架规律和筝面纹样的交互式网页。

## 查看方式

源码版本：

```bash
npm install
npm run dev
```

展示版：

展示版位于 `dist/`。建议使用本地静态服务器打开，不建议直接双击 `index.html`。

```bash
npm run preview
```

## 构建方式

```bash
npm run build
npm run preview
```

## 主要交互

- 制作流程自动播放
- hover 播放 GIF
- 点击步骤显示说明卡片
- 纹样与骨架图片自动循环播放
- 鼠标长按拖动横向浏览
- 点击图片放大预览

## 注意事项

- 不要删除 `src/assets` 中的素材。
- 不要直接依赖 D 盘绝对路径，素材应保留在项目内部。
- 如果转发给别人查看，推荐发送展示版 `dist` 压缩包，或部署到 Vercel / Netlify 后发送链接。
