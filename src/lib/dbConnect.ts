import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI

if(!MONGO_URI){
    throw new Error('MONGODB_URI is not defined')
}

type ConnectionObject = {
    isConnected : number
}

const connection : ConnectionObject = {
    isConnected : 0
}

export default async function dbConnect(){
    if(connection.isConnected){
        console.log('DB is already connected')
        return
    }

    try {
        const db = await mongoose.connect(MONGO_URI!,{});

        connection.isConnected = db.connections[0].readyState;

        console.log('Connected to the DB');
    } catch (error) {
        // throw new Error('Error connecting to DB')
        console.log("Error connecting to the DB");
        process.exit(1);
    }
}