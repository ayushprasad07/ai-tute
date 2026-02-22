import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function getRateLimitKey(req: Request) {

  const session = await getServerSession(authOptions);

  const forwarded = req.headers.get("x-forwarded-for");

  const ip =
    forwarded?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  return {
    userId: session?.user?._id ?? null,
    ip,
  };
}