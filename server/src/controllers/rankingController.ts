import { Request, Response } from "express";
import RankingModel, { Ranking } from "../models/ranking.js";

export const updateRankings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { player1_id, player2_id, p1_won } = req.body;

        // Ensure player1_id, player2_id, and p1_won are provided in the request body
        if (!player1_id || !player2_id || p1_won === undefined) {
            res.status(400).json({ message: "Invalid request parameters" });
            return;
        }

        // Convert p1_won to boolean
        const p1Won: boolean = p1_won === 1;

        await RankingModel.updateRankingAfterGame(player1_id, player2_id, p1Won);
        
        res.status(200).json({ message: "Rankings updated successfully" });
    } catch (error) {
        console.error("Error updating rankings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getTop100Ranking = async (req: Request, res: Response): Promise<void> => {
  try {
      const rankings: Ranking[] = await RankingModel.getTopRankings();
      res.status(200).json(rankings);
  } catch (error) {
      console.error("Error fetching rankings:", error);
      res.status(500).json({ message: "Internal server error" });
  }
}
