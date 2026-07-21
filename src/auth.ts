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
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const backendUser = await syncUserToBackend({
          googleId: profile.sub as string,
          email: profile.email as string,
          name: profile.name as string,
        });
        token.userId = backendUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.userId = token.userId as string;
      return session;
    },
  },
});
