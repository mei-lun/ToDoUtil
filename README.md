# ToDoUtil

> 钉在桌面的极窄竖条 ToDo，记下今天要做什么 → 做完打勾 → 拖不动的事看时间线一目了然。

一个给"经常忘了今天要干啥"的人写的桌面工具。Windows 优先，跨平台可打包。

---

## 它解决什么问题

市面上的 todo 软件都太重——要建项目、分标签、设优先级，光是组织"今天要做啥"就要折腾半天。这个工具只做三件事：

1. **写下来**：左上角 ＋ 按钮 → 一行字 → 回车
2. **做完打勾**：一个圈圈，点掉就消失
3. **看历史**：归档页用长短不一的色条告诉你"哪些事拖了很久"

未做完的事第二天 0 点自动滚到今天，红色色块标深浅提醒你拖了多少天。不想追的事丢搁置池，需要再拉回来。

---

## 截图

主窗口（默认 300×360，可调）：

```
┌──────────────────────────────────┐
│ ＋                               │  ← 左上加号，点开变输入框
├──────────────────────────────────┤
│  ◀  今天 06/23  ▶      📥3  📚   │  ← 日期切换 / 搁置池 / 归档
├──────────────────────────────────┤
│ ○ ▓ 写需求文档           9:30   │  ← 圈勾选 / 延期色块 / 标题 / 时间
│ ○   买牛奶                       │
│ ○ ▓▓▓ 修登录 bug                │  ← 延期 3 天
│ ─────────                        │
│ ● 整理桌面                       │  ← 已完成沉底
└──────────────────────────────────┘
```

归档时间线：

```
6月23日
  ✓ 写需求文档    ▓▓▓▓▓▓▓▓▓▓  10天
  ✓ 买牛奶         ▓             1天
6月22日
  ✗ ~~学法语~~     ▓▓▓            3天   （灰=放弃）
```

---

## 核心特性

| | |
|---|---|
| 📝 极简输入 | ＋ 折叠/展开，无任何额外字段 |
| 📅 `@` 智能日期 | `@明天 开会` / `@6.25` / `@周三9点` 等白名单解析 |
| 🌙 0:00 自动滚动 | 没做完的事自动跟到第二天 |
| 🟥 延期色块 | 越拖越红，4 个深度档位 |
| 📥 搁置池 | "暂时不追"的事，需要时再拉回某天 |
| 📚 归档时间线 | 按完成日期分组 + 色条显示用时 |
| 🟦 GitHub 网格视图 | 横轴日期纵轴任务，一眼看哪些事拖了多久 |
| 🔎 归档搜索 | 模糊匹配标题+详情 |
| 📝 Markdown 详情 | 支持子任务清单、图片粘贴/拖拽、链接 |
| 🖼️ 图片附件 | sha256 去重，自动复制到本地 |
| ✋ 拖拽排序 | 鼠标按下即拖，跟手 |
| 🪟 钉在桌面 | 始终最前，关闭=隐藏到托盘 |
| ⌨️ 全局快捷键 | `Ctrl+Alt+T` 任意位置呼出快速输入 |
| 💾 自动备份 | 每日首启动备份 3 份 JSON，30 天保留 |
| 🛡️ 损坏自愈 | JSON 解析失败自动从最近备份恢复 |

---

## 安装

### 用户

打 release 包：

```bash
npm install
npm run build
# 产物：release/0.1.0/ToDoUtil Setup *.exe
```

双击 .exe 安装即可。数据存在 `%APPDATA%/todoutil/`（Windows）。

### 想直接体验

```bash
npm install
npm run dev
```

会启动 Vite + Electron 开发窗口。

---

## 使用速查

完整教程见 **[docs/使用教程.md](docs/使用教程.md)**（用大白话写给非技术用户）。

最常用的几条：

- **加任务**：点左上 ＋ → 输入 → 回车
- **明天的事**：输入 `@明天 内容` → 不会出现在今天，到日子才出来
- **完成**：点圆圈 → 2 秒缓冲（可撤销）→ 进归档
- **挪到明天**：鼠标悬停任务行 → 点 `→`
- **放进搁置池**：悬停 → 点 `📥`
- **放弃**：悬停 → 点 `✕`（需确认）
- **隐藏窗口**：`Esc`（不会真正退出，托盘单击恢复）
- **从任何地方记一笔**：`Ctrl+Alt+T`

---

## 技术栈

- **Electron 28** — 桌面框架
- **React 18 + Vite + TypeScript** — UI
- **Zustand** — 状态管理
- **marked + DOMPurify** — Markdown 渲染（XSS 防护）
- **electron-log** — 文件日志
- **electron-builder** — 打包
- **vitest + @testing-library/react** — 单元/集成测试

---

## 项目结构

