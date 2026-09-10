import { create } from "zustand";

type CurrentAvatarState = {
  overrideUrl: string | null;
  setAvatarUrl: (url: string) => void;
};

// Header (AccountMenu, nam trong nhanh TopHeaderBar) va Profile/Settings
// (nhanh KHAC trong cay component, khong phai cha-con) can cung hien avatar
// MOI NHAT ngay sau khi nguoi dung doi anh - khong truyen qua props duoc nen
// can 1 store dung chung (cung mo hinh voi dashboard-sidebar-drawer-store.ts).
//
// Truoc day dua hoan toan vao next-auth `useSession().update()` de dong bo
// qua JWT, nhung co che do co 1 network round-trip rieng (CSRF token +
// POST /api/auth/session) that bai AM THAM khong nem loi khi khong thanh
// cong (xem UpdateSession trong next-auth/react) - kho debug va khong dang
// tin cay lam nguon THAT SU duy nhat cho 1 thay doi UI can thay ngay lap
// tuc. Store nay la nguon THAT NGAY LAP TUC (khong round-trip mang), con
// session.update() van goi kem (best-effort, xem use-profile-image-upload.ts)
// chi de JWT co co hoi mang theo avatar moi sau nay (vd server component
// doc session truc tiep) - khong phai duong duy nhat quyet dinh UI nua.
export const useCurrentAvatarStore = create<CurrentAvatarState>((set) => ({
  overrideUrl: null,
  setAvatarUrl: (url) => set({ overrideUrl: url }),
}));
