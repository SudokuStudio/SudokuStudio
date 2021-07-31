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
declare module 'save-svg-as-png' {
    export type Options = {
        /** Creates a PNG with the given background color. Defaults to transparent. */
        backgroundColor?: string,
        /** If canvg is passed in, it will be used to write svg to canvas. This will allow support for Internet Explorer. */
        canvg?: any,
        /** A Number between 0 and 1 indicating image quality. The default is 0.8 */
        encoderOptions?: number,
        /** A DOMString indicating the image format. The default type is image/png. */
        encoderType?: string,
        /** A list of {text, url, format} objects the specify what fonts to inline in the SVG. Omitting this option defaults to auto-detecting font rules. */
        fonts?: { text: string, url: string, format: string }[],
        /** Specify the image's height. Defaults to the viewbox's height if given, or the element's non-percentage height, or the element's bounding box's height, or the element's CSS height, or the computed style's height, or 0. */
        height?: number,
        /** Specify the viewbox's left position. Defaults to 0. */
        left?: number,
        /** A function that takes a CSS rule's selector and properties and returns a string of CSS. Supercedes selectorRemap and modifyStyle. Useful for modifying properties only for certain CSS selectors. */
        modifyCss?: Function,
        /** A function that takes a CSS rule's properties and returns a string of CSS. Useful for modifying properties before they're inlined into the SVG. */
        modifyStyle?: Function,
        /** Changes the resolution of the output PNG. Defaults to 1, the same dimensions as the source SVG. */
        scale?: number,
        /** A function that takes a CSS selector and produces its replacement in the CSS that's inlined into the SVG. Useful if your SVG style selectors are scoped by ancestor elements in your HTML document. */
        selectorRemap?: Function,
        /** Specify the viewbox's top position. Defaults to 0. */
        top?: number,
        /** Specify the image's width. Defaults to the viewbox's width if given, or the element's non-percentage width, or the element's bounding box's width, or the element's CSS width, or the computed style's width, or 0. */
        width?: number,
        /** Exclude CSS rules that don't match any elements in the SVG. */
        excludeUnusedCss?: boolean,
        /** Exclude all CSS rules. */
        excludeCss?: boolean,
    };

    export function saveSvgAsPng(el: SVGElement, name: string, options: Options = {}): Promise<void>;
}
