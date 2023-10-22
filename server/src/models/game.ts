import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import createDatabaseConnection from "../config/database.js";

export interface Game {
	id?: number;
	player1_id: number | null;
	player2_id: number | null;
	p1_won: boolean;
	game_date: Date;
}

export interface Front__Game {
	id: number;
  player1_id: number | null;
	player1_nickname: string | null;
	player2_id: number | null;
	player2_nickname: string | null;
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

	// returns
	//{
	//   "id": 3,
	//   "player1_nickname": null,
	//   "player2_nickname": "adminadmin",
	//   "p1_won": 0,
	//   "game_date": "2023-10-22T14:31:12.000Z"
	// }

	static getUserGames = async (user_id: number): Promise<Game[]> => {
		const connection: PoolConnection = await createDatabaseConnection();

		const query = `
    SELECT games.id, 
    player1.id AS player1_id, 
    player1.nickname AS player1_nickname, 
    player2.id AS player2_id, 
    player2.nickname AS player2_nickname, 
    games.p1_won, 
    games.game_date
    FROM games
    LEFT JOIN users AS player1 
    ON games.player1_id = player1.id
    LEFT JOIN users AS player2 
    ON games.player2_id = player2.id
    WHERE player1.id = ? OR player2.id = ?;

    `;

		const [rows] = (await connection.execute(query, [user_id, user_id])) as RowDataPacket[];
		connection.release();

    console.log(rows);

		if (rows.length === 0) return [];

		// Map the rows to the desired format
		const games: Game[] = rows.map((row: Front__Game) => ({
			id: row.id,
      player1_id: row.player1_id,
			player1_nickname: row.player1_nickname,
      player2_id: row.player2_id,
			player2_nickname: row.player2_nickname,
			p1_won: row.p1_won,
			game_date: row.game_date,
		}));

		return games;
	};
}

export default GameModel;
