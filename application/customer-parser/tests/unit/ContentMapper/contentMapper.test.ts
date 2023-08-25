import { Customer } from "../../../business-models/Customer";
import { getContentMapper } from "../../../contentMapper/ContentMapper";

describe("Unit test for content mapper", function () {
    it('Content is prepared as expected', async () => {

        const contentMapper = await getContentMapper();

        const testFileContents = getTestFileContents();


        contentMapper.prepareContent(testFileContents);

        const preparedContentResult = contentMapper.preparedContent;
        
        expect(preparedContentResult).not.toEqual([]);
        expect(preparedContentResult.length).toBe(4);
        expect(preparedContentResult).toEqual(getPreparedFileContents());
    });

    it('Content is mapped to objects as expected', async () => {
        const contentMapper = getContentMapper();

        const testFilePreparedContent = getPreparedFileContents();
        contentMapper.preparedContent = testFilePreparedContent;

        contentMapper.mapContentToModels();
        const customersResult = contentMapper.customers;

        expect(customersResult).not.toEqual([]);
        expect(customersResult.length).toBe(2);
        expect(JSON.stringify(customersResult)).toEqual(JSON.stringify(getExpectedModelResult()));
    });
});

function getTestFileContents(): string[] {
    return [
        "sdp_id,customerId,customerName, store_id,store_name,dc_id,dc_name,open_date,close_date,mark_for_exclude,phone,street_name",
        "100,10100,First Awesome toy Customer,1001,Awesome toy Customer Store,,Awesome toy Distribution Name,1962-09-04,9999-12-31,FALSE,4555559988,123 Everything is Awesome Street",
        "100,10100,First Awesome toy Customer,1002,Second Awesome toy Customer Store,0551,Awesome toy Distribution Name,1962-09-04,9999-12-31,FALSE,4555559988,123 Everything is Awesome Street",
        "100,10100,First Awesome toy Customer,1003,Third Awesome toy Customer Store,0551,Awesome toy Distribution Name,1962-09-04,9999-12-31,FALSE,4555559988,123 Everything is Awesome Street",
        "200,10200,Second Awesome toy Customer,2001,Awesome toy Second Customer Store,0551,Awesome toy Distribution Name,1962-09-04,9999-12-31,FALSE,4599339933,13 Lando Calrissian Lane"
    ];
}

function getPreparedFileContents(): string[][] {
    return [
        [
            '100',
            '10100',
            'First Awesome toy Customer',
            '1001',
            'Awesome toy Customer Store',
            '',
            'Awesome toy Distribution Name',
            '1962-09-04',
            '9999-12-31',
            'FALSE',
            '4555559988',
            '123 Everything is Awesome Street'
        ],
        [
            '100',
            '10100',
            'First Awesome toy Customer',
            '1002',
            'Second Awesome toy Customer Store',
            '0551',
            'Awesome toy Distribution Name',
            '1962-09-04',
            '9999-12-31',
            'FALSE',
            '4555559988',
            '123 Everything is Awesome Street'
        ],
        [
            '100',
            '10100',
            'First Awesome toy Customer',
            '1003',
            'Third Awesome toy Customer Store',
            '0551',
            'Awesome toy Distribution Name',
            '1962-09-04',
            '9999-12-31',
            'FALSE',
            '4555559988',
            '123 Everything is Awesome Street'
        ],
        [
            '200',
            '10200',
            'Second Awesome toy Customer',
            '2001',
            'Awesome toy Second Customer Store',
            '0551',
            'Awesome toy Distribution Name',
            '1962-09-04',
            '9999-12-31',
            'FALSE',
            '4599339933',
            '13 Lando Calrissian Lane'
        ]
    ];
}

function getExpectedModelResult(): Customer[] {
    return [
        {
            id: 10100,
            customerName: "First Awesome toy Customer",
            sdpId: 100,
            phoneNumber: "4555559988",
            streetName: "123 Everything is Awesome Street",
            stores: [
                {
                    storeName: "Awesome toy Customer Store",
                    distributionCenterName: "Awesome toy Distribution Name",
                    openDate: new Date("1962-09-04T00:00:00.000Z"),
                    closeDate: new Date("9999-12-31T00:00:00.000Z")
                },
                {
                    storeName: "Second Awesome toy Customer Store",
                    distributionCenterName: "Awesome toy Distribution Name",
                    openDate: new Date("1962-09-04T00:00:00.000Z"),
                    closeDate: new Date("9999-12-31:00:00.000Z")
                },
                {
                    storeName: "Third Awesome toy Customer Store",
                    distributionCenterName: "Awesome toy Distribution Name",
                    openDate: new Date("1962-09-04T00:00:00.000Z"),
                    closeDate: new Date("9999-12-31T00:00:00.000Z")
                }
            ]
        }, {
            id: 10200,
            customerName: "Second Awesome toy Customer",
            sdpId: 200,
            phoneNumber: "4599339933",
            streetName: "13 Lando Calrissian Lane",
            stores: [
                {
                    storeName: "Awesome toy Second Customer Store",
                    distributionCenterName: "Awesome toy Distribution Name",
                    openDate: new Date("1962-09-04T00:00:00.000Z"),
                    closeDate: new Date("9999-12-31T00:00:00.000Z")
                }]
        }
    ];
}