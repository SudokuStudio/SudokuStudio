import GridRender from '../svelte/GridRender.svelte';
import BoxRender from '../svelte/BoxRender.svelte';
import GivenRender from '../svelte/GivenRender.svelte';
import ThermoRender from '../svelte/ThermoRender.svelte';
import ArrowRender from '../svelte/ArrowRender.svelte';
import MinRender from '../svelte/MinRender.svelte';
import MaxRender from '../svelte/MaxRender.svelte';
import KillerRender from '../svelte/KillerRender.svelte';
import SelectRender from '../svelte/SelectRender.svelte';

export type ElementRenderer = NonNullable<typeof ELEMENT_RENDERERS[keyof typeof ELEMENT_RENDERERS]>;
export const ELEMENT_RENDERERS = {
    ['grid']: GridRender,
    ['box']: BoxRender,

    ['given']: GivenRender,
    ['thermo']: ThermoRender,
    ['arrow']: ArrowRender,
    ['sandwich']: null,
    ['min']: MinRender,
    ['max']: MaxRender,
    ['killer']: KillerRender,

    ['diagonal']: null,
    ['knight']: null,
    ['king']: null,
    ['disjointGroups']: null,
    ['consecutive']: null,

    ['select']: SelectRender,
} as const;
