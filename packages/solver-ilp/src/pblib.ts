import PbLib from '../external/pblib-wasm';

export const ready = new Promise(resolve => PbLib['onRuntimeInitialized'] = resolve);

export const encodeAtMostK:  (literals: number[], k: number, formula: number[][], firstAuxiliaryVariable: number) => number = PbLib['encodeAtMostK'];
export const encodeAtLeastK: (literals: number[], k: number, formula: number[][], firstAuxiliaryVariable: number) => number = PbLib['encodeAtLeastK'];
export const encodeLeq:  (weights: number[], literals: number[], leq: number, formula: number[][], firstAuxiliaryVariable: number) => number = PbLib['encodeLeq'];
export const encodeGeq:  (weights: number[], literals: number[], geq: number, formula: number[][], firstAuxiliaryVariable: number) => number = PbLib['encodeGeq'];
export const encodeBoth: (weights: number[], literals: number[], leq: number, geq:number, formula: number[][], firstAuxiliaryVariable: number) => number = PbLib['encodeGeq'];
