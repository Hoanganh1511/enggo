import { redirect } from "next/navigation";
const WORKSPACE_ID =
  process.env.WORKSPACE_ID ?? "00000000-0000-0000-0000-000000000001";
export default function Home() {
  redirect(`/w/${WORKSPACE_ID}`);
}
