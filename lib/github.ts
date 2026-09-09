// Verify machine-user (matbao-vibe-bot) đã được thí sinh add làm collaborator vào repo
// private của họ — xem docs/PRD.md mục 4 "GitHub verify". Chỉ hỗ trợ GitHub (đã chốt
// với user); KHÔNG hỗ trợ GitLab trong iMVP.

function parseGithubRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("github.com")) return null;
    const parts = u.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

export async function verifyGithubAccess(
  repoUrl: string
): Promise<{ ok: boolean; reason?: string }> {
  const pat = process.env.GITHUB_BOT_PAT;
  if (!pat) {
    return { ok: false, reason: "Chưa cấu hình GITHUB_BOT_PAT trên server" };
  }
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) {
    return { ok: false, reason: "Link không phải repo GitHub hợp lệ" };
  }
  const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (res.status === 200) return { ok: true };
  if (res.status === 404) {
    return {
      ok: false,
      reason: "matbao-vibe-bot chưa được add làm collaborator (hoặc repo không tồn tại)",
    };
  }
  return { ok: false, reason: `GitHub API trả lỗi ${res.status}` };
}
