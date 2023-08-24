import { getFileReader } from "../../fileReader/FileReader"

describe('Unit test for file reader', function () {
    it('reads csv file as lines', async () => {
        
        const fileReader = await getFileReader();

        const result = await fileReader.getFileContents("./tests/unit/test.csv");

        expect(result).not.toStrictEqual([]);
        expect(result.length).toBe(2);
        expect(result[0]).toBe("hi,1,no");
        expect(result[1]).toBe("hi,2,yes");
    });

    it('returns empty when file not read', async () => {

        const fileReader = await getFileReader();

        const result = await fileReader.getFileContents("bla bla bla");

        expect(result).toStrictEqual([]);
    });
});