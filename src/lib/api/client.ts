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

// fetch() tu no throw TRUOC KHI co response nao (DNS/mat mang/server chua
// san sang nhan ket noi) - khac ApiError (server CO tra loi, chi la loi
// 4xx/5xx). Quan trong voi backend Render free tier: service tu ngu sau
// ~15 phut khong co request, lan goi dau tien sau do can 30-60s de "thuc
// day" - trong luc do request co the bi timeout/reset, roi vao nhanh nay.
export class ApiNetworkError extends Error {}

// Trich thong diep loi THAT tu backend (NestJS tra {statusCode, message,
// error} - message co the la string hoac string[] neu loi validate
// class-validator co nhieu field) thay vi luon hien 1 cau chung chung
// "thất bại, thử lại sau" - nguoi dung can biet DUNG ly do (het dung
// luong/sai dinh dang/server chua cau hinh...) de tu sua, khong phai doan.
// Dung o MOI noi bat loi tu apiFetch (upload/luu ho so/dang bai...) thay vi
// moi cho tu viet 1 kieu bat loi rieng.
//
// 3 nhanh, ung voi 3 kieu that bai THAT SU khac nhau (truoc day ca 3 deu
// gop chung ve 1 cau chung chung, khong phan biet duoc):
// 1. Backend CO tra JSON {message} ro rang -> hien dung nguyen (nhu cu).
// 2. Backend CO tra loi (co status) nhung KHONG phai JSON co message (vd
//    trang loi HTML tu Render/proxy luc gateway timeout, hoac 503 truoc khi
//    app kip khoi dong) -> suy ra tu status thay vi im lang fallback.
// 3. fetch() khong nhan duoc response nao ca (ApiNetworkError) -> rat co the
//    la backend Render dang "ngu"/khoi dong lai, khong phai loi code.
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string | string[] } | null;
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(", ") : body.message;
    }
    if (err.status === 503) {
      return "Máy chủ đang khởi động lại (server free tier tự ngủ khi không có ai dùng), đợi khoảng 30-60 giây rồi thử lại.";
    }
    if (err.status === 502 || err.status === 504) {
      return `Máy chủ phản hồi quá chậm hoặc bị gián đoạn (lỗi ${err.status}), thử lại sau.`;
    }
    return `${fallback} (máy chủ trả về lỗi ${err.status}, không kèm chi tiết.)`;
  }
  if (err instanceof ApiNetworkError) {
    return "Không kết nối được tới máy chủ. Kiểm tra mạng, hoặc đợi ít giây (server có thể đang khởi động lại) rồi thử lại.";
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

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store", // dashboard ca nhan, luon can du lieu moi nhat
    });
  } catch (err) {
    // fetch() nem loi TRUOC KHI co response (khong phai server tra 4xx/5xx)
    // - DNS/mat mang/server chua san sang nhan ket noi (xem ApiNetworkError).
    throw new ApiNetworkError(err instanceof Error ? err.message : "network error");
  }

  if (!res.ok) {
    throw new ApiError(res.status, await res.json().catch(() => null));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
