import PbLibLoader from '../external/pblib-wasm';

export type Module = {
    encodeAtMostK(literals: number[], k: number, formula: number[][], firstAuxiliaryVariable: number): number;
    encodeAtLeastK(literals: number[], k: number, formula: number[][], firstAuxiliaryVariable: number): number;
    encodeLeq(weights: number[], literals: number[], leq: number, formula: number[][], firstAuxiliaryVariable: number): number;
    encodeGeq(weights: number[], literals: number[], geq: number, formula: number[][], firstAuxiliaryVariable: number): number;
    encodeBoth(weights: number[], literals: number[], leq: number, geq:number, formula: number[][], firstAuxiliaryVariable: number): number;
};

export const loadPbLib: Promise<Module> = PbLibLoader();
