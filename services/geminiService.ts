import { GoogleGenAI } from "@google/genai";
import { RepoContext } from "../types";

const GEMINI_MODEL = "gemini-3-pro-preview";

export const generateSkillAnalysis = async (context: RepoContext): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let repoUrl = `https://github.com/${context.info.owner}/${context.info.name}`;
    let title = context.info.name;

    if (context.subPath) {
        repoUrl += `/tree/${context.info.defaultBranch}/${context.subPath}`;
        title += ` / ${context.subPath.split('/').pop()}`;
    }

    // Construct a focused prompt based on the user's template
    const prompt = `
你是一位资深的软件架构师。请根据提供的代码库上下文，严格按照指定的 Markdown 模板生成一份“技能分析报告”。

**上下文说明:**
本报告针对仓库 **${context.info.owner}/${context.info.name}** ${context.subPath ? `中的特定模块/技能 **${context.subPath}**` : ''} 进行分析。
请确保分析仅聚焦于提供的文件结构和代码内容。

**基本信息:**
- 仓库链接: ${repoUrl}
- 描述: ${context.info.description || '无'}

**文件结构 (${context.subPath ? '子目录范围' : '根目录'}):**
\`\`\`
${context.structure}
\`\`\`

**README:**
${context.readme.substring(0, 15000)}

**package.json:**
${context.packageJson || '不可用'}

---

**输出模板要求 (请严格遵守):**

1.  **标题格式**: # ${title} 技能分析报告
2.  **来源链接**: - 技能来源：\`${repoUrl}\`
3.  **禁止事项**: **严禁使用 Emoji**。
4.  **内容要求**: 语言精炼、专业、客观。

**目标输出格式:**

# ${title} 技能分析报告

- 技能来源：\`${repoUrl}\`

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
[请结合提供的文件结构进行解释。]

`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "你是一个精确、专业的技术分析师。请严格按照用户的模板输出 Markdown 报告，不要添加任何开场白或结束语。使用中文。直接输出最终报告内容，不要输出思考过程。",
        thinkingConfig: { thinkingBudget: 2048 } // Set valid budget for thinking model
      }
    });

    let text = response.text || "无法生成分析报告。";
    
    // Post-processing: Remove <think> tags if they slip through
    // Using a more inclusive regex just in case
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return text;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "无法连接到 AI 服务。");
  }
};