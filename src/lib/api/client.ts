import { auth } from "@/auth";
import { signInternalToken } from "./sign-internal-token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_CAREER_TREE_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error ${status}`);
  }
}

// Loi FE tu tao (khac ApiError - loi THAT tu backend) khi can hien 1 thong
// diep ro rang, DA VIET SAN cho nguoi dung (vd huong dan sua dinh dang anh
// HEIC khong doc duoc - xem use-profile-image-upload.ts) thay vi de
// getApiErrorMessage rơi ve fallback chung chung. KHONG dung cho loi he
// thong bat ngo (TypeError, network loi la...) - nhung loi do van nen hien
// fallback an toan, khong lo chi tiet ky thuat cho nguoi dung.
export class UserFacingError extends Error {}

// Trich thong diep loi THAT tu backend (NestJS tra {statusCode, message,
// error} - message co the la string hoac string[] neu loi validate
// class-validator co nhieu field) thay vi luon hien 1 cau chung chung
// "thất bại, thử lại sau" - nguoi dung can biet DUNG ly do (het dung
// luong/sai dinh dang/server chua cau hinh...) de tu sua, khong phai doan.
// Dung o MOI noi bat loi tu apiFetch (upload/luu ho so/dang bai...) thay vi
// moi cho tu viet 1 kieu bat loi rieng.
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string | string[] } | null;
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(", ") : body.message;
    }
  }
  if (err instanceof UserFacingError) return err.message;
  return fallback;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const session = await auth();
  // FormData (upload file) khong duoc ep Content-Type: application/json -
  // fetch tu sinh boundary dung khi body la FormData, ghi de vao se hong request.
  const isFormData = init?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (session?.userId) {
    headers.Authorization = `Bearer ${await signInternalToken(session.userId)}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store", // dashboard ca nhan, luon can du lieu moi nhat
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.json().catch(() => null));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
