import { listUserDocuments } from "@/lib/api/documents";
import { getProfileByUsername } from "@/lib/api/users";
import { DocumentListView } from "@/components/documents/DocumentListView";

// Tab "Tài liệu" trong profile - danh sach tai lieu cua tac gia. Nam duoi
// /u/[username]/layout.tsx (ProfileShell) nen tu co header + nav + sidebar.
export default async function ProfileDocsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const uname = decodeURIComponent(username);
  const [documents, profile] = await Promise.all([
    listUserDocuments(uname).catch(() => []),
    getProfileByUsername(uname).catch(() => null),
  ]);

  return (
    <DocumentListView
      documents={documents}
      username={uname}
      isSelf={profile?.isSelf ?? false}
    />
  );
}
