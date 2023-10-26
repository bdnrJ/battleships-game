// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { log } from "console";

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
	let token =
		req.headers.authorization?.split(" ")[1] ||
		//split cookies (a litrally string of all cookies) on " " space
		//split them again because every cookie looks like that anonNickname=Anon-4591aca2;
		//find the one that has on index [0] 'token' - our jwt cookie
		//if found then throw out the ';' at the end
		req.headers.cookie
			?.split(" ")
			.map((item) => item.split("="))
			.find((item) => item[0] === "token")?.[1]
			?.replace(";", "");

	if (!token) {
		res.status(401).json({ message: "Unauthorized: Missing token" });
		return;
	}

	try {
		// Verify the token with your secret key (should match the key used during token creation)
		const decodedToken = jwt.verify(token, `${process.env.TOKEN_KEY}` as Secret) as DecodedToken;
		req.user = decodedToken; // Store the decoded token in the request object for use in other routes
		next(); // Move on to the next middleware or route handler
	} catch (err) {
		res.status(401).json({ message: "Unauthorized: Invalid token" });
		return;
	}
}

export default authMiddleware;
