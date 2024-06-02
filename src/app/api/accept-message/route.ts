import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Not authenticated"
            },
            { status: 401 }
        )
    }

    const userId = user._id
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, 
            {
                isAcceptingMsg: acceptMessages
            },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to update user status to accept messages"
                },
                { status: 401 }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Message acceptance status updated successfully",
                updatedUser
            },
            { status: 201 }
        )

    } catch (error) {
        console.log("Failed to update user status to accept messages");
        
        return Response.json(
            {
                success: false,
                message: "Failed to update user status to accept messages"
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
        return Response.json(
            {
                success: false,
                message: "Not authenticated"
            },
            { status: 401 }
        )
    }

    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId);
    
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            )
        }
    
        return Response.json(
            {
                success: true,
                isAcceptingMsg: foundUser.isAcceptingMsg
            },
            { status: 202 }
        )
    } catch (error) {
        console.log("Error in geeting mesage aceptance");
        
        return Response.json(
            {
                success: false,
                message: "Error in getting message acceptance status"
            },
            { status: 500 }
        )
    }

}
