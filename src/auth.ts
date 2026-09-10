import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { syncUserToBackend } from "@/lib/api/sync-user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile, trigger, session }) {
      if (account && profile) {
        const backendUser = await syncUserToBackend({
          googleId: profile.sub as string,
          email: profile.email as string,
          name: profile.name as string,
          avatarUrl: profile.picture as string | undefined,
        });
        token.userId = backendUser.id;
        token.username = backendUser.username;
      }
      // Header (AccountMenu) doc avatar tu token.picture - anh nay chi duoc
      // dien 1 lan luc dang nhap (tu Google), khong tu dong theo kip khi
      // nguoi dung doi avatar that qua S3 (ProfileSidebar/SettingsSections).
      // 2 noi do goi useSession().update({ image }) sau khi luu avatar
      // thanh cong -> kich hoat nhanh nay (trigger "update") de dong bo lai
      // token, tranh phai dang xuat/dang nhap lai moi thay avatar moi.
      if (trigger === "update" && session?.image) {
        token.picture = session.image as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.userId = token.userId as string;
      session.username = token.username as string;
      return session;
    },
  },
});
