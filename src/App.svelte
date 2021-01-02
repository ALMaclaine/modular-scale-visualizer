<script>
    import {MusicalRatios, ratioToInterval, intervalToRatio} from 'musical-ratios';
    import cssProps from 'css-custom-properties';
    import {onMount} from 'svelte';
    import {RhythmicBreakpoints} from 'rhythmic-breakpoints';
    import {RhythmicScale} from 'rhythmic-scale';

    let responsiveSettings = {
        baseViewWidth: 1280,
        lowBpCount: -3,
        highBpCount: 3,
        bpStep: 1
    };

    let open = false;
    let cssVars;
    let bpWidths;
    let rhythmicScale = new RhythmicScale({baseFont: 16});

    function handleUpdateBaseFont() {
        document.querySelector('html').style.fontSize = `${rhythmicScale.baseFont / 16 * 100}%`
    }

    onMount(() => {
        handleUpdateBaseFont();
    });

    let intervalSelection = ratioToInterval(MusicalRatios.PerfectFifth);
    let mediaManager = new RhythmicBreakpoints();
    const updateActive = () => active = mediaManager.active;
    mediaManager.addEventListener('change', updateActive);
    let bpValues;
    let active = mediaManager.active;

    // run when intervalSelection, baseWidth, highBpCount, lowBpCount, ratio, bpStep are updated
    $: {
        const ratio = intervalToRatio(intervalSelection);
        if(mediaManager) mediaManager.removeEventListener('change', updateActive);

        mediaManager = new RhythmicBreakpoints({
            baseWidth: responsiveSettings.baseViewWidth,
            highBpCount: responsiveSettings.highBpCount,
            lowBpCount: responsiveSettings.lowBpCount,
            ratio,
            stepSize: responsiveSettings.bpStep
        });

        mediaManager.addEventListener('change', updateActive);
        updateActive();
        bpValues = mediaManager.breaks;

        const newWidths = [bpValues[0]];
        for (let i = 1; i < bpValues.length - 1; i++) {
            newWidths.push(bpValues[i] - bpValues[i - 1]);
        }
        bpWidths = newWidths;
    }

    let bpIntervals = mediaManager.breakpointRatioMap;
    function handleIntervalChange(e, bp) {
        mediaManager.setBpInterval(bp, e.target.value);
        bpIntervals = mediaManager.breakpointRatioMap;
    }

    // runs when active, size, baseSize, baseBrowserFontSize, lineHeightFactor change
    $: {
        cssVars = {};
        const ratio = intervalToRatio(bpIntervals.get(active));
        for (let i = -10; i < 0; i++) {
            const scaledStyles = rhythmicScale.scaledStyles(ratio, i, .9);
            cssVars[`modular-size-n${-i}`] = scaledStyles.size;
            cssVars[`modular-line-height-n${-i}`] = scaledStyles.lineHeight;
        }
        for (let i = 0; i <= 10; i++) {
            const scaledStyles = rhythmicScale.scaledStyles(ratio, i, .9);
            cssVars[`modular-size-l${i}`] = scaledStyles.size;
            cssVars[`modular-line-height-l${i}`] = scaledStyles.lineHeight;
        }
        cssProps.set(cssVars);
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
        background: #999;
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
        top: -50vh;
        background: grey;
    }

    .selected {
        color: red;
    }

    .page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-bottom: 100px solid yellow;
    }

    .row-flex {
        width: 80%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
    }

    .row-flex div {
        margin: 48px;
    }

</style>

