import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/auth";
import prisma from "../lib/prisma";
import { authLimiter } from "../middleware/rateLimiter";
import { validatePassword } from "../middleware/validatePassword";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/authMiddleware";
import { AuthRequest } from "../types/express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { config } from "../config/env";

const router = Router();
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

// Add validation middleware
const validateRegistration = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("name").notEmpty().withMessage("Name is required"),
];

const validateRegistrationHandler: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return;
  }
  next();
};

const registerHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    res.status(201).json({
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check if user has a password (might be Google user)
    if (!user.password) {
      res.status(401).json({
        error: "Please login with Google for this account",
      });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

const getMeHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as unknown as AuthRequest).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

router.post(
  "/register",
  validateRegistration,
  validateRegistrationHandler,
  registerHandler
);
router.post("/login", authLimiter, loginHandler);
router.get("/me", authenticateToken, getMeHandler);

interface GooglePayload {
  email?: string;
  name?: string;
  sub?: string;
}

router.post("/google", async (req, res, next) => {
  try {
    const { googleUser } = req.body;

    if (!googleUser?.email) {
      res.status(400).json({ error: "Invalid Google user data" });
      return;
    }

    const { email, name, googleId } = googleUser;

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          googleId,
        },
      });
    }

    const jwtToken = generateToken(user.id);

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    next(error);
  }
});

export default router;
