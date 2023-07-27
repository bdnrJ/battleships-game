import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

async function createDatabaseConnection(): Promise<PoolConnection> {
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
        throw new Error('Please provide all database connection details in the .env file');
    }

    // Connect to MySQL Database using a pool
    const pool: Pool = mysql.createPool({
        connectionLimit: 10, // Set your desired connection limit
        host: DB_HOST,
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        port: parseInt(DB_PORT),
    });

    const connection = await pool.getConnection(); // Get a connection from the pool
    return connection;
}

export default createDatabaseConnection;