import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

export default async function proxy(req : NextRequest){
    const token = await getToken({
        req,
        secret : process.env.NEXTAUTH_SECRET
    });
    const url = req.nextUrl.clone();

    // if(!token && url.pathname.startsWith("/api")){
    //     return NextResponse.redirect(new URL("/sign-in", req.url));
    // }

    if(token && (url.pathname === "/sign-in" || url.pathname === "/sign-up")){
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    if(!token && url.pathname === "/dashboard"){
        url.pathname = "/sign-in";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher : [
        "/api/:path*",
        "/dashboard/:path*",
        "/sign-in/:path*",
        "/sign-up/:path*"
    ]
}