import { schema } from "@sudoku-studio/schema";
import * as LZMA from "./lzma_worker";
import * as Base64 from "base64-js";

function wordCeil(offset: number): number {
    return 4 * Math.ceil(offset / 4);
}

const utf8encoder = new TextEncoder();
const utf8decoder = new TextDecoder();

export class ReaderWriter {
    dataView: DataView;
    offset: number;

    constructor(initialByteLength?: number);
    constructor(arrayBufferView: ArrayBufferView);
    constructor(arg: number | ArrayBufferView = 1024) {
        if ('number' === typeof arg) {
            this.dataView = new DataView(new ArrayBuffer(arg));
        }
        else {
            this.dataView = new DataView(arg.buffer, arg.byteOffset, arg.byteLength);
        }
        this.offset = 0;
    }

    private _alloc(newBytes: number): void {
        if (this.dataView.byteLength < this.offset + newBytes) {
            const arrBuf = new ArrayBuffer(2 * this.dataView.byteLength);
            (new Uint8Array(arrBuf)).set(new Uint8Array(this.dataView.buffer));
            this.dataView = new DataView(arrBuf);
        }
    }

    atEnd(): boolean {
        return this.offset === this.dataView.byteLength;
    }

    readUint8(): number {
        const val = this.dataView.getUint8(this.offset);
        this.offset += 1;
        return val;
    }
    writeUint8(val: number): void {
        this._alloc(1);
        this.dataView.setUint8(this.offset, val);
        this.offset += 1;
    }

    readUint16(): number {
        const val = this.dataView.getUint16(this.offset, false);
        this.offset += 2;
        return val;
    }
    writeUint16(val: number): void {
        this._alloc(2);
        this.dataView.setUint16(this.offset, val, false);
        this.offset += 2;
    }

    readUint32(): number {
        const val = this.dataView.getUint32(this.offset, false);
        this.offset += 4;
        return val;
    }
    writeUint32(val: number): void {
        this._alloc(4);
        this.dataView.setUint32(this.offset, val, false);
        this.offset += 4;
    }

    readLengthPrefixedUtf8String(): string {
        const byteLength = this.readUint32();
        const val = utf8decoder.decode(new Uint8Array(this.dataView.buffer, this.offset, byteLength));
        this.offset += wordCeil(byteLength);
        return val;
    }
    writeLengthPrefixedUtf8String(val: string): void {
        const bytes = utf8encoder.encode(val);
        this.writeUint32(bytes.length);

        this._alloc(wordCeil(bytes.length));
        (new Uint8Array(this.dataView.buffer)).set(bytes, this.offset);
        this.offset += wordCeil(bytes.length);
    }

    asUint8Array(): Uint8Array {
        return new Uint8Array(this.dataView.buffer, 0, this.offset);
    }
}

function hash(str: string): number {
    return (str.match(/.{1,4}/g) || []).reduce((hash, quad) => {
        hash *= 31;
        hash += (quad.charCodeAt(0) || 0) << 18;
        hash += (quad.charCodeAt(1) || 0) << 16;
        hash += (quad.charCodeAt(2) || 0) <<  8;
        hash += (quad.charCodeAt(3) || 0);
        return 0 | hash; // Truncate to int32.
    }, 0);
}

export type ElementSerde<T extends schema.Element> = {
    type: string,
    currentVersion: number,
    serialize(writer: ReaderWriter, value: T['value']): void,
    deserialize(reader: ReaderWriter, version: number): T['value'],
}

function makeJsonSerde<T extends schema.Element>(type: T['type'], currentVersion: number) {
    return {
        type, currentVersion,
        serialize(writer: ReaderWriter, value: T['value']): void {
            writer.writeLengthPrefixedUtf8String(JSON.stringify(value));
        },
        deserialize(reader: ReaderWriter, version: number): T['value'] {
            if (currentVersion !== version) throw Error(`JsonSerde cannot handle different version: expected ${currentVersion}, received ${version}.`);
            return JSON.parse(reader.readLengthPrefixedUtf8String());
        },
    } as const;
}

