import nextAuth from "next-auth";
import { authOptions } from "./option";
import NextAuth from "next-auth/next";


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }