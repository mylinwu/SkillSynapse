export interface RepoInfo {
  owner: string;
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  defaultBranch: string;
}

export interface RepoContext {
  info: RepoInfo;
  readme: string;
  structure: string; // Text representation of file tree
  packageJson?: string;
  subPath?: string; // The specific subdirectory path analyzed
}

export interface AnalysisReport {
  id: string;
  repoUrl: string;
  repoName: string;
  skillName?: string; // Optional specific skill/directory name
  timestamp: number;
  markdown: string;
  status: 'loading' | 'success' | 'error';
  errorMessage?: string;
}

export interface TreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface SkillFeedItem {
  name: string;
  url: string;
  description: string;
  tags: string[];
}