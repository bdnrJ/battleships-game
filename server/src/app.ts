import express from 'express';
import createDatabaseConnection from './config/database.js';
import { loggerMiddleware } from './utils/logger.js';
import { createUser, getUserById, deleteUser } from './controllers/userController.js';
import { login } from './controllers/authController.js';
import cors from 'cors'
import authMiddleware from './middleware/auth.js';
import corsOptions from './config/cors.js';
import setupSocketIO from './middleware/socketIo.js';

const app = express();
const PORT = 3000;

app.use(cors(corsOptions));
app.use(express.json());
app.use(loggerMiddleware);

async function main() {
    try {
        // Connect to MySQL Database
        // const connection = await createDatabaseConnection();

        // Routes
        const router = express.Router();

        // Define routes and link them to the controller functions
        router.get('/users/:id', authMiddleware, getUserById);
        router.delete('/users/:id', deleteUser);
        
        router.post('/signup', createUser);
        router.post('/signin', login);
        router.get('/test', (req, res) => {
            res.status(201).json({message: 'it works!' });
        });

        // Use the router for all routes starting with '/api'
        app.use('/api', router);

        const httpServer = setupSocketIO(app);

        // Start the server
        // httpServer.listen(PORT, '192.168.0.101', () => {
        //     console.log(`Server is running on http://192.168.0.101:${PORT}`);
        // });
        httpServer.listen(PORT, () => {
            console.log(`Server is running on someip:${PORT}`);
        });
    } catch (err) {
        console.error('Error starting the server:', err);
        process.exit(1);
    }
}

main();
