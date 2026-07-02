export const ADMIN_COOKIE = "admin_session";

const enc = new TextEncoder();

// Web Crypto HMAC signature generator (node + edge safe)
async function hmac(msg: string, secret: string): Promise<string> {
  const keyBuffer = enc.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(msg));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate signed token valid for 7 days
export async function createSessionToken(uid: number): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured in environmental variables.");
  }
  const exp = String(Date.now() + 7 * 864e5); // 7 days expiration
  const message = `${uid}.${exp}`;
  const sig = await hmac(message, secret);
  return `${uid}.${exp}.${sig}`;
}

// Decode and verify session token signature & expiration
export async function readSession(token?: string | null): Promise<number | null> {
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [uid, exp, sig] = parts;
  if (!uid || !exp || !sig) return null;

  const expTime = Number(exp);
  if (isNaN(expTime) || expTime < Date.now()) return null;

  const expectedSig = await hmac(`${uid}.${exp}`, secret);
  const ok = sig === expectedSig;

  const parsedUid = Number(uid);
  return ok && Number.isInteger(parsedUid) ? parsedUid : null;
}
