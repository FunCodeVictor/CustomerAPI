import * as fs from 'fs';
import readline from 'node:readline';

type FileReader = {
    getFileContents(filepath: string): Promise<string[]>;
};

export function getFileReader(): FileReader {
    const fileReader: FileReader = {
        getFileContents: async function (filepath: string) {
            const lines: string[] = [];

            try {
                const fileStream = fs.createReadStream(filepath);
                const rl = readline.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity,
                });

                for await (const line of rl) {
                    lines.push(line);
                }

                return lines;
            }
            catch (e) {
                // add prober error handling, raise alarm on AWS
                console.log(e);
                return lines;
            }
        }
    };

    return fileReader;
}

