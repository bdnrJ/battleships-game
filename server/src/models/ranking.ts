import { PoolConnection, RowDataPacket } from "mysql2/promise";
import createDatabaseConnection from "../config/database.js";

export interface Ranking {
	id?: number;
	user_id: number;
	total_games_played: number;
	total_wins: number;
	points: number;
	win_rate: number;
}

class RankingModel {
	static updateRankingAfterGame = async (player1Id: number, player2Id: number, p1Won: boolean): Promise<void> => {
		const connection: PoolConnection = await createDatabaseConnection();
		try {
			await connection.beginTransaction();

			if (player1Id !== -1) {
				// Insert player 1 into the ranking table if not exists
				await connection.execute(
					`INSERT IGNORE INTO ranking_table (user_id, total_games_played, total_wins, win_rate)
          VALUES (?, 0, 0, 0)`,
					[player1Id]
				);

				// Update player 1's ranking
				await connection.execute(
					`UPDATE ranking_table
                  SET total_games_played = total_games_played + 1,
                      total_wins = total_wins + ?,
											points = points + ?
                  WHERE user_id = ?`,
					[p1Won ? 1 : 0, p1Won ? 3 : -2, player1Id]
				);
			}

			if (player2Id !== -1) {
				// Insert player 2 into the ranking table if not exists
				await connection.execute(
					`INSERT IGNORE INTO ranking_table (user_id, total_games_played, total_wins, win_rate)
          VALUES (?, 0, 0, 0)`,
					[player2Id]
				);
				// Update player 2's ranking
				await connection.execute(
					`UPDATE ranking_table
                  SET total_games_played = total_games_played + 1,
                      total_wins = total_wins + ?,
											points = points + ?
                  WHERE user_id = ?`,
					[p1Won ? 0 : 1, p1Won ? -2 : 3, player2Id]
				);
			}

			await connection.commit();
		} catch (error) {
			await connection.rollback();
			throw error;
		} finally {
			connection.release();
		}
	};

	static getTopRankings = async (): Promise<Ranking[]> => {
		const connection: PoolConnection = await createDatabaseConnection();

		try {
			// Query to get top 100 rankings based on total_games_played and win_rate
			const [rows] = await connection.execute(
				`SELECT ranking_table.*, users.nickname 
            FROM ranking_table 
            LEFT JOIN users ON ranking_table.user_id = users.id 
            ORDER BY ranking_table.points DESC
            LIMIT 100`
			);

			return rows as Ranking[];
		} catch (error) {
			throw error;
		} finally {
			connection.release();
		}
	};
}

export default RankingModel;
