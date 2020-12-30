<script>
	import {MusicalRatios, ratioToPower} from 'musical-ratios';
	import {MediaQueryManager} from 'media-query-manager';
	let baseViewWidth = 1280;
	let ratioSelection = MusicalRatios[MusicalRatios.PerfectFifth];
	let bpValues;
	let lowBpRange = -3;
	let highBprange = 3;

	const range = (start, end) => {
		const length = end - start;
		return Array.from({ length }, (_, i) => start + i);
	}

	let mediaManager = new MediaQueryManager(range(lowBpRange, highBprange).map(e => baseViewWidth * ratioToPower(MusicalRatios.PerfectFifth, e)));
	let active = mediaManager.active;

	const updateActive = () => active = mediaManager.active;

	$: {
		const ratio = MusicalRatios[ratioSelection];
		const newBreaks = range(lowBpRange, highBprange).map(e => baseViewWidth * ratioToPower(ratio, e));
		mediaManager = new MediaQueryManager(newBreaks);

		mediaManager.addEventListener('change', () => {
			updateActive();
		});

		bpValues = mediaManager.breaks;
	}

</script>

<style>
	nav {
		width: 100%;
		position: absolute;
		top: 0;
		display: flex;
	}

	.bp-info {
		position: absolute;
		bottom: 10px;
		left: 10px;
		background: rgba(0, 0, 0, .5);
		border-radius: 4px;
		padding: 32px;
	}

	.selected {
		color: red;
	}
</style>

<nav>
	<select bind:value={ratioSelection}>
		{#each Object.keys(MusicalRatios).filter(e => isNaN(parseFloat(e))) as rat}
			<option value={rat}>
				{rat}
			</option>
		{/each}
	</select>
	<label>
		Low BP
		<input type=number bind:value={lowBpRange} min=-8 max=0>
		<input type=range bind:value={lowBpRange} min=-8 max=0>
	</label>
	<label>
		High BP
		<input type=number bind:value={highBprange} min=0 max=8>
		<input type=range bind:value={highBprange} min=0 max=8>
	</label>
	<label>
		BaseViewWidth
		<input type=number bind:value={baseViewWidth} on:input={updateActive} min=640 max=2560>
	</label>
</nav>

<div class='bp-info'>
	<ol start={lowBpRange}>
		{#each bpValues as bp}
			<li class="{bp === active ? 'selected' : ''}">{bp}</li>
		{/each}
	</ol>
</div>
