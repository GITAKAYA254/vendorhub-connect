import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/authService.js";
import { successResponse } from "../utils/response.js";

// Cookie options used for auth token cookie. `httpOnly` prevents JavaScript
// access, `sameSite: 'lax'` reduces CSRF risk while allowing top-level
// navigation, and `secure` is enabled in production.
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Register a new user: create user record, sign a token and set it as cookie
export const register = async (req, res, next) => {
  try {
    // Accept either explicit `role` or boolean `isVendor` from client
    const role = req.body.role || (req.body.isVendor ? "vendor" : "customer");
    const { user, token } = await registerUser({ ...req.body, role });
    // Set HTTP-only cookie and return created user + token
    res
      .cookie("token", token, COOKIE_OPTIONS)
      .status(201)
      .json(successResponse({ user, token }));
  } catch (err) {
    next(err);
  }
};

// Login existing user: verify credentials, set cookie and return user
export const login = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    res
      .cookie("token", token, COOKIE_OPTIONS)
      .json(successResponse({ user, token }));
  } catch (err) {
    next(err);
  }
};

// Logout: clear the auth cookie
export const logout = async (req, res) => {
  res
    .clearCookie("token", COOKIE_OPTIONS)
    .json(successResponse({ message: "Logged out" }));
};

// Return details about currently authenticated user
export const currentUser = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);
    res.json(successResponse({ user }));
  } catch (err) {
    next(err);
  }
};
