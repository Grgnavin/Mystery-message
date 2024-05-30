import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected");
        return
    }
    
    try {
        const db =  await mongoose.connect(process.env.DB_URL || "", {});
        console.log(db);
        connection.isConnected = db.connections[0].readyState
        console.log("DB Connected Successfully");
        
    } catch (error) {
        console.log("DB Connection failed: ", error);
        process.exit()
    }
}

export default dbConnect;