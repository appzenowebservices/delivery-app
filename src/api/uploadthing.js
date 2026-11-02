import { UPLOADTHING_TOKEN } from '../config';

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const decodeBase64 = (input) => {
  const str = String(input).replace(/=+$/, '');
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < str.length; i += 1) {
    const value = BASE64_CHARS.indexOf(str[i]);
    if (value === -1) continue;

    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
};

const getUploadThingConfig = () => {
  try {
    const parsed = JSON.parse(decodeBase64(UPLOADTHING_TOKEN));
    return {
      apiKey: parsed?.apiKey,
      appId: parsed?.appId,
      region: parsed?.regions?.[0],
    };
  } catch (error) {
    return null;
  }
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * Uploads a local image/document picked with react-native-image-picker to
 * UploadThing. Returns the public file URL.
 */
export const uploadFile = async (asset) => {
  if (!asset?.uri) {
    throw new Error('No image selected.');
  }

  const config = getUploadThingConfig();
  if (!config?.apiKey) {
    throw new Error('Upload service is not configured.');
  }

  const name = asset.fileName || `profile-${Date.now()}.jpg`;
  const type = asset.type || 'image/jpeg';
  const size = Number(asset.fileSize) || MAX_IMAGE_BYTES;

  if (size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large. Please choose a picture under 8 MB.');
  }

  const requestRes = await fetch('https://api.uploadthing.com/v6/uploadFiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Uploadthing-Api-Key': config.apiKey,
    },
    body: JSON.stringify({
      files: [{ name, size, type }],
      acl: 'public-read',
      contentDisposition: 'inline',
    }),
  });

  if (!requestRes.ok) {
    throw new Error(`Upload service rejected the request (${requestRes.status}).`);
  }

  const meta = await requestRes.json();
  const file = meta?.data?.[0];

  if (!file?.url || !file?.fields) {
    throw new Error('Upload service did not return an upload URL.');
  }

  const form = new FormData();
  Object.entries(file.fields).forEach(([key, value]) => {
    form.append(key, value);
  });
  form.append('file', {
    uri: asset.uri,
    name,
    type,
  });

  const uploadRes = await fetch(file.url, {
    method: 'POST',
    body: form,
  });

  if (!uploadRes.ok) {
    throw new Error(`Image upload failed (${uploadRes.status}). Please try again.`);
  }

  return file.ufsUrl || file.fileUrl;
};

// Backwards-compatible alias used by the profile screen.
export const uploadProfileImage = uploadFile;
