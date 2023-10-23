import React, { useEffect, useState } from "react";
import axiosClient from "../axios-client";

// id: 3
// ​​
// nickname: "useruser"
// ​​
// total_games_played: 2
// ​​
// total_wins: 2
// ​​
// user_id: 44
// ​​
// win_rate: "0.00"

const Ranking = () => {
	const [ranking, setRanking] = useState<any>([]);

	const getRanking = async () => {
		try {
			const res = await axiosClient.get("/ranking");

			console.log(res.data);
			setRanking(res.data);
		} catch (err: any) {
			console.log(err);
		}
	};

	useEffect(() => {
		getRanking();
	}, []);

	return (
		<div className='ranking--wrapper'>
			<div className='ranking'>
				{ranking.map((row: any, idx: number) => (
					<>
						<div>{idx}</div>
            <div>{row.nickname}</div>
            <div>games played: {row.total_games_played}</div>
            <div>wins: {row.total_wins}</div>
            <div>loses: {row.total_games_played - row.total_wins}</div>
            <div>winrate: {(row.total_wins / row.total_games_played)*100 }%</div>
					</>
				))}
			</div>
		</div>
	);
};

// id: 3
// ​​
// nickname: "useruser"
// ​​
// total_games_played: 2
// ​​
// total_wins: 2
// ​​
// user_id: 44
// ​​
// win_rate: "0.00"

export default Ranking;
