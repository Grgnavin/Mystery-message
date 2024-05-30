import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import bcrypt  from 'bcryptjs';
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import CredentialsProvider from "next-auth/providers/credentials";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "Enter your email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [ 
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })

                    if (!user) {
                        throw new Error("No user with this email or username was found")
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account first")
                    }

                    const isPassCorrect = await bcrypt.compare(credentials.password, user.password)

                    if (isPassCorrect) {
                        return user
                    }else {
                        throw new Error("Incorrect password")
                    }

                } catch (error: any) {
                    throw new Error()
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user._id?.toString();
                token.isVerified= user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session
        }
    },
    pages: {
        signIn: '/signIn',
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}

