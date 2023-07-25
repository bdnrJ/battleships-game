import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, '..', 'logs.txt');

export const loggerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${req.method} ${req.url}\n`;

    // Print the action to console
    console.log(logMessage);

    try {
        // Write the action to logs.txt file
        await fs.appendFile(logFilePath, logMessage, 'utf-8');
    } catch (err) {
        console.error('Error writing to log file:', err);
    }

    // Continue to the next middleware or route handler
    next();
};
