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
	const fourPMtoNineAM = times.filter((time, i) => i >= 16 || i <= 9);
	const nineAMtofourPM = times.slice(9, 16);
	const ninePMtoElevenPM = times.slice(21, 24);
	const twelveAMtoFourAM = times.slice(0, 4);
	const ninePMtoFourAM = ninePMtoElevenPM.concat(twelveAMtoFourAM);
	const fishEmoji = {
		Pond: '💧',
		River: '💦',
		'River (mouth)': '👄 + 💦',
		'River (clifftop)': '🏔️ + 💦',
		Pier: '⚓️',
		Sea: '🌊',
		'Sea (raining)': '🌧️ + 🌊',
	};

	const [isClient, setIsClient] = useState(false);
	const [fish, setFish] = useState(createFishObject);
	const [activeButton, setActiveButton] = useState<string>('all');
	const [fishCount, setFishCount] = useState(initialFishObj.length);
	const [selectedValue, setSelectedValue] = useState('Select');

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsClient(true);
	}, []);

	const handleClick = (filter: string) => {
		if (filter === 'all') {
			setActiveButton('all');
			setFish((prev) => {
				return prev?.map((fish) => {
					if (fish.location === selectedValue) {
						fish.display = true;
					} else {
						fish.display = false;
					}

					if (selectedValue === 'Select') fish.display = true;
					return fish;
				});
			});
			setFishCount(initialFishObj.length); //todo update correct count
		}

		if (filter === 'month') {
			setActiveButton('month');
			setFish((prev) => {
				// todo handle drop down
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

		if (filter === 'now') {
			setActiveButton('now');
			setFish((prev) => {
				// todo handle drop down
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
						availableTimes === '4 PM – 9 AM' &&
						fourPMtoNineAM.includes(localTime)
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

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		const { value } = event.target;

		setSelectedValue(value);
		setFish((prev) => {
			return prev.map((fish) => {
				const availableTimes = fish['north']['times_by_month'][monthIndex];

				//handles all functionality working
				if (activeButton === 'all') {
					if (fish.location === value) {
						fish.display = true;
					} else {
						fish.display = false;
					}
					if (value === 'Select') fish.display = true;
				}

				//handles month functionality working
				if (activeButton === 'month') {
					if (fish.location === value && availableTimes !== 'NA') {
						fish.display = true;
					} else {
						fish.display = false;
					}

					//handles 'select' option while on month
					if (value === 'Select') {
						fish.display = true;
						if (availableTimes === 'NA') fish.display = false;
					}
				}

				//handles current functionality
				if (activeButton === 'now') {
					fish.display = false;
					const availableTimes = fish['north']['times_by_month'][monthIndex];

					if (availableTimes === 'NA') fish.display = false;
					if (availableTimes === 'All day' && fish.location === value)
						fish.display = true;
					if (
						availableTimes === '4 AM – 9 PM' &&
						fourAMtoNinePM.includes(localTime) &&
						fish.location === value
					) {
						fish.display = true;
					}
					if (
						availableTimes === '4 PM – 9 AM' &&
						fourPMtoNineAM.includes(localTime) &&
						fish.location === value
					) {
						fish.display = true;
					}
					if (
						availableTimes === '9 AM – 4 PM' &&
						nineAMtofourPM.includes(localTime) &&
						fish.location === value
					) {
						fish.display = true;
					}
					if (
						availableTimes === '9 PM – 4 AM' &&
						ninePMtoFourAM.includes(localTime) &&
						fish.location === value
					) {
						fish.display = true;
					}

					if (value === 'Select') {
						if (availableTimes === 'NA') fish.display = false;
						if (availableTimes === 'All day') fish.display = true;
						if (
							availableTimes === '4 AM – 9 PM' &&
							fourAMtoNinePM.includes(localTime)
						) {
							fish.display = true;
						}
						if (
							availableTimes === '4 PM – 9 AM' &&
							fourPMtoNineAM.includes(localTime)
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
					}
				}

				return fish;
			});
		});
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
					ALL
				</button>
				<button
					onClick={() => handleClick('month')}
					className={
						activeButton === 'month' ? activeButtonClass : inactiveButtonClass
					}
				>
					MONTH
				</button>
				<button
					onClick={() => handleClick('now')}
					className={
						activeButton === 'now' ? activeButtonClass : inactiveButtonClass
					}
				>
					NOW
				</button>
				<select
					className="appearance-none bg-white px-3 py-3 my-2 pr-10 text-base text-black border border-gray-300 rounded cursor-pointer bg-no-repeat bg-right bg-size-[17px]"
					style={{
						backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor"/></svg>')`,
						backgroundRepeat: 'no-repeat',
						backgroundPosition: '94% 54%',
					}}
					name="triggerLevel"
					id="trigger-level-select"
					onChange={(e) => handleChange(e)}
					value={selectedValue}
				>
					<option value={'Select'}>---Select Location---</option>
					<option value={'Pond'}>Pond - 💧</option>
					<option value={'River'}>River - 💦</option>
					<option value={'River (mouth)'}>River mouth - 👄 + 💦</option>
					<option value={'River (clifftop)'}>River clifftop - 🏔️ + 💦</option>
					<option value={'Pier'}>Pier - ⚓️</option>
					<option value={'Sea'}>Sea - 🌊</option>
					<option value={'Sea (raining)'}>Sea raining - 🌧️ + 🌊</option>
				</select>
			</div>
			<div className="pt-4 grid grid-cols-2 md:grid-cols-3">
				{fish?.map((fish) => {
					if (fish.display === true) {
						return (
							<div
								className="flex items-center border-2 border-white px-3 py-3 select-none"
								key={fish['name']}
								id={fish['name']}
							>
								{
									<>
										<input
											type="checkbox"
											className={`h-5 w-5`}
											id={fish.name}
											value={fish.name}
											name={fish.name}
											checked={fish.checked}
											onChange={(e) => handleCheckboxChange(e)}
										/>
										<div className="pl-2 text-sm flex flex-row justify-between w-full">
											<p>{fish['name'].toUpperCase()}</p>
											<p>{fishEmoji[fish['location']]}</p>
										</div>
									</>
								}
							</div>
						);
					}
				})}
			</div>
		</div>
	);
};
