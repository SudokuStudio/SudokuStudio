import { writable } from 'svelte/store';

export const selectedTool = writable<string>();
(window as any).selectedTool = selectedTool;
