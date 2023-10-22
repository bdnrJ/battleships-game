import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import createDatabaseConnection from "../config/database.js";

export interface Game {
	id?: number;
	player1_id: number | null;
	player2_id: number | null;
	p1_won: boolean;
	game_date: Date;
}

class GameModel {
	static createGame = async (game: Game) => {
		const connection: PoolConnection = await createDatabaseConnection();

		const insertQuery = "INSERT INTO games (player1_id, player2_id, p1_won, game_date) VALUES (?, ?, ?, ?)";

		const [result] = (await connection.execute(insertQuery, [
			game.player1_id,
			game.player2_id,
			game.p1_won,
			new Date(),
		])) as ResultSetHeader[];

		connection.release();

		return result;
	};

	static getUserGames = async (user_id: number) => {
		const connection: PoolConnection = await createDatabaseConnection();

		const insertQuery = `
    SELECT games.id, games.player1_id, games.player2_id, games.p1_won, games.game_date
    FROM games
    LEFT JOIN users AS player1 ON games.player1_id = player1.id
    LEFT JOIN users AS player2 ON games.player2_id = player2.id
    WHERE player1.id = ? OR player2.id = ?;`;

		const [rows] = (await connection.execute(insertQuery, [
      user_id,
      user_id
		])) as RowDataPacket[]

		connection.release();

    if (rows.length === 0) return null;
		return rows as Game[]
	};
}

export default GameModel;
