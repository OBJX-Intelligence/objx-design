/**
 * GET /api/image/{slug}/{filename} — Serve image from R2
 *
 * Catch-all route that reads from R2 and returns with proper Content-Type.
 * Includes aggressive caching headers since images are immutable.
 */

interface Env {
  BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pathSegments = context.params.path;
  if (!pathSegments || (Array.isArray(pathSegments) && pathSegments.length === 0)) {
    return new Response("Not found", { status: 404 });
  }

  // Reconstruct the key: images/{slug}/{filename}
  const pathStr = Array.isArray(pathSegments)
    ? pathSegments.map(decodeURIComponent).join("/")
    : decodeURIComponent(pathSegments);
  const key = `images/${pathStr}`;

  const object = await context.env.BUCKET.get(key);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType || "image/jpeg"
  );
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);

  return new Response(object.body, { headers });
};
