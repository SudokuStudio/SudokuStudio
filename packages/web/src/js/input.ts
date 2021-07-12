import { writable } from 'svelte/store';

export const SELECTED_TOOL_NAME = 'selectedTool';
export const selectedTool = writable<string>();
(window as any).selectedTool = selectedTool;

// Set "Givens" as default selected.
selectedTool.set('10130'); // TODO: magic number.
