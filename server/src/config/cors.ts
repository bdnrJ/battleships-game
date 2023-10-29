import { CorsOptions } from "cors";

export const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:5174",
	"https://battleships-game.xyz",
	"https://www.battleships-game.xyz",
	"http://battleships-front.s3-website.eu-north-1.amazonaws.com",
]; // Replace with your actual frontend URL(s)

const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	// origin: '*',
	credentials: true, // Allow credentials (e.g., cookies) to be sent
};

export default corsOptions;
