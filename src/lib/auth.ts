// lib/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

interface User {
  id: string;
  username: string;
  role: string;
  email: string;
  fullName: string;
  active: boolean;
}

// API client for user authentication
const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch(`${process.env.SCADA_BASE_URL || 'http://DESKTOP-74D6VT2:8080'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      console.log('SCADA authentication failed, status:', response.status);
      return null;
    }

    const user = await response.json();
    return {
      id: user.idUser.toString(),
      username: user.username,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      active: user.active,
    };
  } catch (error) {
    console.error('Database authentication error:', error);
    return null;
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
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
          placeholder: "palavra-passe",
        },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          console.log('Attempting authentication for:', credentials.username);
          
          // First try database authentication
          const user = await authenticateUser(credentials.username, credentials.password);

          if (user && user.active) {
            console.log('Database authentication successful for:', user.username);
            return {
              id: user.id,
              name: user.fullName || user.username,
              email: user.email,
              role: user.role,
              username: user.username,
            };
          }

          // Fallback to hardcoded users (for transition period)
          console.log('Database authentication failed, trying hardcoded users...');
          
          const hardcodedUsers = [
            {
              id: "4528",
              role: "admin",
              username: "JPMadmin",
              password: "JPM_4528",
              fullName: "Administrador JPM"
            },
            {
              id: "15123",
              role: "gestor",
              username: "Gestor",
              password: "Gestor_4528",
              fullName: "Gestor de Produção"
            },
            {
              id: "10312",
              role: "rececaomp",
              username: "RececaoMP",
              password: "RececaoMP_4528",
              fullName: "Receção de Matéria-Prima"
            },
            {
              id: "103979",
              role: "receitas",
              username: "Receitas",
              password: "Receitas_4528",
              fullName: "Gestão de Receitas"
            },
            {
              id: "103976",
              role: "formulacao",
              username: "Formulacao",
              password: "Formulacao_4528",
              fullName: "Formulação"
            },
            {
              id: "15325",
              role: "producao",
              username: "Producao",
              password: "Producao_4528",
              fullName: "Produção"
            },
            {
              id: "153221",
              role: "expedicao",
              username: "Expedicao",
              password: "Expedicao_4528",
              fullName: "Expedição"
            }
          ];

          const hardcodedUser = hardcodedUsers.find(
            u => u.username === credentials.username && u.password === credentials.password
          );

          if (hardcodedUser) {
            console.log(`Fallback authentication successful for ${hardcodedUser.username}`);
            return {
              id: hardcodedUser.id,
              name: hardcodedUser.fullName,
              email: `${hardcodedUser.username.toLowerCase()}@egiquimica.pt`,
              role: hardcodedUser.role,
              username: hardcodedUser.username,
            };
          }

          console.log('Authentication failed for:', credentials.username);
          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === 'development',
};