import { rateLimit } from "./rateLimit";
import { getRateLimitKey } from "./rateLimitKey";


interface RateLimitOptions {
    action : string;
    req : Request;
    contentId?: string;
    userLimit?: number;
    ipLimit?:number;
    contentLimit?:number;
    window?: number;
}

export async function protectRoute(options: RateLimitOptions) {

    const { action, req, contentId, userLimit = 30, ipLimit = 60, contentLimit = 20, window = 60 } = options;

    const {userId, ip} = await getRateLimitKey(req);

    const ipKey = `aitute:${action}:ip:${ip}`;
    
    const ipResult = await rateLimit(ipKey, {
        limit: ipLimit,
        window: window,
    });

    if (!ipResult.success) {
        return Response.json({
            success: false,
            message: "Too many requests from this IP address",
        },{
            status : 429
        });
    }

    if(userId){
        const userKey = `aitute:${action}:user:${userId}`;

        const userResult = await rateLimit(userKey, {
            limit: userLimit,
            window: window,
        });

        if (!userResult.success) {
            return Response.json({
                success: false,
                message: "Too many requests from this user",
            },{
                status : 429
            });
        }
    }

    if(contentId){
        const contentKey = `aitute:${action}:content:${contentId}`;

        const contentResult = await rateLimit(contentKey, {
            limit: contentLimit,
            window: window,
        });

        if (!contentResult.success) {
            return Response.json({
                success: false,
                message: "Too many requests from this content",
            },{
                status : 429
            });
        }
    }

    return null;
}