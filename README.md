# Skill Synapse

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/pnpm-10-F69220?style=flat-square&logo=pnpm" alt="pnpm" />
</p>

<p align="center">
  <b>智能分析 GitHub 上的 MCP Skills，一键生成专业报告</b>
</p>

---

## ✨ 功能特点

- **🔍 智能仓库分析** - 输入 GitHub 仓库 URL，自动分析其中的 MCP Skill 结构和实现
- **🎯 多 Skill 支持** - 自动发现仓库中的多个 Skills，支持选择特定目录进行分析
- **🤖 AI 驱动报告** - 基于 AI 生成专业的 Skill 分析报告，包含架构、功能和使用说明
- **🔥 热门发现** - 探索社区热门的 MCP Skills，一键分析学习
- **📜 历史管理** - 自动保存分析历史，方便随时回顾和对比
- **⚙️ 灵活配置** - 支持自定义 AI 模型和 API Key，可配置字体显示
- **📋 快捷粘贴** - 智能识别 `npx skills add` 命令格式，一键解析

## 🚀 快速开始

### 环境要求

- Node.js 20+
- pnpm 10+
- OpenRouter API Key

### 安装

```bash
# 克隆仓库
git clone https://github.com/mylinwu/SkillSynapse.git
cd SkillSynapse

# 安装依赖
pnpm install
```

### 开发运行

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

### 生产构建

```bash
pnpm build
pnpm start
```

## 📝 使用指南

### 基础分析

1. 在输入框中粘贴 GitHub 仓库 URL（如 `https://github.com/owner/repo`）
2. 可选择指定 Skill 子目录名称（可选）
3. 点击发送按钮，等待 AI 生成分析报告
4. 支持直接粘贴类型 `npx skills add https://github.com/vercel-labs/skills --skill find-skills` 的命令，自动解析 URL 和 Skill 名称
5. 支持直接粘贴仓库地址，会自动探查有哪些 Skill 可以分析

### 快捷命令粘贴

直接粘贴 `npx skills add` 格式的命令，自动解析 URL 和 Skill 名称：

```
npx skills add https://github.com/microsoft/github-copilot-for-azure --skill azure-deploy
```

### 配置设置

点击右上角设置图标，可配置：

- **API Key** - OpenRouter API Key 用于 AI 分析
- **AI 模型** - 选择不同的 AI 模型（默认: `openrouter/free`）
- **字体** - 自定义报告字体（CSS font-family 格式）

### 热门 Skills 发现

首页底部展示社区热门的 MCP Skills，点击即可快速分析学习。

## 🏗️ 技术架构

### 前端

- **框架**: Next.js 16 (App Router)
- **UI 库**: React 19
- **样式**: Tailwind CSS v4
- **图标**: Lucide React
- **渲染**: React Window（虚拟列表优化）

### AI 服务

- **SDK**: Vercel AI SDK
- **Provider**: OpenRouter
- **默认模型**: Google Gemini 2.0 Flash

### 代码规范

- **Lint**: Biome
- **类型**: TypeScript 5
- **包管理**: pnpm

## 📁 项目结构

```
skill-synapse/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 主页面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/             # React 组件
│   ├── Dashboard.tsx      # 首页仪表板
│   ├── ReportContainer.tsx # 报告展示
│   ├── HistorySidebar.tsx  # 历史记录侧边栏
│   ├── SettingsModal.tsx   # 设置弹窗
│   └── ...
├── hooks/                  # 自定义 Hooks
│   ├── useHistory.ts       # 历史记录管理
│   ├── useSettings.ts      # 用户设置
│   └── useHotSkills.ts     # 热门 Skills
├── services/               # 服务层
│   ├── aiService.ts        # AI 分析服务
│   ├── githubService.ts    # GitHub API
│   └── skillService.ts     # Skill 发现服务
├── types.ts                # TypeScript 类型定义
└── package.json
```

## 🔧 配置说明

### 支持的 AI 模型自定义

- 支持 OpenRouter 支持的所有模型

### 环境变量（可选）

如需默认配置，可创建 `.env.local`：

```env
# 可选：默认 API Key（建议用户在 UI 中配置）
# OPENROUTER_API_KEY=your_api_key_here
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码规范

```bash
# 检查代码
pnpm lint

# 格式化代码
pnpm format
```

## 📄 许可证

[MIT](LICENSE) © 2025 Skill Synapse Contributors

---

<p align="center">
  由 <a href="https://github.com/mylinwu">@mylinwu</a> 用 ❤️ 构建
</p>
