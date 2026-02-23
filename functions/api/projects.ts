/**
 * GET  /api/projects — Read projects.json from R2 (public)
 * PUT  /api/projects — Save projects.json to R2 (requires auth)
 */

interface Env {
  BUCKET: R2Bucket;
  ADMIN_TOKEN: string;
}

const DATA_KEY = "data/projects.json";
const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const object = await context.env.BUCKET.get(DATA_KEY);
  if (!object) {
    // No R2 data yet — return empty array (frontend will use static JSON fallback)
    return new Response("[]", { headers: CORS_HEADERS });
  }

  return new Response(object.body, { headers: CORS_HEADERS });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const auth = context.request.headers.get("Authorization");
  if (!auth || auth !== `Bearer ${context.env.ADMIN_TOKEN}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: CORS_HEADERS,
    });
  }

  try {
    const body = await context.request.text();
    // Validate it's valid JSON
    JSON.parse(body);

    await context.env.BUCKET.put(DATA_KEY, body, {
      httpMetadata: {
        contentType: "application/json",
      },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Save failed" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
