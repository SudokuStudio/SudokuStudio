import CryptoMiniSat from '../external/cryptominisat_web/cryptominisat5_simple';

export const load = new Promise<void>(resolve => CryptoMiniSat['onRuntimeInitialized'] = resolve);

export const solve: (cnf: string) => number = CryptoMiniSat.cwrap('cstart_solve', 'number', ['string']);
export const resume: () => number = CryptoMiniSat.cwrap('ccontinue_solve', 'number');
