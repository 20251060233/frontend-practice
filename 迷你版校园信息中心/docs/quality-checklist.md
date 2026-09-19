# 质量清单自查记录

- 作品：迷你版校园公共信息与数据展示中心（`integration/`）
- 自查日期：2026-09-19
- 自查环境：Windows 11 + Chrome（headless 1280/768/375 三档模拟）+ 本地静态服务器 `python -m http.server 8787`
- 自查人：本人（20251060233）

## 一、自查总表

| 序号 | 检查项 | 操作方法 | 预期 | 结果 | 证据截图 |
| --- | --- | --- | --- | --- | --- |
| 1 | 桌面宽度 1280px | 窗口 1280×2080 打开首页 | 导航四入口横排、模块卡片 4 列、自习室 3 列、图表完整 | 通过 | [01-width-desktop-1280.png](../screenshots/01-width-desktop-1280.png) |
| 2 | 平板宽度 768px | 窗口 768×2450 | 卡片/自习室变 2 列，导航折叠为汉堡按钮 | 通过 | [02-width-tablet-768.png](../screenshots/02-width-tablet-768.png) |
| 3 | 手机宽度 375px | 窗口 375×3800 | 全部单列堆叠，标题不撑破首屏 | 通过 | [03-width-mobile-375.png](../screenshots/03-width-mobile-375.png) |
| 4 | 断网 / 无服务器 | 直接以 `file://` 协议打开 index.html | 本地样式与交互正常；fetch 失败显示红色提示而非白屏 | 通过 | [04-offline-tip.png](../screenshots/04-offline-tip.png) |
| 5 | Console 无报错 | 本地服务器加载，采集 error/warn/资源错误/Promise 异常 | 错误 0 条、警告 0 条 | 通过 | [05-console-clean.png](../screenshots/05-console-clean.png) |
| 6 | 空数据 | 打开 `index.html?data=data/data.empty.json` | 显示中性空数据提示，图表区留白不报错 | 通过 | [07-empty-data.png](../screenshots/07-empty-data.png) |
| 7 | 三维场景渲染 | 打开 three-d/scene.html | 校门/教学楼/图书馆/钟楼等正常渲染，可返回首页 | 通过 | [06-three-d-scene.png](../screenshots/06-three-d-scene.png) |

## 二、逐项说明

### 1~3. 三档宽度（1280 / 768 / 375）

- 1280px：导航完整横排，功能卡片一行 4 张，自习室卡片一行 3 张。
- 768px：触达 Bootstrap `lg` 断点，导航折叠为汉堡按钮（点击可展开，选链接后自动收起）；卡片与自习室变为 2 列。
- 375px：触达 `sm` 断点，全部单列；横幅标题字号已收敛为 1.45rem，避免大标题生硬换行。

### 4. 断网提示

- 所有 CSS/JS/三维库均为本地副本，断网（file://）下页面样式与筛选交互不受影响。
- Chrome 安全策略禁止 file:// 页面 fetch 本地 JSON，`js/app.js` 的 catch 分支将状态条置为红色：
  「数据加载失败：请检查网络连接或数据文件路径（当前可能处于断网状态）」，并有 `console.error` 记录原因。

### 5. Console 无报错

- 自查方式：页面加载前注入采集器（捕获 `window.onerror`（含资源错误，捕获阶段）、`unhandledrejection`，并 hook `console.error/console.warn`），页面与图表渲染完成后汇总到悬浮面板。
- 结果：**错误 0 条、警告 0 条**；功能探针显示自习室卡片 8 间、ECharts canvas 已渲染、数据状态条"数据加载完成"。
- 备注：在带 HMR 注入的预览工具中曾出现 `/@vite/client` 的 SyntaxError 噪音，经核实该路径在本项目的 Python 静态服务器上返回 404、项目源码中也不存在该引用，属于预览环境注入，与作品代码无关；使用干净的 headless Chrome 复查为 0 条。

### 6. 空数据

- 自测样本 `data/data.empty.json` 的 `records` 为空数组，通过 `?data=` 参数加载（不污染正常数据）。
- 表现：琥珀色（warning 配色，区别于断网红色）提示「本月暂无自习室使用量数据，图表将在数据更新后自动渲染」，并清空已有图表，控制台无报错。

### 7. 三维场景与降级

- 正常浏览器：场景动画（旗帜、云、钟楼指针）与 OrbitControls 交互正常，右上角「← 返回首页」回到 `index.html#home`。
- 不支持 WebGL 的环境：`scene.js` 初始化前先检测，失败则显示降级提示卡片并停止初始化，避免白屏。
