import { Request, Response, NextFunction } from "express";
import { decode } from "next-auth/jwt";
import { prisma } from "../lib/prisma";

export interface AuthenticatedUser {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[AuthMiddleware] NEXTAUTH_SECRET is not configured.");
      return res.status(500).json({ error: "Server authentication misconfigured" });
    }

    let decoded: any = null;
    try {
      decoded = await decode({ token, secret });
    } catch (decodeErr) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // The userId might be directly stored on token.userId or mapped from sub/githubId
    let internalUserId = (decoded.userId as string) || (decoded.id as string);

    if (!internalUserId && decoded.sub) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: decoded.sub },
            { githubId: decoded.sub },
          ],
        },
        select: { id: true },
      });
      if (user) {
        internalUserId = user.id;
      }
    }

    if (!internalUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = { id: internalUserId };
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Error validating token:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
