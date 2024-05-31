import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import {z} from "zod";
import { usernameValidation } from "@/schemas/signupSchema"

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get('username')
        }
        //validate with zod
        const res = UsernameQuerySchema.safeParse(queryParam);
    } catch (error) {
        console.error("Error checking username: ", error)
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status: 500 }
        )
    }
}