import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApiError } from "./client";
import { getProfileByUsername, type UserProfileApiShape } from "./users";

// GET /users/:username nam sau JwtAuthGuard TOAN CUC (khong @Public()) - goi
// khi chua dang nhap/session het han se tra ve 401, KHONG PHAI "user khong
// ton tai". Cac trang truoc day dung `.catch(() => null)` roi `notFound()`
// da nuot mat 401 nay, khien nguoi dung thay 404 nham lan dung ra la chua
// dang nhap. Helper nay redirect thang ve /login cho truong hop 401 (kiem
// session truoc de khoi phai goi API khi chac chan chua dang nhap), chi tra
// ve null cho loi that su khac (404 tu backend, mat mang...) de caller tu
// quyet dinh (thuong la notFound()).
export async function getProfileOrRedirect(
  username: string,
): Promise<UserProfileApiShape | null> {
  const session = await auth();
  if (!session?.userId) redirect("/login");

  try {
    return await getProfileByUsername(username);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/login");
    return null;
  }
}
