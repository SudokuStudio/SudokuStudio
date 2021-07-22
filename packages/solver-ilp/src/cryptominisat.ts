import CryptoMiniSat from '../external/cryptominisat_web/cryptominisat5_simple';

export type CryptoMiniSatModule = {
    solve(cnf: string): number,
    resume(): number,
};

export const load = new Promise<CryptoMiniSatModule>(resolve => CryptoMiniSat['onRuntimeInitialized'] = () => {
    console.log(CryptoMiniSat);
    resolve({
        solve: CryptoMiniSat.cwrap('cstart_solve', 'number', ['string']),
        resume: CryptoMiniSat.cwrap('ccontinue_solve', 'number'),
    });
});
