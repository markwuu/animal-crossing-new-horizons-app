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
	const monthIndex = monthNumber + 1;
	const fourAMtoNinePM = times.slice(4, 21);
	const nineAMtofourPM = times.slice(9, 16);
	const ninePMtoElevenPM = times.slice(21, 24);
	const twelveAMtoFourAM = times.slice(0, 4);
	const ninePMtoFourAM = ninePMtoElevenPM.concat(twelveAMtoFourAM);

	const [isClient, setIsClient] = useState(false);
	const [fish, setFish] = useState(createFishObject);
	const [activeButton, setActiveButton] = useState<string>('all');
	const [fishCount, setFishCount] = useState(initialFishObj.length);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsClient(true);
	}, []);

	const handleClick = (filter: string) => {
		if (filter === 'all') {
			setActiveButton('all');
			setFish((prev) => {
				return prev?.map((fish) => {
					fish.display = true;
					return fish;
				});
			});
			setFishCount(initialFishObj.length);
		}

		if (filter === 'month') {
			setActiveButton('month');
			setFish((prev) => {
				return prev?.map((fish) => {
					fish.display = true;
					const availableTimes = fish['north']['times_by_month'][monthIndex];
					if (availableTimes === 'NA') fish.display = false;
					return fish;
				});
			});

			const monthFishCount = fish.reduce((acc, curr) => {
				const availableTimes = curr['north']['times_by_month'][monthIndex];
				return availableTimes !== 'NA' ? acc + 1 : acc;
			}, 0);
			setFishCount(monthFishCount);
		}

		if (filter === 'current') {
			setActiveButton('current');
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

			const dailyFishCount = fish.reduce((acc, curr) => {
				const availableTimes = curr['north']['times_by_month'][monthIndex];
				if (
					availableTimes === 'All day' ||
					(availableTimes === '4 AM – 9 PM' &&
						fourAMtoNinePM.includes(localTime)) ||
					(availableTimes === '9 AM – 4 PM' &&
						nineAMtofourPM.includes(localTime)) ||
					(availableTimes === '9 PM – 4 AM' &&
						ninePMtoFourAM.includes(localTime))
				) {
					return acc + 1;
				}
				return acc;
			}, 0);
			setFishCount(dailyFishCount);
		}
	};

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setFish((prev) => {
			const updatedFishObj = prev.map((fish) => {
				if (fish.name === value) {
					fish.checked = !fish.checked;
				}
				return fish;
			});

			// store fish obj in localstorage to save user input
			const storedFishObj = JSON.stringify(
				updatedFishObj.map((fish, i) => {
					if (fish.name === value) {
						if (fish.checked === false) {
							fish.checked = false;
						} else {
							fish.checked = true;
						}
					}
					return { id: i + 1, label: fish.name, checked: fish.checked };
				}),
			);
			localStorage.setItem('acnh:fish', storedFishObj);

			return updatedFishObj;
		});
	};

	const percentComplete = (fish) => {
		let count = 0;
		fish.map((fish) => {
			if (fish.checked && fish.display) {
				count += 1;
			}
		});
		const percentage = (count / fishCount) * 100;

		return (
			<p className="italic">
				{percentage === 100 ? (
					<>
						🎉 <span className="font-semibold">{percentage.toFixed(2)}% </span>
						Complete 🎉
					</>
				) : (
					<>
						<span className="font-semibold">{percentage.toFixed(2)}% </span>
						Complete
					</>
				)}
			</p>
		);
	};

	const activeButtonClass =
		'px-7 py-1.5 my-1 border-3 border-[#4794ed] rounded w-30 tracking-wider text-[#4794ed]';
	const inactiveButtonClass =
		'px-7 py-1.5 my-1 border-3 border-gray-300 rounded w-30 tracking-wider';

	if (!isClient) return null;

	return (
		<div>
			<div className="text-center pb-2">{percentComplete(fish)}</div>
			<div className="flex justify-center gap-5">
				<button
					onClick={() => handleClick('all')}
					className={
						activeButton === 'all' ? activeButtonClass : inactiveButtonClass
					}
				>
					All fish
				</button>
				<button
					onClick={() => handleClick('month')}
					className={
						activeButton === 'month' ? activeButtonClass : inactiveButtonClass
					}
				>
					Monthly
				</button>
				<button
					onClick={() => handleClick('current')}
					className={
						activeButton === 'current' ? activeButtonClass : inactiveButtonClass
					}
				>
					Current
				</button>
			</div>
			<div className="pt-4 grid grid-cols-4">
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
