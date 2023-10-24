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
				<div className='ranking'>
          Error while trying to get ranking
        </div>
			</div>
		);
	}

	return (
		<div className='ranking--wrapper'>
			<div className='ranking'>
				{data?.map((row: RankingRow, idx: number) => (
					<div key={row.id + idx + row.user_id}>
						<div>{idx}</div>
						<div>{row.nickname}</div>
						<div>games played: {row.total_games_played}</div>
						<div>wins: {row.total_wins}</div>
						<div>loses: {row.total_games_played - row.total_wins}</div>
						<div>winrate: {(row.total_wins / row.total_games_played) * 100}%</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Ranking;
