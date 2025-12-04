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
// Generic role-checking middleware factory. Usage: requireRole('vendor')
// Admin users will bypass role checks and have access to everything.
export const requireRole = (role) => (req, res, next) => {
  const wanted = String(role || "").toLowerCase();
  const userRole = String(req.user?.role || "").toLowerCase();

  // allow admin to bypass specific role checks
  if (userRole === "admin" || userRole === wanted) {
    return next();
  }

  return res.status(403).json(errorResponse("Insufficient permissions"));
};

// Backwards-compatible helper for vendor-only routes
export const requireVendor = requireRole("vendor");
