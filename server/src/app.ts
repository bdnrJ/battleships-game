import express from "express";
import createDatabaseConnection from "./config/database.js";
import { loggerMiddleware } from "./utils/logger.js";
import { createUser, getUserById, deleteUser } from "./controllers/userController.js";
import { isLoggedIn, login, logout } from "./controllers/authController.js";
import cors from "cors";
import authMiddleware from "./middleware/auth.js";
import corsOptions from "./config/cors.js";
import setupSocketIO from "./middleware/socketIo.js";
import { getUserGamesAndStatsById, getUserGamesById } from "./controllers/gameController.js";
import { getTop100Ranking } from "./controllers/rankingController.js";

const app = express();
const PORT = 3000;

app.use(cors(corsOptions));
app.use(express.json());
app.use(loggerMiddleware);

async function main() {
	try {
		// Connect to MySQL Database
		const connection = await createDatabaseConnection();

		// Routes
		const router = express.Router();

		// user rouets
		router.get("/users/:id", authMiddleware, getUserById);
		router.delete("/users/:id", authMiddleware, deleteUser);
        
        //game routes
		router.get("/getUserGames/:id", getUserGamesById);
		router.get("/getUserGamesAndStats/:id", getUserGamesAndStatsById);
        
        //auth routes
		router.post("/signup", createUser);
		router.post("/signin", login);
		router.post('/logout', logout);
		router.get("/isUser", authMiddleware, isLoggedIn);

        //ranking routes
		router.get("/ranking", getTop100Ranking);

        //tests
		router.get("/test", (req, res) => {
			res.status(201).json({ message: "it works!" });
		});

		// Use the router for all routes starting with '/api'
		app.use("/api", router);

		const httpServer = setupSocketIO(app);

		// httpServer.listen(PORT, '192.168.0.104', () => {
		//     console.log(`Server is running on 192.168.0.104:${PORT}`);
		// });
		httpServer.listen(PORT, () => {
			console.log(`Server is running on someip:${PORT}`);
		});
	} catch (err) {
		console.error("Error starting the server:", err);
		process.exit(1);
	}
}

main();
