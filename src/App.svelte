<script>
    import {MusicalRatios, ratioToPower} from 'musical-ratios';
    import {MediaQueryManager} from 'media-query-manager';
    import cssProps from 'css-custom-properties';

    let bpValues = [];
    let baseViewWidth = 1280;
    let ratioSelection = MusicalRatios[MusicalRatios.PerfectFifth];
    let lowBpRange = -3;
    let highBprange = 3;
    let open = false;
    let bpStep = 1;
    let fontStep = 1;
    let cssVars = {};

    function scaledSize(ratio, level, size = 1) {
        return size * ratioToPower(ratio, level);
    }

    const range = (start, end, stpSize = 1) => {
        const out = [];
        let count = 0;

        for (let i = -stpSize; i > start - 1; i -= stpSize) {
            out.push(start + stpSize * count++);
        }

        out.push(0);
        count = 1;

        for (let i = stpSize; i < end + 1; i += stpSize) {
            out.push(stpSize * count++);
        }

        return out;
    }

    const initRange = range(lowBpRange, highBprange, bpStep);
    let mediaManager = new MediaQueryManager(initRange.map(e => baseViewWidth * ratioToPower(MusicalRatios.PerfectFifth, e)));
    let active = mediaManager.active;

    let baseBrowserSize = 10;
    let baseFont = 16;

    $: {
        const html = document.querySelector('html');
        if (html) {
            html.style.fontSize = `${baseBrowserSize / 16 * 100}%`
        }
    }

    let bpRatios = bpValues.reduce((a, c) => ({...a, [c]: MusicalRatios.PerfectFifth}), {});
    $: {
        cssVars = {};
        const ratio = MusicalRatios[bpRatios[active]];
        for (let i = -10; i < 0; i++) {
            let size = scaledSize(ratio, i, baseFont);
            size = isNaN(size) ? baseFont : size;
            cssVars[`modular-size-n${-i}`] = (size / baseBrowserSize).toFixed(4) + 'rem';
        }
        for (let i = 0; i <= 10; i++) {
            let size = scaledSize(ratio, i, baseFont);
            size = isNaN(size) ? baseFont : size;
            cssVars[`modular-size-l${i}`] = (size / baseBrowserSize).toFixed(4) + 'rem';
        }
        console.log(cssVars);
        cssProps.set(cssVars);
    }

    const updateActive = () => active = mediaManager.active;

    $: {
        const ratio = MusicalRatios[ratioSelection];
        const newBreaks = range(lowBpRange, highBprange, bpStep).map(e => baseViewWidth * ratioToPower(ratio, e));
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
        flex-direction: column;
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
        <select bind:value={ratioSelection} on:blur={updateActive}>
            {#each Object.keys(MusicalRatios).filter(e => isNaN(parseFloat(e))) as rat}
                <option value={rat}>
                    {rat}
                </option>
            {/each}
        </select>
    </label>
    <label>
        Low BP
        <input type=number bind:value={lowBpRange} on:input={updateActive} min=-8 max=0 step=1>
        <input type=range bind:value={lowBpRange} on:input={updateActive} min=-8 max=0 step=1>
    </label>
    <label>
        High BP
        <input type=number bind:value={highBprange} on:input={updateActive} min=0 max=8 step=1>
        <input type=range bind:value={highBprange} on:input={updateActive} min=0 max=8 step=1>
    </label>
    <label>
        Step Size
        <input type=number bind:value={bpStep} on:input={updateActive} min=.1 max=2 step=.1>
        <input type=range bind:value={bpStep} on:input={updateActive} min=.1 max=2 step=.1>
    </label>
    <label>
        BaseViewWidth
        <input type=number bind:value={baseViewWidth} on:input={updateActive} min=640 max=2560>
    </label>
    <h1>Font</h1>
    <label>
        Base Font Size
        <input type=number bind:value={baseBrowserSize} min=1 max=32 step=1>
        <input type=range bind:value={baseBrowserSize} min=1 max=32 step=1>
    </label>
    <label>
        Font Size
        <input type=number bind:value={baseFont} min=1 max=32 step=1>
        <input type=range bind:value={baseFont} min=1 max=32 step=1>
    </label>
    <div class="opener" on:click="{() => open = !open}"></div>
</div>

<div class='bp-info'>
    <ol start={lowBpRange}>
        {#each bpValues as bp}
            <li class="{bp === active ? 'selected' : ''}">{Math.round(bp)}</li>
            <select bind:value={bpRatios[bp]}>
                {#each Object.keys(MusicalRatios).filter(e => isNaN(parseFloat(e))) as rat}
                    <option value={rat}>
                        {rat}
                    </option>
                {/each}
            </select>
        {/each}
    </ol>
</div>

<div class="page">
    <h1 style="font-size: 96px">Font</h1>
    {#each Array(5).fill(0).map((e, i) => -(i + 1)).reverse() as i}
        <p style="font-size: var(--modular-size-n{-i})">Level: {i}</p>
        <p style="font-size: var(--modular-size-n{-i})">Px: {cssVars[`modular-size-n${-i}`]}</p>
    {/each}
    {#each range(0, 6) as i}
        <p style="font-size: var(--modular-size-l{i})">Level: {i}</p>
        <p style="font-size: var(--modular-size-l{i})">Px: {cssVars[`modular-size-l${i}`]}</p>
    {/each}
</div>

<div class="page">
    <h1 style="font-size: 96px">Margin/Padding</h1>
    <div class="row-flex">
        {#each Array(5).fill(0).map((e, i) => -(i + 1)).reverse() as i}
            <p style="font-size: var(--modular-size-l0)">Level: {i}</p>
            <p style="font-size: var(--modular-size-l0)">Px: {cssVars[`modular-size-n${-i}`]}</p>
            <div style="width: var(--modular-size-n{-i}); height: var(--modular-size-n{-i}); background: lightblue;"></div>
        {/each}
        {#each range(0, 6) as i}
            <p style="font-size: var(--modular-size-l0)">Level: {i}</p>
            <p style="font-size: var(--modular-size-l0)">Px: {cssVars[`modular-size-l${i}`]}</p>
            <div style="width: var(--modular-size-l{i}); height: var(--modular-size-l{i}); background: lightblue;"></div>
        {/each}
    </div>
</div>
