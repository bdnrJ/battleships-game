import { useEffect, useState, useContext } from 'react'
import axiosClient from '../axios-client';
import { UserContext } from '../context/UserContext';

const MyGames = () => {
  const [games, setGames] = useState<any>([]);

  const {loggedUser} = useContext(UserContext);

  const getUserGames = async () => {
    try{
      const res = await axiosClient.get(`/getUserGames/${loggedUser.id}`)

      setGames(res.data);

      console.log(res.data);
      
    }catch(err: any){
      console.log(err);
      
    }
  }

  useEffect(() => {
    getUserGames();
  }, [])

  //       id: row.id,
  //       player1_nickname: row.player1_nickname,
  //       player2_nickname: row.player2_nickname,
  //       p1_won: row.p1_won,
  //       game_date: row.game_date

  return (
    <div className="mygames--wrapper">
      <div className="mygames">
        <h1>My games history</h1>
      </div>
      <div className="mygames__games">
        {games.map((game: any) => (
          <div className="mygames__games--elem">
            <div>id: {game.id}</div>
            <div>p1 nick: {game.player1_nickname === null ? "Anon" : game.player1_nickname}</div>
            <div>p2 nick: {game.player2_nickname === null ? "Anon" : game.player2_nickname}</div>
            <div>{game.player1_id === loggedUser.id && game.p1_won === 1
                ? 'Victory'
                : game.player2_id === loggedUser.id && game.p1_won === 0
                ? 'Victory'
                : 'Defeat'}</div>
            <div>date: {game.game_date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyGames