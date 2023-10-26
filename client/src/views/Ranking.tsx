import { useEffect } from "react";
import axiosClient from "../axios-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type RankingRow = {
	id: number;
	nickname: string;
	total_games_played: number;
	total_wins: number;
	user_id: number;
	win_rate: number;
};

const Ranking = () => {
	const queryClient = useQueryClient();

	const fetchRanking = async () => {
		try {
			const cachedData = queryClient.getQueryData(["ranking"]);

			if (cachedData) {
				// Return cached data if available
				console.log("cached");

				return cachedData;
			}

			console.log("requested ranking");

			const res = await axiosClient.get("/ranking");

			queryClient.setQueryData(["ranking"], res.data);

			return res.data;
		} catch (err: any) {
			console.log(err);
		}
	};

	const { data, isError } = useQuery({
		queryKey: ["ranking"],
		queryFn: fetchRanking,
		staleTime: 1000 * 60 * 5,
		enabled: false,
	});

	useEffect(() => {
		fetchRanking();
	}, []);

	if (isError) {
		return (
			<div className='ranking--wrapper'>
				<div className='ranking'>Error while trying to get ranking</div>
			</div>
		);
	}

	return (
		<div className='ranking--wrapper'>
			<div className='ranking'>
				<h1>Ranking</h1>
				<section className='ranking__list'>
					{data?.map((row: RankingRow, idx: number) => (
						<div className="ranking__list--elem" key={row.id + idx + row.user_id}>
							<div className="ranking__list--elem--idx" >{idx + 1}</div>
							<div className="ranking__list--elem--nick" >{row.nickname}</div>
							<div className="ranking__list--elem--totalgames" >{row.total_games_played} games</div>
							<div className="ranking__list--elem--won">{row.total_wins} won</div>
							<div className="ranking__list--elem--lost">{row.total_games_played - row.total_wins} lost </div>
							<div className="ranking__list--elem--wr" >{((row.total_wins / row.total_games_played) * 100).toFixed(1)}% wr</div>
						</div>
					))}
				</section>
			</div>
		</div>
	);
};

export default Ranking;
