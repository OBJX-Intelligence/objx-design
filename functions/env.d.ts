/// <reference types="@cloudflare/workers-types" />

interface Env {
  BUCKET: R2Bucket;
  ADMIN_TOKEN: string;
}
