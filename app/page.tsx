import { FishList } from './fishlist';

export default function Home() {
	const date = new Date();
	const monthName = new Intl.DateTimeFormat(navigator.language, {
		month: 'long',
	}).format(date);

	const localTime = new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	}).format(date);

	const localTimeHour = new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
	}).format(date);

	const monthIndex = new Intl.DateTimeFormat('en-US', {
		month: '2-digit',
	}).format(date);

	return (
		<div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black border-0 border-white">
			<main className="flex min-h-screen w-full max-w-2xl md:max-w-3xl flex-col py-15 px-4 bg-white dark:bg-black border-0 border-white">
				<h1 className="flex flex-col pb-2 text-center text-2xl uppercase font-bold tracking-tight font-mono border-0 border-white">
					Animal Crossing New Horizons: Fish
				</h1>
				<p className="pb-2 text-center text-lg">
					{monthName}, {localTime}
				</p>
				<FishList monthNumber={Number(monthIndex)} localTime={localTimeHour} />
			</main>
		</div>
	);
}
