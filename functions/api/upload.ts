/**
 * POST /api/upload — Upload image to R2
 *
 * Accepts multipart/form-data with:
 *   - file: the image file
 *   - slug: project slug (used as folder name)
 *
 * Returns: { url: "/api/image/{slug}/{filename}" }
 */

interface Env {
  BUCKET: R2Bucket;
  ADMIN_TOKEN: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Auth check
  const auth = context.request.headers.get("Authorization");
  if (!auth || auth !== `Bearer ${context.env.ADMIN_TOKEN}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get("file") as File | null;
    const slug = formData.get("slug") as string | null;

    if (!file || !slug) {
      return new Response(
        JSON.stringify({ error: "Missing file or slug" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize filename
    const filename = file.name.replace(/[^a-zA-Z0-9._\-()\s]/g, "").trim();
    const key = `images/${slug}/${filename}`;

    // Upload to R2
    await context.env.BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "image/jpeg",
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    const url = `/api/image/${slug}/${encodeURIComponent(filename)}`;
    return new Response(JSON.stringify({ url, key }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Upload failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
