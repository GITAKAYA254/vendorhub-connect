import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

// Helper to remove sensitive fields and normalize the user shape returned
// to clients (remove passwordHash, expose isVendor and vendorProfileId)
const formatUser = ({ passwordHash, vendorProfile, ...rest }) => ({
  ...rest,
  isVendor: rest.role === "vendor",
  vendorProfileId: vendorProfile?.id ?? null,
});

// Register a new user in the database and return the user + auth token
export const registerUser = async ({ name, email, password, role }) => {
  // Prevent duplicate emails
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
    include: { vendorProfile: true },
  });

  // Sign a JWT that includes user id and role
  const token = signToken({ userId: user.id, role: user.role });
  return { user: formatUser(user), token };
};

// Authenticate a user by email/password and return user + token
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { vendorProfile: true },
  });
  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { user: formatUser(user), token };
};

// Fetch the current user by id; throw if not found
export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { vendorProfile: true },
  });
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return formatUser(user);
};
