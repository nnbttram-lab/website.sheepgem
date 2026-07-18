import type { Config } from "@netlify/functions";
import { renderIndexHTML } from "../../lib/render-site.mjs";

const GITHUB_OWNER = "nnbttram-lab";
const GITHUB_REPO = "website.sheepgem";
const GITHUB_BRANCH = "main";
const GITHUB_API = "https://api.github.com";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Fetch the current sha of a file in the repo, if it exists (GitHub requires
// the existing sha when updating a file that's already there; omit it when
// creating a brand-new file).
async function getExistingSha(path: string, headers: Record<string, string>): Promise<string | undefined> {
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
    { headers }
  );
  if (!res.ok) return undefined;
  const json: { sha?: string } = await res.json();
  return json.sha;
}

async function commitFile(
  path: string,
  base64Content: string,
  message: string,
  headers: Record<string, string>
): Promise<{ ok: boolean; detail?: string }> {
  const sha = await getExistingSha(path, headers);

  const res = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
    method: "PUT",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, detail: text };
  }
  return { ok: true };
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const githubToken = Netlify.env.get("GITHUB_TOKEN");
  const adminPassword = Netlify.env.get("ADMIN_PASSWORD");

  if (!githubToken || !adminPassword) {
    return jsonResponse(500, { error: "Server is missing required configuration." });
  }

  let payload: {
    password?: string;
    content?: unknown;
    images?: Record<string, string>;
  };

  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body." });
  }

  if (!payload.password || payload.password !== adminPassword) {
    return jsonResponse(401, { error: "Incorrect password." });
  }

  if (!payload.content || typeof payload.content !== "object") {
    return jsonResponse(400, { error: "Missing content payload." });
  }

  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
  };

  // 1. Build the new content/site-content.js file and base64-encode it —
  //    GitHub's Contents API requires base64 for the file body.
  const contentJson = JSON.stringify(payload.content, null, 2);
  const contentFileText =
    "/**\n * SHEEP GEM \u2014 SITE CONTENT (published via admin.html)\n */\n\nwindow.SITE_CONTENT = " +
    contentJson +
    ";\n";
  const contentBase64 = Buffer.from(contentFileText, "utf-8").toString("base64");

  const commitResult = await commitFile(
    "content/site-content.js",
    contentBase64,
    "Publish content update via admin.html",
    headers
  );

  if (!commitResult.ok) {
    return jsonResponse(502, { error: "Could not commit content update.", detail: commitResult.detail });
  }

  // 1b. Also render a real, fully-populated index.html (not an empty shell
  //     that JavaScript fills in later) so browsers, Google, and any tool
  //     that reads raw HTML see the actual content immediately — important
  //     for SEO now that this site is meant to grow into a content hub.
  let renderedHtml: string;
  try {
    renderedHtml = renderIndexHTML(payload.content as any);
  } catch (err) {
    return jsonResponse(502, {
      error: "Content published, but the page could not be rendered.",
      detail: String(err),
    });
  }
  const htmlBase64 = Buffer.from(renderedHtml, "utf-8").toString("base64");

  const htmlCommitResult = await commitFile(
    "index.html",
    htmlBase64,
    "Publish rendered index.html via admin.html",
    headers
  );

  if (!htmlCommitResult.ok) {
    return jsonResponse(502, {
      error: "Content published, but rendered page failed to commit.",
      detail: htmlCommitResult.detail,
    });
  }

  // 2. Commit any updated images the same way.
  if (payload.images) {
    for (const [path, dataUrl] of Object.entries(payload.images)) {
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      const imgResult = await commitFile(path, base64, `Update image: ${path}`, headers);
      if (!imgResult.ok) {
        return jsonResponse(502, {
          error: `Content published, but image failed to upload: ${path}`,
          detail: imgResult.detail,
        });
      }
    }
  }

  // Netlify's git integration will notice this push and build/deploy
  // automatically — that part happens outside this function, usually
  // within a minute.
  return jsonResponse(200, {
    ok: true,
    url: "https://websitesheepgem.netlify.app",
    note: "Pushed to GitHub — Netlify will build and deploy automatically, usually within about a minute.",
  });
};

export const config: Config = {
  path: "/api/publish",
};
