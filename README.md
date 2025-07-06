## ipe-plugin-thwiki-163lrc

IPE 插件——THBwiki 网易云音乐协作歌词页编辑

<del>为什么只是 IPE ？小工具放在旁边 toolbox 里挺合适的不是吗</del>

### 开发
```shell
pnpm install
```

### 调试
```shell
pnpm run dev
```

在控制台/你的`common.js`页面中添加 
```javascript
mw.loader.load("https://unpkg.com/mediawiki-inpageedit");
mw.loader.load("http://localhost:3000/main.js");
// 每次重载时刷新页面
```

### 打包
```shell
pnpm run build
```
