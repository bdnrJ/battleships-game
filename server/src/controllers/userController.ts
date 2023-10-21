import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import UserModel, { User } from "../models/user.js";

interface createUserRequest {
	nickname: string;
	password: string;
	confirmPassword: string;
}

const nicknameRegex = /^[a-zA-Z0-9]{3,18}$/;
const passwordRegex = /^.{8,30}$/;

export async function createUser(req: Request, res: Response): Promise<void> {
	const { nickname, password, confirmPassword }: createUserRequest = req.body;

	if (!nickname || !password || !confirmPassword) {
		res.status(400).json({ message: "username and password is required to create an user" });
		return;
	}

	if (password !== confirmPassword) {
		res.status(400).json({ message: "paswords do not match" });
		return;
	}

	if (!nicknameRegex.test(nickname) || !passwordRegex.test(password)) {
		res.status(400).json({ message: "invalid format of nickname or password" });
		return;
	}

	try {
		const newUser: User = {
			nickname: nickname,
			password: password,
			created_at: new Date(),
			deleted_at: null,
		};

		try {
			const userId: number = await UserModel.createUser(newUser);

			const token = jwt.sign({ user_id: userId, nickname }, `${process.env.TOKEN_KEY}`, {
				expiresIn: "7d",
			});

			res
				.status(201)
				.cookie("token", token, {
					httpOnly: true,
					maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
					sameSite: 'none',
					secure: true // This ensures the cookie is only sent over HTTPS connections
				})
				.json({nickname: nickname, message: "user created successfully" });
		} catch (err: any) {
			if (err.errno === 1062) {
				res.status(400).json({ message: "username already used!" });
			}
		}
	} catch (err) {
		console.error("Error creating user:", err);
		res.status(500).json({ message: "an error occurred while creating the user" });
	}
}

export async function getUserById(req: Request, res: Response): Promise<void> {
	try {
		const userId: number = parseInt(req.params.id, 10);

		const user: User | null = await UserModel.getUserById(userId);

		if (!user) {
			res.status(404).json({ message: "User not found" });
		} else {
			res.status(200).json(user);
		}
	} catch (err) {
		console.error("Error fetching user:", err);
		res.status(500).json({ message: "An error occurred while fetching the user" });
	}
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
	try {
		const userId: number = parseInt(req.params.id, 10);

		const deleted: boolean = await UserModel.deleteUser(userId);

		if (deleted) {
			res.status(200).json({ message: "User deleted successfully" });
		} else {
			res.status(404).json({ message: "User not found" });
		}
	} catch (err) {
		console.error("Error deleting user:", err);
		res.status(500).json({ message: "An error occurred while deleting the user" });
	}
}
