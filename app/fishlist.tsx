'use client';

import { useState, useEffect, FC } from 'react';
import axios from 'axios';
import { times } from './lib/definitions';

interface ChildProps {
	monthNumber: number;
	localTime: string;
}

export const FishList: FC<ChildProps> = ({ monthNumber, localTime }) => {
	const apiKey = '';
	const monthIndex = monthNumber + 1;
	const [fish, setFish] = useState([]);
	const fourAMtoNinePM = times.slice(4, 21);
	const nineAMtofourPM = times.slice(9, 16);
	const ninePMtoElevenPM = times.slice(21, 24);
	const twelveAMtoFourAM = times.slice(0, 4);
	const ninePMtoFourAM = ninePMtoElevenPM.concat(twelveAMtoFourAM);

	useEffect(() => {
		const fetchFish = async () => {
			try {
				const response = await axios.get('https://api.nookipedia.com/nh/fish', {
					headers: {
						'X-API-Key': apiKey,
						'Content-Type': 'application/json',
					},
				});
				const fish = response.data.map((fish) => {
					fish.display = true;
					fish.checked = false;
					return fish;
				});
				setFish(fish);
			} catch (err) {
				console.log('an error occurred', err);
			}
		};

		fetchFish();
	}, []);

	const handleClick = (filter: string) => {
		if (filter === 'all') {
			setFish((prev) => {
				return prev?.map((fish) => {
					fish.display = true;
					return fish;
				});
			});
		}

		if (filter === 'month') {
			setFish((prev) => {
				return prev?.map((fish) => {
					fish.display = true;
					const availableTimes = fish['north']['times_by_month'][monthIndex];
					if (availableTimes === 'NA') fish.display = false;
					return fish;
				});
			});
		}

		if (filter === 'current') {
			setFish((prev) => {
				return prev?.map((fish) => {
					fish.display = false;
					const availableTimes = fish['north']['times_by_month'][monthIndex];
					if (availableTimes === 'NA') fish.display = false;
					if (availableTimes === 'All day') fish.display = true;
					if (
						availableTimes === '4 AM – 9 PM' &&
						fourAMtoNinePM.includes(localTime)
					) {
						fish.display = true;
					}
					if (
						availableTimes === '9 AM – 4 PM' &&
						nineAMtofourPM.includes(localTime)
					) {
						fish.display = true;
					}
					if (
						availableTimes === '9 PM – 4 AM' &&
						ninePMtoFourAM.includes(localTime)
					) {
						fish.display = true;
					}

					return fish;
				});
			});
		}
	};

	return (
		<div>
			<h2 className="text-center text-2xl pb-2">Fish</h2>
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
					if (fish.display === true) {
						return (
							<div
								className="flex items-center border-2 border-white px-3 py-3"
								key={fish['name']}
							>
								<input type="checkbox" className={`h-5 w-5`} />
								<p className="pl-2 text-sm">{fish['name']}</p>
							</div>
						);
					}
				})}
			</div>
		</div>
	);
};
