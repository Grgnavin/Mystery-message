import { Message } from "@/models/user.model";

export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMsg?: boolean;
    messages?: Array<Message>;
}