import { v2 as cloudinary } from "cloudinary";

function ensureCloudinaryConfig() {
  const strip = (value) => String(value || '').trim().replace(/^['"]|['"]$/g, '');
  cloudinary.config({
    cloud_name: strip(process.env.CLOUDARY_CLOUD_NAME),
    api_key: strip(process.env.CLOUDARY_KEY),
    api_secret: strip(process.env.CLOUDARY_SECRET),
    secure: true,
  });
}

/**
 * Extract Cloudinary public_id from a delivery URL.
 * Supports optional transformations and version segments.
 * Example:
 * https://res.cloudinary.com/xxx/image/upload/v123/nightcollege/file.png
 * -> nightcollege/file
 */
export function getCloudinaryPublicId(url) {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) {
    return null;
  }

  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let path = url.slice(uploadIndex + "/upload/".length);
    path = path.split("?")[0].split("#")[0];
    path = decodeURIComponent(path);

    // Remove transformation segments and optional version (v123456/)
    // e.g. w_200,c_fill/v123/folder/file.png -> folder/file.png
    path = path.replace(/^(?:[^/]+\/)*?v\d+\//, "");
    // Fallback if there was no version segment but transforms exist
    if (path.includes(",") || /(?:^|\/)[a-z]+_[^/]+/.test(path.split("/")[0] || "")) {
      const parts = path.split("/");
      while (
        parts.length > 1 &&
        (parts[0].includes(",") || /[a-z]+_/.test(parts[0]))
      ) {
        parts.shift();
      }
      path = parts.join("/");
    }

    // Drop file extension
    path = path.replace(/\.[a-zA-Z0-9]+$/, "");

    return path || null;
  } catch {
    return null;
  }
}

function detectResourceType(url) {
  if (!url) return "image";
  if (url.includes("/video/upload/") || /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url)) {
    return "video";
  }
  if (url.includes("/raw/upload/")) return "raw";
  return "image";
}

/**
 * Delete a Cloudinary asset by its delivery URL.
 * Tries the detected resource type first, then falls back to image/video.
 */
export async function deleteCloudinaryImage(url) {
  ensureCloudinaryConfig();

  const publicId = getCloudinaryPublicId(url);
  if (!publicId) {
    console.warn("Cloudinary delete skipped: could not parse public_id from", url);
    return { deleted: false, reason: "invalid_public_id", url };
  }

  if (!process.env.CLOUDARY_CLOUD_NAME || !process.env.CLOUDARY_KEY || !process.env.CLOUDARY_SECRET) {
    console.error("Cloudinary delete failed: missing CLOUDARY_* env vars");
    return { deleted: false, reason: "missing_env", publicId };
  }

  const preferred = detectResourceType(url);
  const resourceTypes = [...new Set([preferred, "image", "video", "raw"])];

  for (const resource_type of resourceTypes) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type,
        invalidate: true,
        type: "upload",
      });

      console.log("Cloudinary destroy attempt", {
        publicId,
        resource_type,
        result: result?.result,
      });

      if (result?.result === "ok") {
        return { deleted: true, publicId, resource_type, result };
      }

      // Keep trying other resource types when not found
      if (result?.result === "not found") {
        continue;
      }
    } catch (error) {
      console.error("Cloudinary destroy error", {
        publicId,
        resource_type,
        error: error?.message || error,
      });
    }
  }

  console.warn("Cloudinary delete could not remove asset", { publicId, url });
  return { deleted: false, reason: "not_found_or_failed", publicId, url };
}
