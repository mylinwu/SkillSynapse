import { RepoContext, RepoInfo, TreeItem, SkillFeedItem } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const SKILLS_FEED_URL = 'https://cdn.jsdelivr.net/gh/NeverSight/skills_feed@main/data/skills.json';

// Helper to extract owner and repo from URL
export const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch (e) {
    return null;
  }
};

export const fetchHotSkills = async (): Promise<SkillFeedItem[]> => {
  try {
    const res = await fetch(SKILLS_FEED_URL);
    if (!res.ok) {
      throw new Error('Failed to load skills feed');
    }
    const data = await res.json();
    
    // Determine which array to use based on the JSON structure provided
    // Structure: { hot: [], trending: [], allTime: [], ... }
    let rawItems: any[] = [];
    
    if (data.hot && Array.isArray(data.hot) && data.hot.length > 0) {
      rawItems = data.hot;
    } else if (data.trending && Array.isArray(data.trending) && data.trending.length > 0) {
      rawItems = data.trending;
    } else if (data.allTime && Array.isArray(data.allTime)) {
      rawItems = data.allTime;
    } else if (Array.isArray(data)) {
      rawItems = data;
    }

    // Map data to SkillFeedItem interface
    return rawItems
      .filter((item: any) => item.source || item.url) // Ensure we have a source to build a URL
      .map((item: any) => {
        // The feed uses 'source' (e.g., "owner/repo") instead of a full URL
        const source = item.source || item.repo;
        const fullUrl = source && !source.startsWith('http') 
          ? `https://github.com/${source}` 
          : (item.url || '');

        return {
          name: item.name || item.skillId || 'Unknown Skill',
          url: fullUrl,
          // Use description if available, otherwise fall back to install stats or empty string
          description: item.description || (item.installs ? `${item.installs.toLocaleString()} installs` : ''),
          tags: [] // Tags are not present in the top-level feed item
        };
      })
      .filter((item) => item.url && item.url.includes('github.com'));

  } catch (e) {
    console.warn("Could not fetch hot skills:", e);
    return [];
  }
};

// Fetch repository details
export const fetchRepoContext = async (owner: string, repo: string, skillName?: string): Promise<RepoContext> => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };

  // 1. Get Repo Info
  const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    if (repoRes.status === 404) throw new Error('Repository not found or private.');
    if (repoRes.status === 403) throw new Error('GitHub API rate limit exceeded. Please try again later.');
    throw new Error(`GitHub API Error: ${repoRes.statusText}`);
  }
  const repoJson = await repoRes.json();
  
  const info: RepoInfo = {
    owner: repoJson.owner.login,
    name: repoJson.name,
    description: repoJson.description,
    stars: repoJson.stargazers_count,
    language: repoJson.language,
    defaultBranch: repoJson.default_branch,
  };

  // 2. Get File Structure (Tree)
  // We fetch the full tree first to locate the skill directory if needed
  let fullFiles: TreeItem[] = [];
  try {
    const treeRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${info.defaultBranch}?recursive=1`, { headers });
    if (treeRes.ok) {
      const treeJson = await treeRes.json();
      fullFiles = treeJson.tree;
    }
  } catch (e) {
    console.warn('Could not fetch file tree', e);
  }

  // 3. Locate Target Path (if skillName provided)
  let targetPath = '';
  let targetFiles = fullFiles;

  if (skillName && skillName.trim() !== '') {
    // Find a directory that matches the skill name
    // We prioritize exact matches on the folder name
    // Example: if skillName is "weather", we look for "weather" or "skills/weather" or "packages/weather"
    const matchingDir = fullFiles.find(f => 
      f.type === 'tree' && (f.path === skillName || f.path.endsWith(`/${skillName}`))
    );

    if (matchingDir) {
      targetPath = matchingDir.path;
      // Filter files that are INSIDE this directory
      targetFiles = fullFiles.filter(f => f.path.startsWith(`${targetPath}/`));
    } else {
      // Fallback: If strict directory not found, try fuzzy or just warn
      console.warn(`Directory for skill "${skillName}" not found. Falling back to root.`);
      // Optional: throw error if strict mode is desired
      // throw new Error(`Could not find directory for skill: ${skillName}`);
    }
  }

  // Process Structure String
  const relevantFiles = targetFiles
    .filter(f => !f.path.includes('.git/') && !f.path.includes('node_modules') && !f.path.includes('dist/'))
    .slice(0, 150); // Hard limit

  const structure = relevantFiles
    .map(f => {
      // If we are in a sub-path, strip the prefix for cleaner display
      const displayPath = targetPath ? f.path.replace(`${targetPath}/`, '') : f.path;
      return `${f.type === 'tree' ? '📁' : '📄'} ${displayPath}`;
    })
    .join('\n');


  // 4. Get README (Context Aware)
  let readme = '';
  try {
    // If targetPath exists, try to fetch README from that path first
    let readmePath = 'readme'; // default API endpoint
    let isSubPath = false;

    if (targetPath) {
      // Look for a readme file in the file list for that path
      const readmeFile = targetFiles.find(f => 
        f.path.toLowerCase() === `${targetPath}/readme.md`
      );
      if (readmeFile) {
        readmePath = `contents/${readmeFile.path}`;
        isSubPath = true;
      }
    }

    const readmeRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/${readmePath}`, { headers });
    if (readmeRes.ok) {
      const readmeJson = await readmeRes.json();
      readme = atob(readmeJson.content);
    } else if (targetPath && !isSubPath) {
        // If sub-directory readme fails/doesn't exist, maybe fallback to root readme? 
        // Or just leave empty to encourage analyzing code. 
        // Let's try root readme as context backup.
        const rootReadmeRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, { headers });
        if(rootReadmeRes.ok) {
            const rootData = await rootReadmeRes.json();
            readme = `(Root README) \n` + atob(rootData.content);
        }
    }
  } catch (e) {
    console.warn('Could not fetch README', e);
    readme = 'No README available.';
  }

  // 5. Try to get package.json (Context Aware)
  let packageJson = undefined;
  try {
    let pkgPath = 'contents/package.json';
    if (targetPath) {
       pkgPath = `contents/${targetPath}/package.json`;
    }
    
    const pkgRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/${pkgPath}`, { headers });
    if (pkgRes.ok) {
      const pkgData = await pkgRes.json();
      packageJson = atob(pkgData.content);
    }
  } catch (e) {
    // Ignore if not found
  }

  return {
    info,
    readme,
    structure,
    packageJson,
    subPath: targetPath
  };
};