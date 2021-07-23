/// <reference types="svelte" />
declare module '*.md' {
    export default string;
}
declare module 'web-worker:*' {
    const WorkerFactory: new () => Worker;
    export default WorkerFactory;
}
declare const __replace: {
    SUDOKU_STUDIO_VERSION: string;
    WORKER_SATSOLVER_SCRIPT: string;
};
