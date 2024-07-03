import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    console.log(user);
    
    if (!session || !user) {
        return NextResponse.json(
            {
                success: false,
                message: "Not authenticated"
            },
            { status: 401 }
        )
    }

    const userId = new mongoose.Types.ObjectId(user._id as string);
    console.log("User Id :: ", userId);
    try {
        const userMessage = await UserModel.aggregate([
            { $match: { _id: userId } },
            {
                $unwind: '$messages' // unwind is applied in the array of obj to split {} {} like this
            },
            // { $sort: {'messages.createdAt': -1} },
            // { $group: {_id: '$id', messages: { $push: '$messages'}} }
        ]).exec();
        console.log("UserMessage ::", userMessage);
        
        if (!userMessage || userMessage.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `No messages found for the ${session.user?.username}`
                },
                { status: 401 }
            )
        }

        return Response.json(
            {
                success: true,
                messages: userMessage[0].messages
            },
            { status: 200 }
        )

    } catch (error) {   
        console.log("Unexpected error occured ", error);        
        return Response.json(
            {
                success: false,
                messages: "Unexpected error occured"
            },
            { status: 500 }
        )
    }

}