// src/app.ts
import express from 'express';
import createDatabaseConnection from './config/database.js';
import { loggerMiddleware } from './utils/logger.js';
import { createUser, getUserById, deleteUser } from './controllers/userController.js';

const app = express();
const PORT = 3000;

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
        router.get('/users/:id', getUserById);
        router.delete('/users/:id', deleteUser);

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
