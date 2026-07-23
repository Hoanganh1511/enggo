import { auth } from "@/auth";
import AccountMenu from "./account-menu";

// Server Component rieng, tach khoi (main)/layout.tsx - de layout (Sidebar +
// TopHeaderBar) khong con phai "await auth()" o chinh no. Truoc day
// await nay o thang layout khien CA SEGMENT (main) bi coi la dynamic, moi
// lan chuyen trang Next phai render lai layout tren server -> sidebar/header
// nhap nhay. Boc component nay trong Suspense (xem top-header-bar.tsx) de
// chi phan avatar cho suspend rieng, phan con lai cua layout van tinh/on dinh.
const CurrentUser = async () => {
  const session = await auth();
  return <AccountMenu user={session?.user} />;
};

export default CurrentUser;