const ELEMENT_SERDES = [
    {
        type: 'grid',
        currentVersion: 1,
        serialize(writer: ReaderWriter, _value: schema.NullElement): void {
            writer.writeUint16(1);
        },
        deserialize(_reader: ReaderWriter, _version: number): null {
            return null;
        },
    },
    makeJsonSerde<schema.BoxElement>('box', 1),

    makeJsonSerde<schema.DigitElement>('givens', 1),
    makeJsonSerde<schema.DigitElement>('filled', 1),
    makeJsonSerde<schema.PencilMarksElement>('center', 1),
    makeJsonSerde<schema.PencilMarksElement>('corner', 1),
    makeJsonSerde<schema.ColorsElement>('colors', 1),

    makeJsonSerde<schema.LineElement>('thermo', 1),
    makeJsonSerde<schema.LineElement>('slowThermo', 1),
    makeJsonSerde<schema.LineElement>('between', 1),
    makeJsonSerde<schema.LineElement>('palindrome', 1),
    makeJsonSerde<schema.LineElement>('whisper', 1),
    makeJsonSerde<schema.LineElement>('renban', 1),
    makeJsonSerde<schema.ArrowElement>('arrow', 1),

    makeJsonSerde<schema.RegionElement>('min', 1),
    makeJsonSerde<schema.RegionElement>('max', 1),
    makeJsonSerde<schema.RegionElement>('odd', 1),
    makeJsonSerde<schema.RegionElement>('even', 1),

    makeJsonSerde<schema.QuadrupleElement>('quadruple', 1),
    makeJsonSerde<schema.KillerElement>('killer', 1),
    makeJsonSerde<schema.CloneElement>('clone', 1),

    makeJsonSerde<schema.EdgeNumberElement>('difference', 1),
    makeJsonSerde<schema.EdgeNumberElement>('ratio', 1),
    makeJsonSerde<schema.EdgeNumberElement>('xv', 1),

    makeJsonSerde<schema.LittleKillerElement>('littleKiller', 1),
    makeJsonSerde<schema.SeriesNumberElement>('sandwich', 1),
    makeJsonSerde<schema.SeriesNumberElement>('skyscraper', 1),
    makeJsonSerde<schema.SeriesNumberElement>('xsum', 1),

    makeJsonSerde<schema.BooleanElement>('knight', 1),
    makeJsonSerde<schema.BooleanElement>('king', 1),
    makeJsonSerde<schema.BooleanElement>('disjointGroups', 1),
    makeJsonSerde<schema.BooleanElement>('selfTaxicab', 1),

    makeJsonSerde<schema.DiagonalElement>('diagonal', 1),
    makeJsonSerde<schema.ConsecutiveElement>('consecutive', 1),
] as const;

// @ts-ignore
function __assertAreElementSerdes<T extends ElementSerde<any>>(): void {
    __assertAreElementSerdes<(typeof ELEMENT_SERDES)[Extract<keyof typeof ELEMENT_SERDES, number>]>();
};

const MAGIC_SDSK = 0x5344530a; // 'SDS\n'
const MAGIC_META = 0x4D455441; // 'META'

export function writeBuffer(board: schema.Board): Uint8Array {
    const writer = new ReaderWriter();

    writer.writeUint32(MAGIC_SDSK) // MAGIC HEADER
    writer.writeUint32(1);    // VERSION

    const { width, height } = board.grid;
    writer.writeUint8(height);
    writer.writeUint8(width);
    writer.writeUint8(0); // RESERVED
    writer.writeUint8(0); // RESERVED

    writer.writeUint32(0); // RESERVED
    writer.writeUint32(0); // RESERVED
    writer.writeUint32(0); // RESERVED

    for (const element of Object.values(board.elements)) {
        const elementSerde: undefined | ElementSerde<any> = ELEMENT_SERDES.find(serde => element.type === serde.type);
        if (null == elementSerde) {
            throw Error(`Cannot serialize element of type ${JSON.stringify(element.type)}.`);
        }
        else {
            writer.writeUint32(hash(element.type));
            writer.writeUint16(0x0000); // No flags.
            writer.writeUint16(elementSerde.currentVersion);
            elementSerde.serialize(writer, element.value);
        }
    }

    if (board.meta) {
        writer.writeUint32(MAGIC_META);
        writer.writeLengthPrefixedUtf8String(JSON.stringify(board.meta));
    }

    return writer.asUint8Array();
}

export function readBuffer(bin: ArrayBufferView): schema.Board {
    const board: schema.Board = {
        grid: {
            width: 0,
            height: 0,
        },
        elements: {},
        meta: undefined,
    };

    const reader = new ReaderWriter(bin);
    if (MAGIC_SDSK !== reader.readUint32()) throw Error('Invalid SDSK_MAGIC');
    board.grid.height = reader.readUint8();
    board.grid.width  = reader.readUint8();
    reader.readUint8();
    reader.readUint8();

    reader.readUint32();
    reader.readUint32();
    reader.readUint32();

    let elemIdCounter = 0;
    while (!reader.atEnd()) {
        const elemMagic = reader.readUint32();
        if (MAGIC_META === elemMagic) {
            board.meta = JSON.parse(reader.readLengthPrefixedUtf8String());
            continue;
        }
        const elementSerde: undefined | ElementSerde<any> = ELEMENT_SERDES.find(serde => elemMagic === hash(serde.type));
        if (null == elementSerde) {
            throw Error(`Unknown element with magic 0x${elemMagic.toString(16).padStart(8, '0')}.`);
        }
        // @ts-ignore
        const _flags = reader.readUint16();
        const version = reader.readUint16();
        board.elements[++elemIdCounter] = elementSerde.deserialize(reader, version);
    }

    return board;
}

export async function writeLzmaBase64(board: schema.Board): Promise<string> {
    const buffer = writeBuffer(board);
    const compressed = await new Promise<Uint8Array>((resolve, reject) => LZMA.compress(buffer, 9, (result, error) => error ? reject(error) : resolve(result)));
    const b64 = Base64.fromByteArray(compressed);
    return b64;
}

export async function readLzmaBase64(b64: string): Promise<schema.Board> {
    const compressed = Base64.toByteArray(b64);
    const buffer = await new Promise<Uint8Array>((resolve, reject) => LZMA.decompress(compressed, (result, error) => error ? reject(error) : resolve(result)));
    const board = readBuffer(buffer);
    return board;
}
