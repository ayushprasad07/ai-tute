import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";


export async function POST(req : Request){
    await dbConnect();

    try {
        const {username, verificationCode} = await req.json();

        if(!username || !verificationCode){
            return Response.json({
                success : false,
                message : "All fields are required"
            },{
                status : 400
            })
        }

        const user = await User.findOne({
            username,
            verificationCode
        });

        if(!user){
            return Response.json({
                success : false,
                message : "Invalid verification code"
            },{
                status : 400
            })
        }

        const isValidCode = user.verificationCode === verificationCode;
        const isCodeNotExpired = new Date(user.verificationCodeExpiry) > new Date();

        if(isValidCode && isCodeNotExpired){
            await User.findOneAndUpdate({
                username
            },{
                isVerified : true
            })
            return Response.json({
                success : true,
                message : "Account verified successfully"
            })
        }else if(!isValidCode){
            return Response.json({
                success : false,
                message : "Invalid verification code"
            },{
                status : 400
            })
        }else if(!isCodeNotExpired){
            return Response.json({
                success : false,
                message : "Verification code has expired"
            },{
                status : 400
            })
        }

    } catch (error) {
        console.log("Internal server error : ",error);
        return Response.json({
            success : false,
            message : "Internal server error"
        },{
            status : 500
        })
    }
}