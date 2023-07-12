import { bmvbhash } from "blockhash-core";
import { imageFromBuffer, getImageData } from "@canvas/image";
import { Stream } from "stream";

export async function stream2buffer(stream: Stream): Promise<Buffer> {
    return new Promise < Buffer > ((resolve, reject) => {
        const _buf = Array < any > ();
        stream.on("data", chunk => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", err => reject(`error converting stream - ${err}`));
    });
} 

export async function generateHash(buffer: Uint8Array, bits?: number): Promise<string | null> {
    try {
        if (!buffer) {
            throw new Error("Buffer is required.");
        };

        bits = bits || 8;

        if (bits % 4 !== 0) {
            console.error(`Unknown bits length: [${bits}]`);
            return null;
        };

        const imageData = getImageData(await imageFromBuffer(buffer));
        if (!imageData) return null;

        let { width, height, data } = imageData;
        const hexHash = bmvbhash({ width, height, data }, bits);

        return hexHash;
    } catch (error) {
        console.error(error);
        return null;
    };
};
