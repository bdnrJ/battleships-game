// src/app.ts
import express from 'express';
import createDatabaseConnection from './config/database.js';
import { loggerMiddleware } from './utils/logger.js';
import { createUser, getUserById, deleteUser } from './controllers/userController.js';
import { login } from './controllers/authController.js';
import cors from 'cors'
import authMiddleware from './middleware/auth.js';

const app = express();
const PORT = 3000;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']; // Replace with your actual frontend URL(s)

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (e.g., cookies) to be sent
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(loggerMiddleware);

async function main() {
    try {
        // Connect to MySQL Database
        const connection = await createDatabaseConnection();

        // Routes
        const router = express.Router();

        // Define routes and link them to the controller functions
        router.post('/users', createUser);
        router.get('/users/:id', authMiddleware, getUserById);
        router.delete('/users/:id', deleteUser);

        router.post('/signin', login);

        // Use the router for all routes starting with '/api'
        app.use('/api', router);

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error starting the server:', err);
        process.exit(1);
    }
}

main();
