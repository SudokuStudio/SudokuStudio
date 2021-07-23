import loadWasm from './cryptominisat5_simple';

export type c_Lit = number; // u32
export const enum lbool { // u8
    TRUE = 0,
    FALSE = 1,
    UNDEF = 2,
}

export type slice_Lit = Uint32Array;
export type slice_lbool = Uint8Array;

export type SATSolverPtr = number;

type RawModule = {
    HEAPU8: Uint8Array,
    HEAPU32: Uint32Array,

    ccall(ident: string, returnType?: null | string, argTypes?: string[], args?: any[]): any,

    _malloc(bytes: number): number,
    _free(offset: number): void,
};
export type Module = RawModule & ReturnType<typeof bind>;

export function load(): Promise<Module> {
    return loadWasm().then((rawModule: RawModule) => {
        const module: Module = Object.assign(rawModule, bind(rawModule));
        return module;
    });
}

function bind(Module: RawModule) {
    return {
        cmsat_new(): SATSolverPtr {
            return Module.ccall('cmsat_new', 'number');
        },
        cmsat_free(self: SATSolverPtr): void {
            return Module.ccall('cmsat_free', null, [ 'number' ], [ self ]);
        },
        cmsat_nvars(self: SATSolverPtr): number {
            return Module.ccall('cmsat_nvars', 'number', [ 'number' ], [ self ]);
        },
        cmsat_add_clause(self: SATSolverPtr, lits: c_Lit[]): boolean {
            if (0 >= lits.length) return false;

            const ptr = Module._malloc(lits.length << 2);
            try {
                Module.HEAPU32.set(lits, ptr >> 2);
                return Module.ccall('cmsat_add_clause', 'number', [ 'number', 'number', 'number' ], [ self, ptr, lits.length ]);
            }
            finally {
                Module._free(ptr);
            }
        },
        cmsat_add_xor_clause(self: SATSolverPtr, lits: c_Lit[], rhs: boolean): boolean {
            if (0 >= lits.length) return false;

            const ptr = Module._malloc(lits.length << 2);
            try {
                Module.HEAPU32.set(lits, ptr >> 2);
                return Module.ccall('cmsat_add_xor_clause', 'number', [ 'number', 'number', 'number', 'boolean' ], [ self, ptr, lits.length, rhs ]);
            }
            finally {
                Module._free(ptr);
            }
        },
        cmsat_new_vars(self: SATSolverPtr, n: number): number {
            return Module.ccall('cmsat_new_vars', 'number', [ 'number', 'number' ], [ self, n ]);
        },
        cmsat_solve(self: SATSolverPtr): lbool {
            return Module.ccall('cmsat_solve', 'number', [ 'number' ], [ self ]);
        },
        cmsat_solve_with_assumptions(self: SATSolverPtr, assumptions: c_Lit[]): lbool {
            if (0 >= assumptions.length) return this.cmsat_solve(self);

            const ptr = Module._malloc(assumptions.length << 2);
            try {
                Module.HEAPU32.set(assumptions, ptr >> 2);
                return Module.ccall('cmsat_solve_with_assumptions', 'number', [ 'number', 'number', 'number' ], [ self, ptr, assumptions.length ]);
            }
            finally {
                Module._free(ptr);
            }
        },
        cmsat_get_model(self: SATSolverPtr): slice_lbool {
            const retPtr = Module._malloc(2 << 2);
            try {
                Module.ccall('cmsat_get_model', null, [ 'number', 'number' ], [ retPtr, self ]);
                const ptr = Module.HEAPU32[(retPtr >> 2)];
                const len = Module.HEAPU32[(retPtr >> 2) + 1] << 0;
                return Module.HEAPU8.subarray(ptr, ptr + len);
            }
            finally {
                Module._free(retPtr);
            }
        },
        cmsat_get_conflict(self: SATSolverPtr): slice_Lit {
            const retPtr = Module._malloc(2 << 2);
            try {
                Module.ccall('cmsat_get_conflict', null, [ 'number', 'number' ], [ retPtr, self ]);
                const ptr = Module.HEAPU32[(retPtr >> 2)];
                const len = Module.HEAPU32[(retPtr >> 2) + 1] << 2;
                return Module.HEAPU32.subarray(ptr, ptr + len);
            }
            finally {
                Module._free(retPtr);
            }
        },
        cmsat_print_stats(self: SATSolverPtr): void {
            return Module.ccall('cmsat_print_stats', null, [ 'number' ], [ self ]);
        },
        cmsat_set_num_threads(self: SATSolverPtr, n: number): void {
            return Module.ccall('cmsat_set_num_threads', null, [ 'number', 'number' ], [ self, n ]);
        },
        cmsat_set_verbosity(self: SATSolverPtr, n: number): void {
            return Module.ccall('cmsat_set_verbosity', null, [ 'number', 'number' ], [ self, n ]);
        },
        cmsat_set_default_polarity(self: SATSolverPtr, polarity: number): void {
            return Module.ccall('cmsat_set_default_polarity', null, [ 'number', 'number' ], [ self, polarity ]);
        },
        cmsat_set_polarity_auto(self: SATSolverPtr): void {
            return Module.ccall('cmsat_set_polarity_auto', null, [ 'number' ], [ self ]);
        },
        cmsat_set_no_simplify(self: SATSolverPtr): void {
            return Module.ccall('cmsat_set_no_simplify', null, [ 'number' ], [ self ]);
        },
        cmsat_set_no_simplify_at_startup(self: SATSolverPtr): void {
            return Module.ccall('cmsat_set_no_simplify_at_startup', null, [ 'number' ], [ self ]);
        },
        cmsat_set_no_equivalent_lit_replacement(self: SATSolverPtr): void {
            return Module.ccall('cmsat_set_no_equivalent_lit_replacement', null, [ 'number' ], [ self ]);
        },
        cmsat_set_no_bva(self: SATSolverPtr): void {
            return Module.ccall('cmsat_set_no_bva', null, [ 'number' ], [ self ]);
        },
        cmsat_set_no_bve(self: SATSolverPtr): void {
            return Module.ccall('cmsat_set_no_bve', null, [ 'number' ], [ self ]);
        },
        cmsat_set_up_for_scalmc(self: SATSolverPtr): void {
            return Module.ccall('cmsat_set_up_for_scalmc', null, [ 'number' ], [ self ]);
        },
        cmsat_set_yes_comphandler(self: SATSolverPtr): void {
            return Module.ccall('cmsat_set_yes_comphandler', null, [ 'number' ], [ self ]);
        },
        cmsat_simplify(self: SATSolverPtr, assumptions: c_Lit[] = []): lbool {
            const ptr = assumptions.length && Module._malloc(assumptions.length << 2);
            try {
                Module.HEAPU32.set(assumptions, ptr >> 2);
                return Module.ccall('cmsat_simplify', 'number', [ 'number', 'number', 'number' ], [ self, ptr, assumptions.length ]);
            }
            finally {
                if (0 !== ptr)
                    Module._free(ptr);
            }
        },
        cmsat_set_max_time(self: SATSolverPtr, max_time: number): void {
            return Module.ccall('cmsat_set_max_time', null, [ 'number', 'number' ], [ self, max_time ]);
        },
    } as const;
}
