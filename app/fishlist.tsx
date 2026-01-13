'use client';

import { useState, useEffect, FC } from 'react';
import axios from 'axios';

interface ChildProps {
	monthNumber: number;
	localTime: string;
}

export const FishList: FC<ChildProps> = ({ monthNumber, localTime }) => {
	console.log(`🚀 ~ FishList ~ localTime:`, localTime);
	console.log(`🚀 ~ FishList ~ monthNumber:`, monthNumber);
	const [fish, setFish] = useState<[]>([]);
	const apiKey = '';
	console.log(`🚀 ~ FishList ~ fish:`, fish);

	useEffect(() => {
		const fetchFish = async () => {
			try {
				const response = await axios.get('https://api.nookipedia.com/nh/fish', {
					headers: {
						'X-API-Key': apiKey,
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
					},
				});
				setFish(response.data);
			} catch (err) {
				console.log('an error occurred', err);
			}
		};

		fetchFish();
	}, []);

	const handleClick = (filter: string) => {
		console.log(`🚀 ~ handleClick ~ filter:`, filter);

		//filter by current month
		const newFish = fish?.map((fish) => {
			if (fish['north']['times_by_month'][1] !== 'NA') {
				return fish['name'], fish['north']['times_by_month'][1];
			}
		});
		console.log('newFish', newFish);

		// setFish((prev) => {
		//   prev.map((fish) => {
		// 		if (fish['north']['times_by_month'][1] !== 'NA') {
		// 			return fish['name'], fish['north']['times_by_month'][1];
		// 		}
		// 	});
		// });
	};

	//filters: all, monthly, today, current
	return (
		<>
			<div className="flex justify-center gap-5">
				<button
					onClick={() => handleClick('all')}
					className="px-7 py-1.5 my-1 border-3 border-gray-300 rounded"
				>
					All Fish
				</button>
				<button
					onClick={() => handleClick('month')}
					className="px-7 py-1.5 my-1 border-3 border-gray-300 rounded"
				>
					Monthly
				</button>
				<button
					onClick={() => handleClick('current')}
					className="px-7 py-1.5 my-1 border-3 border-gray-300 rounded"
				>
					Current
				</button>
			</div>
			<div className="pt-6 grid grid-cols-4">
				{fish?.map((fish) => {
					return (
						<div
							className="flex items-center border-2 border-white px-3 py-3"
							key={fish['name']}
						>
							<input type="checkbox" className={`h-5 w-5`} />
							<p className="pl-2 text-sm">{fish['name']}</p>
						</div>
					);
				})}
			</div>
		</>
	);
};
