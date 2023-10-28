import { useEffect, useContext, useState } from "react";
import axiosClient from "../axios-client";
import { UserContext } from "../context/UserContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

//TODO
// make this with infiite scroll or smth to not display fucking 1000 games at once :D

type MyGame = {
	id: number;
	player1_id: number;
	player1_nickname: string;
	player2_id: number;
	player2_nickname: string;
	p1_won: number | boolean;
	game_date: string;
};

type MyStats = {
	total_games_played: number;
	total_wins: number;
	total_loses: number;
	win_rate: number;
};

const MyGames = () => {
	const { loggedUser } = useContext(UserContext);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [stats, setStats] = useState<MyStats>({ total_games_played: 0, total_wins: 0, win_rate: 0, total_loses: 0 });
	const [games, setGames] = useState<MyGame[]>([]);
	const [page, setPage] = useState<number>(1);

	const fetchUserGames = async () => {
		try {
			const cachedData = queryClient.getQueryData(["mygames", page]);

			if (cachedData) {
				// Return cached data if available
				return cachedData;
			}


			// const res = await axiosClient.get(`/getUserGamesAndStats/${loggedUser.id}?page=${page}`, {params: {
			// 	page: page
			// }});

			const res = await axiosClient.get(`/getUserGamesAndStats/${loggedUser.id}?page=${page}`);

			// console.log(res);

			queryClient.setQueryData(["mygames", page], res.data);
			return res.data;
		} catch (err: any) {
			// console.log(err);
		}
	};

	const { data, isError, isLoading } = useQuery({
		queryKey: ["mygames", page],
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
	}, [page]);

	useEffect(() => {
		if (data) {
			const newGames = [...games, ...data.userGames];

			setGames(newGames);

			const totalGames = data.userStats.total_games_played;
			const totalWins = data.userStats.total_wins;

			const loses = totalGames - totalWins;
			const winrate = (totalWins / totalGames) * 100;

			setStats({ total_games_played: totalGames, total_wins: totalWins, win_rate: winrate, total_loses: loses });
		}
	}, [data]);

	// if (isError) {
	// 	return (
	// 		<div className='mygames--wrapper'>
	// 			<div className='mygames'>Error while trying to get your games</div>
	// 		</div>
	// 	);
	// }

	// if (isLoading) {
	// 	<div className='mygames--wrapper'>
	// 		<div className='mygames'>Loading...</div>
	// 	</div>;
	// }

	return (
		<div className='mygames--wrapper'>
			<div className='mygames'>
				<h1 className='mygames--title'>My games history</h1>
				<section className='mygames__stats'>
					<span>
						Games played: <b>{stats.total_games_played}</b>
					</span>
					<span>
						Wins: <b className='g__green'>{stats.total_wins}</b>
					</span>
					<span>
						Loses: <b className='g__red'>{stats.total_loses}</b>
					</span>
					<span>
						Winrate: <b>{stats.win_rate.toPrecision(3)}%</b>{" "}
					</span>
				</section>
				<section className='mygames__games'>
					{games?.map((game: MyGame) => {
						const date = game.game_date.split("T")[0];
						const time = game.game_date.split("T")[1].split(".")[0].slice(0, 5);

						const hasWon =
							game.player1_id === loggedUser.id && game.p1_won === 1
								? "Victory"
								: game.player2_id === loggedUser.id && game.p1_won === 0
								? "Victory"
								: "Defeat";

						return (
							<div
								className={`mygames__games--elem ${hasWon === "Victory" ? "--victory" : "--defeat"}`}
								key={game.id + game.player1_id + game.player2_id}
							>
								<div>id: {game.id}</div>
								<div>
									{game.player1_nickname === null ? "Anon" : game.player1_nickname} VS{" "}
									{game.player2_nickname === null ? "Anon" : game.player2_nickname}
								</div>
								<div>{hasWon}</div>
								<div>
									<div>{date}</div>
									<div>{time}</div>
								</div>
							</div>
						);
					})}
					{games.length < stats.total_games_played && (
						<button className='g__button --100w' onClick={() => setPage((prev) => prev + 1)}>
							Show more
						</button>
					)}
				</section>
				{isLoading && "Loading..."}
				{isError && "There was an error while trying to get your games..."}
			</div>
		</div>
	);
};

export default MyGames;
