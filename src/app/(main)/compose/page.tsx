import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Composer } from "@/components/compose/Composer";

// /compose - port giao dien tu source composer-knowledge-hub-main.zip (theme
// toi rieng, tach biet toi da app - khong dung .dashboard-scope hay token
// sang cua phan con lai). Nut "Viết bài" tren TopHeaderBar.tsx dieu huong toi
// day (thay logic /home?compose=1 cu, PostComposer inline tren /home da
// khong con). Server Component chi lam gate dang nhap, toan bo tuong tac
// nam trong Composer.tsx (client).
export default async function ComposePage() {
  const session = await auth();
  if (!session?.userId) redirect("/login");

  return <Composer />;
}
