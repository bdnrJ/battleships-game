import { Request, Response } from 'express';
import UserModel, { User } from '../models/user.js';
import { log } from 'console';

export async function createUser(req: Request, res: Response): Promise<void> {

    if(!req.body.nickname || !req.body.password || !req.body.email){
        res.status(400).json({message: 'Username, password and email are required to create an user'})
    }

    try {
        const newUser: User = {
            nickname: req.body.nickname,
            password: req.body.password,
            email: req.body.email,
            created_at: new Date(),
            deleted_at: null,
        };

        try{
            const userId: number = await UserModel.createUser(newUser);
            res.status(201).json({ id: userId, message: 'User created successfully' });

        }catch(err: any){
            if (err.errno === 1062) {
                res.status(400).json({message: "Username or email already used!"})
            }
        }

    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'An error occurred while creating the user' });
    }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
    console.log("gowno")
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

