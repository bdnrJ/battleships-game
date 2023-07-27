import { PoolConnection, RowDataPacket, ResultSetHeader  } from 'mysql2/promise';
import createDatabaseConnection from '../config/database.js';

export interface User {
    id?: number;
    nickname: string;
    password: string;
    email: string;
    created_at: Date;
    deleted_at: Date | null;
}

class UserModel {
    static async createUser(user: User): Promise<number> {
        const connection: PoolConnection = await createDatabaseConnection();

        const insertQuery = 'INSERT INTO users (nickname, password, email) VALUES (?, ?, ?)';
        const [result] = (await connection.execute(insertQuery, [
            user.nickname,
            user.password,
            user.email,
        ])) as ResultSetHeader[]; // Use type assertion to specify the expected return type

        connection.release();

        return result.insertId;
    }

    static async getUserById(userId: number): Promise<User | null> {
        const connection: PoolConnection = await createDatabaseConnection();

        const selectQuery = 'SELECT * FROM users WHERE id = ?';
        const [rows] = (await connection.execute(selectQuery, [userId])) as RowDataPacket[]; // Use type assertion

        connection.release();

        if (rows.length === 0) return null;
        return rows[0] as User;
    }

    static async deleteUser(userId: number): Promise<boolean> {
        const connection: PoolConnection = await createDatabaseConnection();

        const updateQuery = 'UPDATE users SET deleted_at = ? WHERE id = ?';
        const [result] = (await connection.execute(updateQuery, [new Date(), userId])) as ResultSetHeader[]; // Use type assertion

        connection.release();

        return result.affectedRows > 0;
    }
}

export default UserModel;