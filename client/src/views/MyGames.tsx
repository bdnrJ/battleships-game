import { useEffect, useContext } from "react";
import axiosClient from "../axios-client";
import { UserContext } from "../context/UserContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

//       id: row.id,
//       player1_nickname: row.player1_nickname,
//       player2_nickname: row.player2_nickname,
//       p1_won: row.p1_won,
//       game_date: row.game_date

type MyGame = {
	id: number;
	player1_id: number;
	player1_nickname: string;
	player2_id: number;
	player2_nickname: string;
	p1_won: number | boolean;
	game_date: string;
};

const MyGames = () => {
	const { loggedUser } = useContext(UserContext);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const fetchUserGames = async () => {
		try {
			const cachedData = queryClient.getQueryData(["mygames"]);

			if (cachedData) {
				// Return cached data if available
				console.log("cached");

				return cachedData;
			}

			console.log("requested mygames");

			const res = await axiosClient.get(`/getUserGames/${loggedUser.id}`);

			queryClient.setQueryData(["mygames"], res.data);
			return res.data;
		} catch (err: any) {
			console.log(err);
		}
	};

	const { data, isError } = useQuery({
		queryKey: ["mygames"],
		queryFn: fetchUserGames,
		staleTime: 1000 * 60 * 5,
		enabled: false,
	});

	useEffect(() => {
		if (loggedUser.id === -1) {
			navigate("/rooms");
		} else {
			fetchUserGames();
		}
	}, []);

	if (isError) {
		return (
			<div className='mygames--wrapper'>
				<div className='mygames'>Error while trying to get your games</div>
			</div>
		);
	}

	return (
		<div className='mygames--wrapper'>
			<div className='mygames'>
				<h1>My games history</h1>
			</div>
			<div className='mygames__games'>
				{data?.map((game: MyGame) => (
					<div className='mygames__games--elem' key={game.id + game.player1_id + game.player2_id}>
						<div>id: {game.id}</div>
						<div>p1 nick: {game.player1_nickname === null ? "Anon" : game.player1_nickname}</div>
						<div>p2 nick: {game.player2_nickname === null ? "Anon" : game.player2_nickname}</div>
						<div>
							{game.player1_id === loggedUser.id && game.p1_won === 1
								? "Victory"
								: game.player2_id === loggedUser.id && game.p1_won === 0
								? "Victory"
								: "Defeat"}
						</div>
						<div>date: {game.game_date}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default MyGames;
