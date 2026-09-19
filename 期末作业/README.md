# 校园食堂信息与数据展示中心（期末作业）

围绕「校园学习生活 —— 食堂」主题的响应式前端应用：菜品查询、就餐数据图表、餐厅三维布局展示。

## 一、功能与要求对照

| 作业要求 | 实现情况 |
| --- | --- |
| 信息首页 + 至少 2 个功能页面 | `index.html`（首页）+ `dining.html`（食堂查询）+ `stats.html`（数据统计），共 3 个页面，共用一套导航 |
| 响应式适配手机和桌面 | Bootstrap 5 栅格 + 自定义媒体查询，三档适配 1280 / 768 / 375，导航自动折叠 |
| 交互查询 / 管理模块 | 查询页：关键词即时搜索 + 食堂 / 类别 / 楼层 / 价位 / 辣度五项筛选 + 重置；评价管理：添加（含逐项校验）与删除 |
| 基于 JSON 的数据加载 | jQuery `$.getJSON` 读取本地 `data/canteens.json`（4 食堂 + 18 菜品）、`data/stats.json`（一周三餐 / 各食堂人次 / 类别占比） |
| 至少两类有效图表 | ECharts：折线图（首页一周三餐趋势）、柱状图 + 饼图（统计页），共三类 |
| 与主题相关的三维展示 | 首页 Three.js 场景：一层餐厅布局（档口、圆桌座椅、排队人流、吊灯），支持拖拽旋转 / 滚轮缩放 / 右键平移 |
| 完整的错误提示 | 见下文「错误提示说明」 |
| 运行说明 | 见下文「运行方式」 |

技术栈：Bootstrap 5 + jQuery 3.7 + ECharts 5 + Three.js（全部为 `libs/` 内本地副本，不依赖 CDN）。

## 二、目录结构

```text
期末作业/
├─ index.html              # 首页：数据概览 + 快捷搜索 + 折线图 + 三维展示区
├─ dining.html             # 功能页1：菜品搜索筛选 + 评价添加/删除
├─ stats.html              # 功能页2：柱状图 + 饼图
├─ css/style.css           # 主题样式（暖橙色系）与响应式适配
├─ js/
│  ├─ common.js            # 公共：全局错误提示 + JSON 加载（纯 JS，不依赖 jQuery）
│  ├─ main.js              # 首页逻辑：概览卡片 + 趋势折线图
│  ├─ dining.js            # 查询页逻辑：搜索筛选 + 评价管理
│  └─ stats.js             # 统计页逻辑：柱状图 + 饼图
├─ data/
│  ├─ canteens.json        # 食堂与菜品数据（示例数据）
│  ├─ stats.json           # 图表统计数据（示例数据）
│  ├─ dining.empty.json    # 空数据自测样本
│  └─ stats.empty.json     # 空数据自测样本
├─ three-d/
│  ├─ scene.js             # Three.js 餐厅场景（嵌入首页，含 WebGL 降级）
│  └─ libs/                # three.min.js、OrbitControls.js（本地副本）
├─ libs/                   # bootstrap / jquery / echarts（本地副本）
└─ README.md
```

## 三、运行方式

所有第三方库均为**本地副本**，运行时不依赖网络；但页面用 AJAX 读取本地 JSON，浏览器安全策略下**直接双击打开（file://）会报错**，因此请用本地静态服务器：

```bash
# 进入项目目录
cd 期末作业

# 方式一：Python（课堂环境已安装 Anaconda3）
python -m http.server 8787

# 方式二：任意静态服务器，如 VS Code 的 Live Server
```

然后访问：<http://localhost:8787/index.html>

**自测地址：**

- 食堂查询页：<http://localhost:8787/dining.html>
- 数据统计页：<http://localhost:8787/stats.html>
- 统计页空数据自测：<http://localhost:8787/stats.html?data=data/stats.empty.json>
- 查询页空数据自测：<http://localhost:8787/dining.html?data=data/dining.empty.json>

## 四、错误提示说明

| 场景 | 提示行为 |
| --- | --- |
| `file://` 直接打开页面（JSON 被浏览器拦截） | 页面顶部红色提示条：说明原因并给出 `python -m http.server` 启动命令 |
| JSON 文件缺失（404） | 红色提示条：指出缺失文件路径，提示检查 `data/` 目录 |
| 服务器未运行 / 网络异常 | 红色提示条：显示错误类型与状态码，提示启动服务器后刷新 |
| jQuery 库加载失败 | 红色提示条（由不依赖 jQuery 的 `common.js` 弹出），提示检查 libs 文件 |
| ECharts 库加载失败 | 红色提示条，图表区域不初始化 |
| Three.js 库缺失 / WebGL 不可用 | 三维区域内显示降级提示文字，页面其余功能不受影响 |
| 搜索或筛选无结果 | 查询列表区显示琥珀色中性提示「没有符合条件的菜品」+ 重置引导 |
| 数据文件内容为空 | 图表区 / 列表区显示琥珀色中性提示，不与加载失败混淆 |
| 评价表单校验不通过 | 对应输入框下方逐项显示红色错误文字（菜品 / 昵称 / 评分 / 内容） |
| localStorage 不可用（隐私模式） | 红色提示条，评价仅本次会话内显示 |

## 五、数据来源说明

- 食堂、菜品、就餐统计数据均为**本人编写的示例数据**，JSON 内 `source` 字段已标注「示例数据，仅用于课程作业演示」。
- 三维场景为代码建模（几何体组合），无外部模型、贴图、图片与网络字体。
- 页面运行时不发起任何外部网络请求。

## 六、浏览器兼容

- 推荐 Chrome / Edge / Firefox 现代浏览器（需支持 WebGL 与 ES6）。
- 手机端建议通过局域网 IP 访问本地服务器（如 `http://192.168.x.x:8787/index.html`）查看响应式效果。
