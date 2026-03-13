import type { RepoContext } from "../types";

export const DEFAULT_ANALYSIS_PROMPT_TEMPLATE = `你是一位资深的软件架构师。请根据提供的代码库上下文，严格按照指定的 Markdown 模板生成一份“技能分析报告”。

**上下文说明:**
本报告针对仓库 **{{repoFullName}}** {{subPathDescription}} 进行分析。
请确保分析仅聚焦于提供的文件结构和代码内容。

**基本信息:**
- 仓库链接: {{repoUrl}}
- 描述: {{description}}

**文件结构 ({{scopeLabel}}):**
\`\`\`
{{structure}}
\`\`\`

**README:**
{{readme}}

**package.json:**
{{packageJson}}

---

**输出模板要求 (请严格遵守):**

1.  **标题格式**: # {{title}} 技能分析报告
2.  **来源链接**: - 技能来源：\`{{repoUrl}}\`
3.  **禁止事项**: **严禁使用 Emoji**。
4.  **内容要求**: 语言精炼、专业、客观。

**目标输出格式:**

# {{title}} 技能分析报告

- 技能来源：\`{{repoUrl}}\`

## 1. 技能用途

[在此处简明扼要地总结该模块/技能的核心功能。它解决了什么具体问题？主要面向什么场景？]

## 2. 如何使用

[基于 README 和代码分析，说明如何安装和运行。请提供核心的使用代码示例、配置步骤或启动命令。]

## 3. 目录结构

\`\`\`text
[在此处生成一个精简的 ASCII 目录树，仅列出最具代表性的核心目录和文件，去除无关的配置文件。]
\`\`\`

## 4. 作用机制分析

[在此处进行深度技术分析。]
[1. 核心逻辑是什么？]
[2. 关键模块是如何交互的？]
[3. 数据流向是怎样的？]
[请结合提供的文件结构进行解释。]`;

interface PromptContext {
	repoUrl: string;
	title: string;
	context: RepoContext;
}

export const buildAnalysisPrompt = ({
	repoUrl,
	title,
	context,
}: PromptContext): string => {
	const replacements: Record<string, string> = {
		repoFullName: `${context.info.owner}/${context.info.name}`,
		subPathDescription: context.subPath
			? `中的特定模块/技能 **${context.subPath}**`
			: "",
		repoUrl,
		description: context.info.description || "无",
		scopeLabel: context.subPath ? "子目录范围" : "根目录",
		structure: context.structure,
		readme: context.readme.substring(0, 15000),
		packageJson: context.packageJson || "不可用",
		title,
	};

	return DEFAULT_ANALYSIS_PROMPT_TEMPLATE.replaceAll(
		/{{(\w+)}}/g,
		(_, key: string) => replacements[key] || "",
	);
};