<div class="controls {open ? 'open' : ''}">
    <h1>General</h1>
    <label>
        Breakpoint Ratio
        <select bind:value={intervalSelection} on:blur={updateActive}>
            {#each Object.keys(MusicalRatios).filter(e => isNaN(parseFloat(e))) as rat}
                <option value={rat}>
                    {rat}
                </option>
            {/each}
        </select>
    </label>
    <label>
        Low BP
        <input type=number bind:value={responsiveSettings.lowBpCount} on:input={updateActive} min=-8 max=0 step=1>
        <input type=range bind:value={responsiveSettings.lowBpCount} on:input={updateActive} min=-8 max=0 step=1>
    </label>
    <label>
        High BP
        <input type=number bind:value={responsiveSettings.highBpCount} on:input={updateActive} min=0 max=8 step=1>
        <input type=range bind:value={responsiveSettings.highBpCount} on:input={updateActive} min=0 max=8 step=1>
    </label>
    <label>
        Step Size
        <input type=number bind:value={responsiveSettings.bpStep} on:input={updateActive} min=.1 max=2 step=.1>
        <input type=range bind:value={responsiveSettings.bpStep} on:input={updateActive} min=.1 max=2 step=.1>
    </label>
    <label>
        BaseViewWidth
        <input type=number bind:value={responsiveSettings.baseViewWidth} on:input={updateActive} min=640 max=2560>
    </label>
    <h1>Font</h1>
    <label>
        Base Font Size
        <input type=number bind:value={rhythmicScale.baseBrowserFontSize} min=1 max=32 step=1>
        <input type=range bind:value={rhythmicScale.baseBrowserFontSize} min=1 max=32 step=1>
    </label>
    <label>
        Font Size
        <input type=number on:change={handleUpdateBaseFont} bind:value={rhythmicScale.baseFont} min=1 max=32 step=1>
        <input type=range on:change={handleUpdateBaseFont} bind:value={rhythmicScale.baseFont} min=1 max=32 step=1>
    </label>
    <label>
        Line Height Factor (line height * baseFont)
        <input type=number bind:value={rhythmicScale.lineHeightFactor} min=1 max=2 step=.01>
        <input type=range bind:value={rhythmicScale.lineHeightFactor} min=1 max=2 step=.01>
    </label>
    <div class="opener" on:click="{() => open = !open}"></div>
</div>

<div class='bp-info'>
    <ol start={responsiveSettings.lowBpCount}>
        {#each bpValues as bp}
            <li class="{bp === active ? 'selected' : ''}">{Math.round(bp)}</li>
            <select on:input={(e) => handleIntervalChange(e, bp)}>
                {#each Object.keys(MusicalRatios).filter(e => isNaN(parseFloat(e))) as interval}
                    <option value={interval}>
                        {interval}
                    </option>
                {/each}
            </select>
        {/each}
    </ol>
</div>

<div style="height: 100vh; display: flex; overflow: scroll;">
    {#each bpWidths as bpWidth, i}
        <div style="display: inline-block;
        height: 100%; min-width: {bpWidth}px;
        background-color: hsl({(i * 45)%360}, 100%, 50%);
        display: flex;
        justify-content: center;
        align-items: center;
        ">
            <p style="font-size: {196/bpValues.length}px">{bpValues[i].toFixed(2)}px</p>
        </div>
    {/each}
</div>

<div class="page">
    <h1 style="font-size: 96px">Font</h1>
    {#each Array(5).fill(0).map((e, i) => -(i + 1)).reverse() as i}
        <p style="font-size: var(--modular-size-n{-i}); line-height: var(--modular-line-height-n{-i})">Level: {i}</p>
        <p style="font-size: var(--modular-size-n{-i}); line-height: var(--modular-line-height-n{-i})">
            Px: {cssVars[`modular-size-n${-i}`]}</p>
    {/each}
    {#each Array(7).fill(0).map((e, i) => i) as i}
        <p style="font-size: var(--modular-size-l{i}); line-height: var(--modular-line-height-l{i})">Level: {i}</p>
        <p style="font-size: var(--modular-size-l{i}); line-height: var(--modular-line-height-l{i})">
            Px: {cssVars[`modular-size-l${i}`]}</p>
    {/each}
</div>

<div class="page">
    <h1 style="font-size: 96px">Margin/Padding</h1>
    <div class="row-flex">
        {#each Array(5).fill(0).map((e, i) => -(i + 1)).reverse() as i}
            <div>
                <p style="font-size: var(--modular-size-l0)">Level: {i}</p>
                <p style="font-size: var(--modular-size-l0)">Px: {cssVars[`modular-size-n${-i}`]}</p>
                <div style="width: var(--modular-size-n{-i}); height: var(--modular-size-n{-i}); background: lightblue;"></div>
            </div>
        {/each}
        {#each Array(7).fill(0).map((e, i) => i) as i}
            <div style="display: flex; align-items: center; flex-direction: column">
                <p style="font-size: var(--modular-size-l0)">Level: {i}</p>
                <p style="font-size: var(--modular-size-l0)">Px: {cssVars[`modular-size-l${i}`]}</p>
                <div style="width: var(--modular-size-l{i}); height: var(--modular-size-l{i}); background: lightblue;"></div>
            </div>
        {/each}
    </div>
</div>

<div class="page" style="justify-content: center;">
    <div style="display: flex; flex-direction: column; align-items: center; box-shadow: 2px 2px 8px rgba(0, 0, 0, .4); border-radius: 2px; padding: var(--modular-size-l3)">
        <h1 style="text-align: center; font-size: var(--modular-size-l4); line-height: var(--modular-line-height-l4); margin-bottom: var(--modular-size-l0);">
            Hello</h1>
        <h2 style="text-align: center; font-size: var(--modular-size-l3); line-height: var(--modular-line-height-l3); margin-bottom: var(--modular-size-l0)">
            Design Made Simple</h2>
        <h3 style="text-align: center; font-size: var(--modular-size-l2); line-height: var(--modular-line-height-l2); margin-bottom: var(--modular-size-l0);">
            Would you like to know more?</h3>
        <button style="text-align: center; font-size: var(--modular-size-l0); line-height: var(--modular-line-height-l0); margin-bottom: var(--modular-size-n1);">
            Learn More
        </button>
    </div>
</div>
