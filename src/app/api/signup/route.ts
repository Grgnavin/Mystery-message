import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();

        await dbConnect();

        const existingUserByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(existingUserByUsername){
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, { status: 400 })
        }

        const existingUserByEmail = await UserModel.findOne({email});

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) { // if the email exits 
            if (existingUserByEmail.isVerified) { // if the email exits and is verified
                return Response.json({
                    success: true,
                    message: "User already exists with this email"
                }, { status:400}) 
            }else { // if the user's email exits but the email is not verified
                const hashedPassword =await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save()
            }
        }else { //if the user's email doesn't exits make a fresh user
            const hashedPassword =await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode: verifyCode, 
                verifyCodeExpiry : expiryDate,
                isVerified: false,
                isAcceptingMsg: true,
                messages: []
            })
            await newUser.save()
        }
        //send verification email
        const emailResponse = await sendVerificationEmail( 
            email,
            username,
            verifyCode
        )

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status:500 })
        }
        return Response.json({
            success: true,
            message: "User created successfully.. Please verify your email"
        }, { status:200})

    } catch (error) {
        console.error("Error signing up user", error)
        return Response.json(
            {
                success: false,
                message:  `Error signing up user: ${error.message}`
            },
            {
                status: 500
            }
        )
    }
}

