// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import dotenv from "dotenv";

// hack to fix ts errors
declare global {
    namespace Express {
        export interface Request {
            user?: any;
        }
    }
}

dotenv.config();

// Interface for the decoded token data
interface DecodedToken extends JwtPayload {
  user_id: number; // Adjust this based on your token payload structure
}

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check if the request contains an authorization header with a valid JWT token or from the cookie
  const token = req.headers.authorization?.split(" ")[1] || req.headers.cookie?.split("=")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized: Missing token" });
    return;
  }

  try {
    // Verify the token with your secret key (should match the key used during token creation)
    const decodedToken = jwt.verify(
      token,
      `${process.env.TOKEN_KEY}` as Secret
    ) as DecodedToken;
    req.user = decodedToken; // Store the decoded token in the request object for use in other routes
    next(); // Move on to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return
  }
}

export default authMiddleware;
