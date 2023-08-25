import { Customer } from '../business-models/Customer';
import { Store } from '../business-models/Store';

type ContentMapper = {
    preparedContent: string[][];
    customers: Customer[];
    prepareContent(fileContent: string[]): void;
    mapContentToModels(): void;
};



export function getContentMapper(): ContentMapper {
    const contentMapper: ContentMapper = {
        preparedContent: [],
        customers: [],
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

    for (const preparedContentLine of preparedContent) {
        try {
            const tempCustomerId = preparedContentLine[1];
            if (checkModelShouldBeAdded(tempCustomerId, customerIds)) {
                const tempSdpId: string = preparedContentLine[0];
                const tempCustomerName: string = preparedContentLine[2];
                const tempPhone: string = preparedContentLine[10];
                const tempStreetName: string = preparedContentLine[11];
                
                //first and last line entry has ' " ' in them from csv file.
                const tempSdpIdCleaned: string = tempSdpId.replace('"', ''); 
                const tempStreetNameCleaned: string = tempStreetName.replace('"', '');

                tempCustomers = createCustomer(
                    tempCustomerId,
                    tempSdpIdCleaned,
                    tempCustomerName,
                    tempPhone,
                    tempStreetNameCleaned,
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
    
    //slice because we don't want the headers of the fileContent
    for (const line of fileContent.slice(1)) {
        const splitLine: string[] = line.split(",");
        tempPreparedContent.push(splitLine);
    }

    return tempPreparedContent;
}