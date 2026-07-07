import type { Config } from "@netlify/functions";
import { createHash } from "node:crypto";

const SITE_ID = "5f3ef681-411f-42d2-9772-e82c05757479";
const API = "https://api.netlify.com/api/v1";

function sha1(buf: Buffer): string {
  return createHash("sha1").update(buf).digest("hex");
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const token = Netlify.env.get("NETLIFY_AUTH_TOKEN");
  const adminPassword = Netlify.env.get("ADMIN_PASSWORD");

  if (!token || !adminPassword) {
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

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 1. Find the site's currently published deploy so we can carry its
  //    function bundle(s) forward — otherwise a content-only deploy would
  //    silently drop this very function from the new deploy.
  const siteRes = await fetch(`${API}/sites/${SITE_ID}`, { headers: authHeaders });
  if (!siteRes.ok) {
    const text = await siteRes.text();
    return jsonResponse(502, { error: "Could not read site info.", detail: text });
  }
  const site: { published_deploy?: { id?: string } } = await siteRes.json();
  const currentDeployId = site.published_deploy?.id;

  let functionsMap: Record<string, string> = {};
  if (currentDeployId) {
    const currentDeployRes = await fetch(`${API}/deploys/${currentDeployId}`, {
      headers: authHeaders,
    });
    if (currentDeployRes.ok) {
      const currentDeploy: { available_functions?: Array<{ n: string; d: string }> } =
        await currentDeployRes.json();
      for (const fn of currentDeploy.available_functions || []) {
        if (fn.n && fn.d) functionsMap[fn.n] = fn.d;
      }
    }
  }

  // 2. Get the list of files currently live on the site, so unchanged files
  //    are left alone and only what actually changed gets re-uploaded.
  const filesRes = await fetch(`${API}/sites/${SITE_ID}/files`, {
    headers: authHeaders,
  });

  if (!filesRes.ok) {
    const text = await filesRes.text();
    return jsonResponse(502, { error: "Could not read current site files.", detail: text });
  }

  const currentFiles: Array<{ path: string; sha?: string }> = await filesRes.json();

  const filesMap: Record<string, string> = {};
  for (const f of currentFiles) {
    if (f.path && f.sha) filesMap[f.path] = f.sha;
  }

  // 2. Build the new content/site-content.js file and compute its hash.
  const contentJson = JSON.stringify(payload.content, null, 2);
  const contentFileText =
    "/**\n * SHEEP GEM \u2014 SITE CONTENT (published via admin.html)\n */\n\nwindow.SITE_CONTENT = " +
    contentJson +
    ";\n";
  const contentBuffer = Buffer.from(contentFileText, "utf-8");
  const contentPath = "content/site-content.js";
  filesMap[contentPath] = sha1(contentBuffer);

  // 3. Decode any updated images and compute their hashes too.
  const imageBuffers: Record<string, Buffer> = {};
  if (payload.images) {
    for (const [path, dataUrl] of Object.entries(payload.images)) {
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      const buf = Buffer.from(base64, "base64");
      imageBuffers[path] = buf;
      filesMap[path] = sha1(buf);
    }
  }

  // 4. Create a new deploy referencing the file digest map. Netlify tells us
  //    which paths it doesn't already have bytes for (the "required" list).
  const deployRes = await fetch(`${API}/sites/${SITE_ID}/deploys`, {
    method: "POST",
    headers: { ...authHeaders, "content-type": "application/json" },
    body: JSON.stringify({
      files: filesMap,
      functions: functionsMap,
      branch: "main",
      draft: false,
    }),
  });

  if (!deployRes.ok) {
    const text = await deployRes.text();
    return jsonResponse(502, { error: "Could not create deploy.", detail: text });
  }

  const deploy: { id: string; required?: string[] } = await deployRes.json();
  const required = new Set(deploy.required || []);

  // 5. Upload the raw bytes for whatever Netlify says it needs.
  const uploads: Promise<Response>[] = [];

  if (required.has(contentPath)) {
    uploads.push(
      fetch(`${API}/deploys/${deploy.id}/files/${contentPath}`, {
        method: "PUT",
        headers: { ...authHeaders, "content-type": "application/octet-stream" },
        body: contentBuffer,
      })
    );
  }

  for (const [path, buf] of Object.entries(imageBuffers)) {
    if (required.has(path)) {
      uploads.push(
        fetch(`${API}/deploys/${deploy.id}/files/${path}`, {
          method: "PUT",
          headers: { ...authHeaders, "content-type": "application/octet-stream" },
          body: buf,
        })
      );
    }
  }

  const uploadResults = await Promise.all(uploads);
  const failed = uploadResults.filter((r) => !r.ok);
  if (failed.length) {
    return jsonResponse(502, { error: "Some files failed to upload.", count: failed.length });
  }

  // 6. Explicitly make this the site's published/live deploy. Creating a
  //    deploy doesn't always promote it automatically, so force it.
  const restoreRes = await fetch(`${API}/sites/${SITE_ID}/deploys/${deploy.id}/restore`, {
    method: "POST",
    headers: authHeaders,
  });

  if (!restoreRes.ok) {
    const text = await restoreRes.text();
    return jsonResponse(502, {
      error: "Deploy uploaded but could not be published as the live version.",
      detail: text,
    });
  }

  return jsonResponse(200, {
    ok: true,
    deployId: deploy.id,
    url: "https://websitesheepgem.netlify.app",
  });
};

export const config: Config = {
  path: "/api/publish",
};
