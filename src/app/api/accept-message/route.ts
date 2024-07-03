import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !session.user) {
        return NextResponse.json(
            {
                success: false,
                message: "Not authenticated"
            },
            { status: 401 }
        )
    }

    const { acceptMessages } = await request.json();
    const userId = new mongoose.Schema.ObjectId(user._id || '');
    
    try {
        const user = await UserModel.findByIdAndUpdate(
            userId, 
            {
                isAcceptingMsg: acceptMessages
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: `Message acceptance status updated to ${acceptMessages}`,
                user
            },
            { status: 200 }
        )

    } catch (error) {
        console.log("Failed to update user status to accept messages", error);
        return NextResponse.json(
            {
                success: false,
                message: "Unexpected Error occurred"
            },
            { status: 500 }
        )
    }

}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return NextResponse.json(
            {
                success: false,
                message: "Not authenticated"
            },
            { status: 401 }
        )
    }

    const userId = new mongoose.Schema.ObjectId(user._id || '');
    try {
        const user = await UserModel.findById(userId);
    
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            )
        }
    
        return NextResponse.json(
            {
                success: true,
                isAcceptingMsg: user.isAcceptingMsg
            },
            { status: 200 }
        )
    } catch (error) {
        console.log("Error in getting message acceptance", error);
        
        return NextResponse.json(
            {
                success: false,
                message: "Unexpected Error occurred"
            },
            { status: 500 }
        )
    }

}
