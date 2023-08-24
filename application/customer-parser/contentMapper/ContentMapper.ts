import { Customer } from '../api-models/Customer';
import { Store } from '../api-models/Store';

type ContentMapper = {
    preparedContent: string[][];
    customers: Customer[];
    storeCount: number;
    prepareContent(fileContent: string[]): void;
    mapContentToModels(): void;
};



export function getContentMapper(): ContentMapper {
    const contentMapper: ContentMapper = {
        preparedContent: [],
        customers: [],
        storeCount: 0,
        prepareContent: function prepareContent(fileContent: string[]) {
            this.preparedContent = fileContentSplitLines(fileContent);
        },
        mapContentToModels: function mapContentToModels() {
            this.customers = preparedContentToCustomerModels(this.preparedContent);
        },
    };

    return contentMapper;
}

function preparedContentToCustomerModels(preparedContent: string[][]): Customer[] {
    var tempCustomers: Customer[] = [];
    const customerIds: string[] = [];
    const storeIds: string[] = [];

    for (const preparedContentLine in preparedContent) {
        try {
            const tempCustomerId = preparedContentLine[1];
            if (checkModelShouldBeAdded(tempCustomerId, customerIds)) {
                const tempSdpId: string = preparedContentLine[0];
                const tempCustomerName: string = preparedContentLine[2];
                const tempPhone: string = preparedContentLine[10];
                const tempStreetName: string = preparedContentLine[11];

                tempCustomers = createCustomer(
                    tempCustomerId,
                    tempSdpId,
                    tempCustomerName,
                    tempPhone,
                    tempStreetName,
                    tempCustomers
                );

                customerIds.push(tempCustomerId);
            }

            const tempStoreId = preparedContentLine[3];
            if (checkModelShouldBeAdded(tempStoreId, storeIds)) {
                const tempStoreName: string = preparedContentLine[4];
                const tempDistributionCenterName: string = preparedContentLine[6];
                const tempOpenDate: string = preparedContentLine[7];
                const tempCloseDate: string = preparedContentLine[8];

                const relatedCustomer = tempCustomers.find(customer => customer.id === +tempCustomerId);

                if (typeof relatedCustomer === undefined) {
                    console.log("WARNING: Customer not created before this line, something went wrong. StoreID: " + tempStoreId + " and CustomerID: " + tempCustomerId);
                    break;
                }

                const tempStore: Store = {
                    storeName: tempStoreName,
                    distributionCenterName: tempDistributionCenterName,
                    openDate: tempOpenDate ? new Date(tempOpenDate) : null,
                    closeDate: tempCloseDate ? new Date(tempCloseDate) : null
                };

                relatedCustomer!.stores.push(tempStore);
                this.storeCount++;
                storeIds.push(tempStoreId);
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    return tempCustomers;
}

function createCustomer(
    tempCustomerId: string,
    tempSdpId: string,
    tempCustomerName: string,
    tempPhone: string,
    tempStreetName: string,
    tempCustomers: Customer[]
): Customer[] {
    const tempCustomer: Customer = {
        id: +tempCustomerId,
        customerName: tempCustomerName,
        sdpId: +tempSdpId,
        phoneNumber: tempPhone,
        streetName: tempStreetName,
        stores: []
    };
    tempCustomers.push(tempCustomer);

    return tempCustomers;
}

function checkModelShouldBeAdded(id: string, addedIds: string[]): boolean {
    if (id !== undefined && !addedIds.includes(id)) {
        return true;
    }

    return false;
}


function fileContentSplitLines(fileContent: string[]) {
    const tempPreparedContent: string[][] = [];

    for (const line in fileContent) {
        const splitLine: string[] = line.split(",");
        tempPreparedContent.push(splitLine);
    }

    return tempPreparedContent;
}