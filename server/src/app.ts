import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { loggerMiddleware } from './utils/logger.js';

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = 3000;

app.use(loggerMiddleware);

async function main() {
    const {
        DB_CONNECTION,
        DB_HOST,
        DB_PORT,
        DB_DATABASE,
        DB_USERNAME,
        DB_PASSWORD,
    } = process.env;

    if (
        !DB_CONNECTION ||
        !DB_HOST ||
        !DB_PORT ||
        !DB_DATABASE ||
        !DB_USERNAME ||
        !DB_PASSWORD
    ) {
        console.error('Please provide all database connection details in the .env file');
        process.exit(1);
    }

    // Connect to MySQL Database
    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        port: parseInt(DB_PORT),
    });

    // Routes
    app.get('/', async (req: Request, res: Response) => {
        try {
            const [rows] = await connection.query('SELECT * FROM your_table');
            res.json(rows);
        } catch (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

main().catch((err) => console.error('Error starting the server:', err));
