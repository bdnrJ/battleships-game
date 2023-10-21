import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import createDatabaseConnection from "../config/database.js"

export interface Game {
  id?: number,
  player1_id: number,
  player2_id?: number,
  p1_won: boolean,
  game_date: Date,
}

class GameModel{
  static createGame = async (game: Game) => {
    const connection: PoolConnection = await createDatabaseConnection();

    const insertQuery = 'INSERT INTO games (player1_id, player2_id, p1_won, game_date) VALUES (?, ?, ?, ?)';

    const [result] = (await connection.execute(insertQuery, [
      game.player1_id,
      game.player2_id,
      game.p1_won,
      new Date()
    ])) as ResultSetHeader[];

    connection.release();

    return result;
  }
}

export default GameModel;