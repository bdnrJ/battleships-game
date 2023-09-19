import { Request, Response } from 'express';
import UserModel, { User } from '../models/user.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface loginRequest {
    nickname: string,
    password: string,
}

export async function login(req: Request, res: Response): Promise<void> {
    try{
        const {nickname, password} : loginRequest = req.body;

        if(!nickname || !password){
            res.status(400).json({message: "Nickname or password not provided"});
        }

        const user: User | null = await UserModel.getUserByNickname(nickname);

        if(!user){
            res.status(404).json({message: "Wrong nickname or password"})
            return;
        }

        const match: boolean = await bcrypt.compare(password, user.password);
        
        if(match) {
            const token = jwt.sign(
                { user_id: user.id, nickname },
                    `${process.env.TOKEN_KEY}`,
                {
                    expiresIn: "2h",
                }
            );

            const userInfo = {
                nickname: user.nickname,
            }

            res.status(200).cookie('token', token, {
                httpOnly: true,
                maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
            }).json({
                message: "Successfuly signed in",
                userInfo
            })
            return
        }

        res.status(400).json({message: "Wrong login or password"})
    }catch(err){
        console.error('Error while signing in:', err);
        res.status(500).json({ message: 'An error occurred while singing in' });
    }
}
