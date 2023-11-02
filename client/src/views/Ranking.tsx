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
				return cachedData;
			}

			const res = await axiosClient.get("/ranking");

			queryClient.setQueryData(["ranking"], res.data);

			return res.data;
		} catch (err: any) {
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
        <table className='ranking__table'>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Nickname</th>
              <th>Total Games</th>
              <th className="ranking__table--nomobile">Won</th>
              <th className="ranking__table--nomobile">Lost</th>
              <th>WR</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row: RankingRow, idx: number) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{row.nickname}</td>
                <td>{row.total_games_played}</td>
                <td className="ranking__table--nomobile" >{row.total_wins}</td>
                <td className="ranking__table--nomobile">{row.total_games_played - row.total_wins}</td>
                <td>{((row.total_wins / row.total_games_played) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ranking;
