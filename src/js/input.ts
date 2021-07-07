import { writable } from 'svelte/store';

export const selectedToolName = 'selectedTool';
export const selectedTool = writable<string>();
(window as any).selectedTool = selectedTool;
