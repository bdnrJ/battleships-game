import { Request, Response } from "express";
import GameModel, { Game, RankingInfo } from "../models/game.js";


export const getUserGamesById = async (req: Request, res: Response) => {
	try {
    const user_id: number = parseInt(req.params.id, 10);

    const userGames: Game[] | null = await GameModel.getUserGames(user_id);

    if (!userGames) {
			res.status(404).json({ message: "Not found any games for this user" });
		} else {
			res.status(200).json(userGames);
		}

	} catch (err: any) {
		console.error("Error getting user games:", err);
		res.status(500).json({ message: "an error occurred while requesting games for an user" });
	}
};

export const getUserGamesAndStatsById = async (req: Request, res: Response) => {
	try {
    const user_id: number = parseInt(req.params.id, 10);

    const userGames: Game[] | null = await GameModel.getUserGames(user_id);
		const userStats: RankingInfo | null = await GameModel.getUserRanking(user_id);

    if (!userGames) {
			res.status(404).json({ message: "Not found any games for this user" });
		} else {
			res.status(200).json({userGames: userGames, userStats: userStats});
		}

	} catch (err: any) {
		console.error("Error getting user games:", err);
		res.status(500).json({ message: "an error occurred while requesting games for an user" });
	}
};
