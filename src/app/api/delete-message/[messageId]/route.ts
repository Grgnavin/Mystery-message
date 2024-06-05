import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";

export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    const messageId = params.messageid
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

    try {
        const updateResult = await UserModel.updateOne(
            { _id: messageId },
            { $pull: { messages: { _id: messageId} } }
        )

        if (updateResult.modifiedCount == 0) {
            return Response.json(
                {
                    success: false,
                    message: "Message not found or already deleted"
                },
                { status: 404 }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Mesage deleted"
            },
            { status: 201 }
        )

    } catch (error) {
        console.log("Error in deleting message", error);
        return Response.json(
            {
                success: false,
                message: "Error deleting message"
            },
            { status: 500 }
        )
    }


}