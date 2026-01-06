import { getSignedUploadURL } from "actions/files/signed-url/server_action";

const FILESERVER_URL = process.env.NEXT_PUBLIC_FILESERVER_URL || "http://files";
const STATIC_URL = process.env.NEXT_PUBLIC_STATIC_URL || "http://nginx/static";
export const PUBLIC_URL = process.env.NEXT_PUBLIC_HOST || "http://localhost";

export function getNginxFile(filepath) {
  return `${STATIC_URL}/${filepath}`;
}

export function getStaticFile(
  filepath,
  filetype = "image",
  public_url = false,
) {
  if (filepath?.toLowerCase()?.endsWith("pdf")) {
    filetype = "pdf";
  } else if (filepath?.toLowerCase()?.endsWith("json")) {
    filetype = "json";
  }

  if (public_url)
    return `${PUBLIC_URL}/files/static?filename=${filepath}&filetype=${filetype}`;
  else
    return `${FILESERVER_URL}/files/static?filename=${filepath}&filetype=${filetype}`;
}

export function getFile(filepath, public_url = false, static_file = false) {
  if (filepath?.toLowerCase()?.startsWith("http")) {
    // return the full URL if global URL
    return filepath;
  } else if (filepath) {
    // call files service if local URL
    if (public_url)
      return `${PUBLIC_URL}/files/download?filename=${filepath}${
        static_file ? "&static_file=true" : ""
      }`;
    else
      return `${FILESERVER_URL}/files/download?filename=${filepath}${
        static_file ? "&static_file=true" : ""
      }`;
  }
}

export async function uploadImageFile(file, filename = null, maxSizeMB = 0.3) {
  // early return if no file
  if (!file) return "";

  // construct filename
  const ext = file.name.split(".").pop();
  filename = filename ? `${filename}.${ext}` : file.name;

  const finalFilename = await uploadFileCommon(
    file,
    "image",
    false,
    filename,
    maxSizeMB,
  );
  return finalFilename;
}

export async function uploadPDFFile(
  file,
  static_file = false,
  title = null,
  maxSizeMB = 20,
) {
  if (!file || !title) return null;

  // check file size limits
  const sizeLimit = maxSizeMB * (1024 * 1024);
  if (file.size > sizeLimit) {
    throw new Error(
      `File size exceeded ${maxSizeMB} MB, Please compress and reupload.`,
    );
  }

  let filename = null;

  if (static_file && (!title || title === ""))
    throw new Error("Title is required for static files.");
  else filename = title.toLowerCase().replace(/\s+/g, "_") + ".pdf";

  const finalFilename = await uploadFileCommon(
    file,
    "document",
    static_file,
    filename,
    maxSizeMB,
  );
  return finalFilename;
}

async function uploadFileCommon(
  file,
  filetype,
  static_file = false,
  filename = null,
  maxSizeMB = 0.3,
) {
  try {
    // get signed url
    const details = {
      staticFile: static_file,
      filename: filename,
      maxSizeMb: maxSizeMB,
    };

    const res = await getSignedUploadURL(details);
    if (!res.ok) {
      throw res.err;
    }

    const { url } = res.data;

    // upload file to signed URL
    const body = new FormData();
    body.append("file", file);

    const response = await fetch(`${url}?filetype=${filetype}`, {
      body: body,
      method: "POST",
    });

    if (response.status >= 200 && response.status < 300) {
      const finalFilename = await response.text();
      return finalFilename;
    }
    throw response.err;
  } catch (error) {
    throw error;
  }
}
