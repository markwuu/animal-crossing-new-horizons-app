'use client';

import { useState, FC, useEffect } from 'react';
import { initialFishObj, times } from './lib/definitions';

interface ChildProps {
	monthNumber: number;
	localTime: string;
}

const createFishObject = () => {
	try {
		if (typeof window !== 'undefined') {
			const storedFishObj = JSON.parse(localStorage.getItem('acnh:fish'));
			if (storedFishObj) {
				const fishObj = initialFishObj.map((fish, i) => {
					fish.checked = storedFishObj[i].checked;
					return fish;
				});
				return storedFishObj ? fishObj : initialFishObj;
			} else {
				return initialFishObj;
			}
		} else {
			return null;
		}
	} catch (error) {
		console.error('Local storage error:', error);
	}
};

export const FishList: FC<ChildProps> = ({ monthNumber, localTime }) => {
	const [isClient, setIsClient] = useState(false);
	const monthIndex = monthNumber + 1;
	const [fish, setFish] = useState(createFishObject);
	const fourAMtoNinePM = times.slice(4, 21);
	const nineAMtofourPM = times.slice(9, 16);
	const ninePMtoElevenPM = times.slice(21, 24);
	const twelveAMtoFourAM = times.slice(0, 4);
	const ninePMtoFourAM = ninePMtoElevenPM.concat(twelveAMtoFourAM);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsClient(true);
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

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setFish((prev) => {
			const fishObject = JSON.stringify(
				prev.map((fish, i) => {
					if (fish.name === value) fish.checked = true;
					return { id: i + 1, label: fish.name, checked: fish.checked };
				}),
			);
			localStorage.setItem('acnh:fish', fishObject);

			return prev.map((fish) => {
				if (fish.name === value) fish.checked = true;
				return fish;
			});
		});
	};

	if (!isClient) return null;

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
								<input
									type="checkbox"
									className={`h-5 w-5`}
									id={fish.name}
									value={fish.name}
									name={fish.name}
									checked={fish.checked}
									onChange={(e) => handleCheckboxChange(e)}
								/>
								<p className="pl-2 text-sm">{fish['name']}</p>
							</div>
						);
					}
				})}
			</div>
		</div>
	);
};
