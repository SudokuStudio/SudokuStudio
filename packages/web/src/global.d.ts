/// <reference types="svelte" />
declare module '*.md' {
    export default string;
}
declare module 'web-worker:*' {
    const WorkerFactory: new () => Worker;
    export default WorkerFactory;
}
