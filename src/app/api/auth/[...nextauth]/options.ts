import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { GithubProfile } from "next-auth/providers/github";

export const options: NextAuthOptions = {
  providers: [
    GitHubProvider({
      profile(profile: GithubProfile) {
        console.log(profile);
        return {
          ...profile,
          role: profile.role ?? "user",
          id: profile.id.toString(),
          image: profile.avatar_url,
        };
      },
      clientId: process.env.AUTH_GITHUB_CLIENT_ID as string,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Nome de Utilizador",
          type: "text",
          placeholder: "nome de utilizador",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "palavra-passe-",
        },
      },
      async authorize(credentials, req) {
        //this is where u retrieve the user credentials from DB
        const userAdmin = {
          id: "4528",
          role: "admin",
          username: "JPMadmin",
          email: "jpm.admin@jpm.pt",
          password: "JPM_4528",
        };

        const userUser = {
          id: "103976",
          role: "user",
          username: "User",
          email: "jpm.user@jpm.pt",
          password: "JPM_4528",
        };

        if (
          credentials?.username === userUser.username &&
          credentials?.password === userUser.password
        ) {
          return userUser;
        }

        if (
          credentials?.username === userAdmin.username &&
          credentials?.password === userAdmin.password
        ) {
          return userAdmin;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        return token;
      }
    },
  },
};
