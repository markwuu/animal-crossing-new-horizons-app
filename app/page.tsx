import { FishList } from './fishlist';

export default function Home() {
	const date = new Date();
	const monthName = date.toLocaleString('default', { month: 'long' });
	const localTime = date.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});
	const localTimeHour = date.toLocaleTimeString([], {
		hour: '2-digit',
	});
	const monthIndex = date.getMonth();

	return (
		<div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex min-h-screen w-full max-w-3xl flex-col py-15 px-4 bg-white dark:bg-black">
				<h1 className="flex flex-col pb-2 text-center text-2xl uppercase font-bold tracking-tight font-mono">
					Animal Crossing New Horizons: Fish
				</h1>
				<p className="pb-2 text-center text-2xl">
					{monthName}, {localTime}
				</p>
				<FishList monthNumber={monthIndex} localTime={localTimeHour} />
			</main>
		</div>
	);
}
