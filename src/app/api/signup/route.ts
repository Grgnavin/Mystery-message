import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    try {
    } catch (error) {
        console.error("Error signing up user", error)
        return Response.json(
            {
                success: false,
                message: "Error signing up user"
            },
            {
                status: 500
            }
        )
    }
}

