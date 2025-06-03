import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const options: NextAuthOptions = {
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
          placeholder: "palavra-passe-",
        },
      },
      async authorize(credentials, req) {
        const JPMAdmin = {
          id: "4528",
          role: "admin",
          username: "JPMadmin",
          password: "JPM_4528",
        };
 
        const gestor = {
          id: "15123",
          role: "gestor",
          username: "Gestor",
          password: "Gestor_4528",
        };
        
        const rececaoMP = {
          id: "10312",
          role: "rececaomp",
          username: "RececaoMP",
          password: "RececaoMP_4528",
        };
        
        const receitas = {
          id: "103979",
          role: "receitas",
          username: "Receitas",
          password: "Receitas_4528",
        };
        
        const formulacao = {
          id: "103976",
          role: "formulacao",
          username: "Formulacao",
          password: "Formulacao_4528",
        };
        
        const producao = {
          id: "15325",
          role: "producao",
          username: "Producao",
          password: "Producao_4528",
        };

        const expedicao = {
          id: "153221",
          role: "expedicao",
          username: "Expedicao",
          password: "Expedicao_4528",
        };

        if (
          credentials?.username === JPMAdmin.username &&
          credentials?.password === JPMAdmin.password
        ) {
          return JPMAdmin;
        }

        if (
          credentials?.username === gestor.username &&
          credentials?.password === gestor.password
        ) {
          return gestor;
        }

        if (
          credentials?.username === rececaoMP.username &&
          credentials?.password === rececaoMP.password
        ) {
          return rececaoMP;
        }

        if (
          credentials?.username === receitas.username &&
          credentials?.password === receitas.password
        ) {
          return receitas;
        }

        if (
          credentials?.username === formulacao.username &&
          credentials?.password === formulacao.password
        ) {
          return formulacao;
        }
        
        if (
          credentials?.username === producao.username &&
          credentials?.password === producao.password
        ) {
          return producao;
        }

        if (
          credentials?.username === expedicao.username &&
          credentials?.password === expedicao.password
        ) {
          return expedicao;
        }else {
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
        token.name = user.username;
      }
      return token;
    },
    async session({session,token}){
      if(token){
        session.user.id= token.id
        session.user.role= token.role
        session.user.name = token.name
      }
      return session
    }

  },
  secret: process.env.NEXTAUTH_SECRET,
  session:{strategy:'jwt'},
  pages:{
    signIn:'/login'
  }
};
