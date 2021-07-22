import CryptoMiniSatLoader from '../external/cryptominisat_web/cryptominisat5_simple';

export type Module = {
    start_solve: (cnf: string) => number,
    continue_solve: () => number,
    get_num_conflicts: () => number,
};

export const loadCms: Promise<Module> = CryptoMiniSatLoader();
