import CryptoMiniSatLoader from '../external/cryptominisat_web/cryptominisat5_simple';


export type Module = {
    solve: (cnf: string) => number,
    resume: () => number,
};


export const loadCms: Promise<Module> = CryptoMiniSatLoader()
    .then((Module: any) => {
        return {
            solve: Module.cwrap('cstart_solve', 'number', ['string']),
            resume: Module.cwrap('ccontinue_solve', 'number'),
        };
    });
