import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/user.model';
import bcrypt  from 'bcryptjs';
import { NextAuthOptions } from "next-auth";
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
                if (!credentials) {
                    return null
                }
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [ 
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })

                    if (!user) {
                        throw new Error("No user found with this email or username")
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account first")
                    }

                    const isPassCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (isPassCorrect) {
                        return user
                    }else {
                        throw new Error("Incorrect password")
                    }

                } catch (error: any) {
                    throw new Error("Error in authentication", error)
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMsg = user.isAcceptingMsg;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token.id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMsg = token.isAcceptingMsg;
                session.user.username = token.username;
            }
            return session;
        }
    },
    pages: {
        signIn: '/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt"
    }
}

