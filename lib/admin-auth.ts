import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const adminCookieName = "fod_admin";
const cookieMaxAge = 60 * 60 * 8;

function getAdminSecret() {
  return process.env.ADMIN_SECRET || "";
}

function sign(value: string) {
  return createHmac("sha256", getAdminSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

export async function isAdminAuthenticated() {
  const adminSecret = getAdminSecret();
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;

  if (!adminSecret || !token) {
    return false;
  }

  const [value, signature] = token.split(".");
  if (!value || !signature) {
    return false;
  }

  return value === "admin" && safeEqual(signature, sign(value));
}

export async function setAdminCookie() {
  const cookieStore = await cookies();
  const value = "admin";

  cookieStore.set(adminCookieName, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cookieMaxAge,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
}

export function isValidAdminSecret(secret: string) {
  const adminSecret = getAdminSecret();
  return Boolean(adminSecret && secret && safeEqual(secret, adminSecret));
}
