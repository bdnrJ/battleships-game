import { Request, Response } from 'express';
import UserModel, { User } from '../models/user.js';
import { log } from 'console';

interface createUserRequest {
    nickname: string;
    password: string;
    confirmPassword: string;
    email: string;
}

const nicknameRegex = /^[a-zA-Z0-9]{3,18}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^.{8,30}$/;


export async function createUser(req: Request, res: Response): Promise<void> {

    const {nickname, password, email, confirmPassword} : createUserRequest = req.body;

    if(!nickname || !password || !email || !confirmPassword){
        res.status(400).json({message: 'username, password and email are required to create an user'})
        return
    }

    if(password !== confirmPassword){
        res.status(400).json({message: "paswords do not match"})
        return
    }

    if (!nicknameRegex.test(nickname) || !emailRegex.test(email) || !passwordRegex.test(password)) {
        res.status(400).json({ message: 'invalid format of nickname or email or password' });
        return;
    }

    try {
        const newUser: User = {
            nickname: nickname,
            password: password,
            email: email.toLowerCase(),
            created_at: new Date(),
            deleted_at: null,
        };

        try{
            const userId: number = await UserModel.createUser(newUser);
            res.status(201).json({ id: userId, message: 'user created successfully' });

        }catch(err: any){
            if (err.errno === 1062) {
                res.status(400).json({message: "username or email already used!"})
            }
        }

    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'an error occurred while creating the user' });
    }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
    try {
        const userId: number = parseInt(req.params.id, 10);

        const user: User | null = await UserModel.getUserById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(user);
        }
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'An error occurred while fetching the user' });
    }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
    try {
        const userId: number = parseInt(req.params.id, 10);

        const deleted: boolean = await UserModel.deleteUser(userId);

        if (deleted) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'An error occurred while deleting the user' });
    }
}