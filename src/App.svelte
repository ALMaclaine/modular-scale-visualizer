<script>
	import {MusicalRatios, ratioToPower} from 'musical-ratios';
	import {MediaQueryManager} from 'media-query-manager';
	let baseViewWidth = 1280;
	let ratioSelection = MusicalRatios[MusicalRatios.PerfectFifth];
	let bpValues;
	let lowBpRange = -3;
	let highBprange = 3;
	let open = false;
	let step = 1;

	const range = (start, end, stpSize = 1) => {
		const length = end - start + 1;
		const ratio = MusicalRatios[ratioSelection];
		const out = [];
		let count = 0;

		for(let i = -stpSize; i > start - 1; i -= stpSize) {
			out.push(start + stpSize * count++);
		}

		out.push(0);
		count = 1;

		for(let i = stpSize; i < end + 1; i += stpSize) {
			out.push(stpSize * count++);
		}

		return out;
	}

	let mediaManager = new MediaQueryManager(range(lowBpRange, highBprange, step).map(e => baseViewWidth * ratioToPower(MusicalRatios.PerfectFifth, e)));
	let active = mediaManager.active;

	const updateActive = () => active = mediaManager.active;

	$: {
		const ratio = MusicalRatios[ratioSelection];
		const newBreaks = range(lowBpRange, highBprange, step).map(e => baseViewWidth * ratioToPower(ratio, e));
		mediaManager = new MediaQueryManager(newBreaks);

		mediaManager.addEventListener('change', updateActive);

		bpValues = mediaManager.breaks;
	}

</script>

<style>
	.controls {
		width: 300px;
		height: 100%;
		position: fixed;
		z-index: 2;
		box-shadow: 2px 2px 2px rgba(0, 0, 0, .3);
		background: white;
		left: -300px;
	}

	.open {
		left: 0;
	}

	.bp-info {
		position: fixed;
		bottom: 10px;
		right: 10px;
		background: rgba(0, 0, 0, .5);
		border-radius: 4px;
		padding: 32px;
	}

	label {
		display: flex;
		flex-direction: column;
	}

	.opener {
		width: 25px;
		height: 50px;
		position: relative;
		z-index: 1;
		left: 100%;
		top: 12%;
		background: grey;
	}

	.selected {
		color: red;
	}
</style>

<div class="controls {open ? 'open' : ''}">
	<label>
		Breakpoint Ratio
	<select bind:value={ratioSelection} on:change={updateActive}>
		{#each Object.keys(MusicalRatios).filter(e => isNaN(parseFloat(e))) as rat}
			<option value={rat}>
				{rat}
			</option>
		{/each}
	</select>
	</label>
	<label>
		Low BP
		<input type=number bind:value={lowBpRange} on:input={updateActive} min=-8 max=0>
		<input type=range bind:value={lowBpRange} on:input={updateActive} min=-8 max=0>
	</label>
	<label>
		High BP
		<input type=number bind:value={highBprange} on:input={updateActive} min=0 max=8>
		<input type=range bind:value={highBprange} on:input={updateActive} min=0 max=8>
	</label>
	<label>
		Step Size
		<input type=number bind:value={step} on:input={updateActive} min=.1 max=2 step=.1>
		<input type=range bind:value={step} on:input={updateActive} min=.1 max=2 step=.1>
	</label>
	<label>
		BaseViewWidth
		<input type=number bind:value={baseViewWidth} on:input={updateActive} min=640 max=2560>
	</label>
	<div class="opener" on:click="{() => open = !open}"></div>
</div>

<div class='bp-info'>
	<ol start={lowBpRange}>
		{#each bpValues as bp}
			<li class="{bp === active ? 'selected' : ''}">{Math.round(bp)}</li>
		{/each}
	</ol>
</div>
