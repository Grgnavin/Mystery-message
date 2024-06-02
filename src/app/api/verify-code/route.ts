import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import {z} from "zod";
import { usernameValidation } from "@/schemas/signupSchema"
import { NextRequest } from "next/server";
import { Coda } from "next/font/google";

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const { username, code } = await request.json();
        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 500 }
            )
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "User is verified"
                },
                { status: 500 }
            )
        }else if(!isCodeValid){
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code"
                },
                { status: 500 }
            )
        }else {
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired, please signup again to get a new code"
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("Error verifying user: ", error)
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            },
            { status: 500 }
        )
    }

}