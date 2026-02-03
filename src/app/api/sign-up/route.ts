import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req : Request){
    await dbConnect();

    try {
        const {username,email,password} = await req.json();

        if(!username || !email || !password){
            return Response.json({
                success : false,
                message : "All fields are required"
            },{
                status : 400
            })
        }

        const existingUserByUsername = await User.findOne({
            username,
            isVerified : true
        });

        const exisitngUserByEmail = await User.findOne({
            email,
            isVerified : true
        });
        const verificationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString();

        if(existingUserByUsername){
            return Response.json({
                success : false,
                message : "Username already exists"
            },{
                status : 400
            })
        }

        if(exisitngUserByEmail){
            if(exisitngUserByEmail.isVerified){
                return Response.json({
                    success : false,
                    message : "Email already exists"
                },{
                    status : 400
                })
            }else{
                const hashedPasswrod = await bcrypt.hash(password,10);
                exisitngUserByEmail.username = username;
                exisitngUserByEmail.password = hashedPasswrod;
                exisitngUserByEmail.verificationCode = verificationCode;
                exisitngUserByEmail.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
                await exisitngUserByEmail.save();
            }
        }else{
            const hashedPasswrod = await bcrypt.hash(password,10);
            const user = new User({
                username,
                email,
                password : hashedPasswrod,
                verificationCode,
                verificationCodeExpiry : new Date(Date.now() + 10 * 60 * 1000)
            });
            await user.save();
        }

        const mailRes = await sendVerificationEmail(email,username,verificationCode);

        if(!mailRes.success){
            return Response.json({
                success : false,
                message : mailRes.message
            },{
                status : 400
            })
        }

        return Response.json({
            success : true,
            message : "Verification email sent sucessfully."
        },{
            status : 200
        })
    } catch (error) {
        console.log("Internal Server error : ",error);
        return Response.json({
            success : false,
            message : "Internal Server error"
        },{
            status : 500
        })
    }
}