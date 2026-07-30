import type { ReactNode } from "react";

// Khung dung chung cho moi phan noi dung cua trang profile (hang avatar/ten
// trong ProfileHeader, Nav/feed/sidebar/footer trong ProfileShell) - full
// tran vien, khong padding rieng, cac phan con KHONG tu dat px-*/max-w rieng
// nua de tranh lech hang giua header va body.
const ProfileContentWrap = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={`w-full px-35 ${className}`}>{children}</div>;
};

export default ProfileContentWrap;
