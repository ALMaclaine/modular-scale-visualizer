<script>
	import {MusicalRatios, ratioToPower} from 'musical-ratios';
	import {MediaQueryManager} from 'media-query-manager';
	const BaseViewWidth = 1280;
	let ratioSelection = '';
	let bpValues = [];

	$: {
		const ratio = MusicalRatios[ratioSelection];
		const newBreaks = [-3, -2, -1, 0, 1, 2].map(e => BaseViewWidth * ratioToPower(ratio, e));
		const mediaManager = new MediaQueryManager(newBreaks);
		bpValues = mediaManager.breaks;
	}


</script>

<style>

</style>

<select bind:value={ratioSelection}>
	{#each Object.keys(MusicalRatios).filter(e => isNaN(parseFloat(e))) as rat}
		<option value={rat}>
			{rat}
		</option>
	{/each}
</select>

<ol>
	{#each bpValues as bp}
		<li>{bp}</li>
	{/each}
</ol>