```
todoutil/
├─ electron/                  # 主进程
│  ├─ main.ts                 # 入口
│  ├─ window-manager.ts       # 窗口/置顶/动态宽高
│  ├─ tray-manager.ts         # 系统托盘
│  ├─ shortcut-manager.ts     # 全局快捷键
│  ├─ scheduler.ts            # 0:00 自动滚动
│  ├─ ipc-handlers.ts         # IPC 路由
│  ├─ logger.ts               # electron-log
│  ├─ config.ts               # config.json 读写
│  └─ storage/
│     ├─ paths.ts             # 数据目录解析
│     ├─ atomic-write.ts      # 原子写 + 损坏恢复
│     ├─ tasks-repo.ts        # tasks.json CRUD
│     ├─ pool-repo.ts         # pool.json CRUD
│     ├─ archive-repo.ts      # archive.json 追加+搜索
│     ├─ attachments.ts       # 图片去重 + 路径解析
│     └─ backup-service.ts    # 每日备份 + 30 天清理
├─ src/                        # 渲染进程
│  ├─ App.tsx                  # 路由 + Esc 多级处理
│  ├─ api.ts                   # 类型化 IPC wrapper
│  ├─ types.ts                 # Task / Config 类型
│  ├─ store/                   # Zustand stores（tasks/pool/archive/view/config）
│  ├─ utils/
│  │  ├─ date-parser.ts        # @ 日期/时间解析白名单
│  │  ├─ date-utils.ts         # 日期算术
│  │  ├─ markdown.ts           # marked + DOMPurify
│  │  ├─ subtasks.ts           # - [ ] 子任务计数与切换
│  │  ├─ used-days.ts          # 归档用时计算（扣除搁置期）
│  │  ├─ grid-data.ts          # 网格视图数据准备
│  │  └─ task-actions.ts       # 推迟/搁置/放弃/拉回
│  ├─ components/
│  │  ├─ AddInput.tsx          # ＋ 折叠/展开输入框
│  │  ├─ TopBar.tsx            # 日期切换条
│  │  ├─ TaskRow.tsx           # 任务行 + hover 操作
│  │  ├─ TaskDetail.tsx        # 行内详情区
│  │  ├─ MarkdownView.tsx      # 渲染态（子任务可勾）
│  │  ├─ MarkdownEditor.tsx    # 源码编辑 + 图片粘贴
│  │  ├─ DelayBadge.tsx        # 延期色块
│  │  ├─ DatePickerPopover.tsx # 日期选择弹窗
│  │  ├─ Timeline.tsx          # 归档时间线
│  │  ├─ HeatmapGrid.tsx       # 归档网格
│  │  └─ MoveModeOverlay.tsx   # 移动模式覆盖层
│  ├─ views/
│  │  ├─ TodayView.tsx         # 今日列表 + 拖拽排序
│  │  ├─ PoolView.tsx          # 搁置池
│  │  ├─ ArchiveView.tsx       # 归档（时间线/网格切换）
│  │  ├─ SettingsView.tsx      # 设置面板
│  │  └─ QuickAddOverlay.tsx   # 全局快捷键唤出的浮层
│  └─ styles/
│     ├─ globals.css
│     └─ tokens.css            # macOS 风格设计 token
├─ tests/                       # vitest（88 个测试）
│  ├─ main/                    # 主进程：repo/atomic-write/backup/attachments...
│  └─ renderer/                # 渲染：parser/subtasks/used-days/grid-data/integration
├─ docs/
│  ├─ 使用教程.md              # 用户向教程
│  └─ superpowers/             # 设计文档 + 实现计划
└─ electron-builder.json        # 打包配置
```

---

## 开发

```bash
npm install
npm run dev          # 启动开发窗口（vite + electron）
npm test             # vitest run
npm run test:watch   # vitest watch 模式
npm run build        # 编译 + 出 Windows 安装包
```

### 数据目录

默认在 Electron 的 `userData`（Windows: `%APPDATA%/todoutil`）。结构：

```
todoutil/
├─ tasks.json      # status=active 的任务（今天 + 未来 + 延期）
├─ pool.json       # status=pooled 的任务
├─ archive.json    # status=done/abandoned 的任务
├─ config.json     # 用户配置
├─ attachments/    # 图片附件 <task-id>/<sha256>.<ext>
├─ backups/        # YYYY-MM-DD-<file>.json
└─ logs/main.log
```

设置面板可改数据目录（指向 OneDrive 等同步目录实现多端共享，但**不要两台同时打开**——会冲突）。

### 调试

- 主进程日志：`%APPDATA%/todoutil/logs/main.log`（设置面板有"打开目录"按钮）
- 渲染进程：开发时自动打开 DevTools（可分离窗口）
- 测试：`npm test` 输出 vitest 报告，覆盖核心 utils + storage repo + 几个集成场景

---

## 设计文档与实现计划

如果你想了解每个功能背后的取舍：

- [需求与设计](docs/superpowers/specs/2026-06-23-todoutil-design.md) — 41 项已确认决策表
- [13 阶段实现计划](docs/superpowers/plans/2026-06-23-todoutil.md) — TDD 步骤、文件分工、commit 列表

---

## 设计原则（写给二开 / fork 的人）

1. **YAGNI**：任何"以后可能用得上"的字段、按钮、设置都不要。
2. **数据不丢**：原子写 + 每日备份 + 损坏自动从备份恢复。永远不静默 catch 后丢数据。
3. **键盘友好**：Esc 多级处理（移动模式 → 输入框 → 编辑 → 详情展开 → 隐藏窗口）。
4. **拖拽要跟手**：pointer 事件直接驱动，不用 HTML5 drag。
5. **窗口只长不缩**：避免反复跳动；用户想缩自己拖底边。
6. **归档只读**：历史是事实，不允许回头修改。
7. **测试守底线**：日期解析、用时计算、路径穿越防护、损坏恢复都有单元测试。

---

## 许可

MIT（如果你想用 / 改 / 卖请自便）。

---

## 致谢

灵感来自所有"今天到底要干啥"的早晨。
