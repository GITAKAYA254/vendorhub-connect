import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../lib/prisma.js";
import { errorResponse } from "../utils/response.js";

// Middleware to authenticate requests. It supports tokens sent either in the
// `Authorization: Bearer <token>` header or as an HTTP-only cookie `token`.
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const tokenFromHeader = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    // Prefer header token, fallback to cookie token
    const token = tokenFromHeader || req.cookies?.token;

    if (!token) {
      return res.status(401).json(errorResponse("Authentication required"));
    }

    // Verify JWT and read user id
    const decoded = verifyToken(token);

    // Fetch user from DB to ensure token maps to a real user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json(errorResponse("Invalid token"));
    }

    // Attach user and token to the request for downstream handlers
    req.user = user;
    req.token = token;
    next();
  } catch {
    return res.status(401).json(errorResponse("Invalid or expired token"));
  }
};

// Authorization helper: ensures the authenticated user is a vendor
export const requireVendor = (req, res, next) => {
  if (req.user?.role !== "vendor") {
    return res.status(403).json(errorResponse("Vendor access required"));
  }
  next();
};
