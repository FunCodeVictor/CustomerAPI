const util = require('util');
import { AllCustomersId } from "../business-models/AllCustomersId";
import { ApiResult } from "../business-models/ApiResult";
import { Customer } from "../business-models/Customer";
import { Store } from "../business-models/Store";

type APICaller = {
    cutomersToBeAdded: Customer[],
    setCustomersToBeAdded(customers: Customer[]): Promise<void>;
    createCustomers(): Promise<ApiResult>;
};

export function getAPICaller(): APICaller {
    const apiCaller: APICaller = {
        cutomersToBeAdded: [],
        setCustomersToBeAdded: async function (customers: Customer[]): Promise<void> {
            this.cutomersToBeAdded = await getCustomersToBeAdded(customers);
        },
        createCustomers: async function (): Promise<ApiResult> {
            return await callGraphQLCreateCustomers(this.cutomersToBeAdded);
        }
    };
    return apiCaller;
};

async function callGraphQLCreateCustomers(cleanedCustomers: Customer[]): Promise<ApiResult> {
    const apiResult: ApiResult = {
        customerSuccesNames: [],
        storeSuccesNames: [],
    };
    for (const customer of cleanedCustomers) {
        try {
            const data = customerToFetchData(customer);

            const url = 'http://customer-app:4000/';
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: 'mutation CreateCustomer($data: CustomerCreateInput!) {\n  createCustomer(data: $data) {\n    streetName\n    stores {\n      storeName\n    }\n  }\n }\n',
                    variables: {
                        data
                    },
                })
            };
            const request = new Request(url, options);

            const response = await fetch(request);

            if (response.ok) {
                apiResult.customerSuccesNames.push(customer.customerName);
                for (const store of customer.stores) {
                    apiResult.storeSuccesNames.push(store.storeName);
                }
            } else {
                console.log(`Response NOT OK in callGraphQLCreateCustomers(). Customer id [${customer.id}]`);
            }
        }
        catch (e) {
            // TODO: add prober error handling, raise alarm on AWS
            console.log(e);
        }
    }

    return apiResult;
}


function customerToFetchData(customer: Customer) {
    return {
        id: customer.id,
        sdpId: customer.sdpId,
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        streetName: customer.streetName,
        stores: customer.stores.map(store => {
            return {
                storeName: store.storeName,
                distributionCenterName: store.distributionCenterName,
                openDate: store.openDate,
                closeDate: store.closeDate,
                customerId: customer.id
            };
        })
    };
}

async function getCustomersToBeAdded(customers: Customer[]): Promise<Customer[]> {

    const existingCustomerIds: AllCustomersId[] = await getExistingCustomerIds();

    return removeAlreadyExistingEntities(customers, existingCustomerIds);
}

function removeAlreadyExistingEntities(customers: Customer[], existingCustomerIds: AllCustomersId[]): Customer[] {
    const cleanedCustomers: Customer[] = [];
    const customerIdsToRemove: number[] = [];

    //TODO: improve implementation running time!!
    for (const customer of customers) {
        for (const existingCustomerId of existingCustomerIds) {
            if (customer.id === existingCustomerId.customerId) {
                //TODO: Should implement a way where we add stores to the customer if not existing.
                customerIdsToRemove.push(customer.id);
                break;
            }
        }
    }

    for (const customer of customers) {
        if (!customerIdsToRemove.includes(customer.id)) {
            cleanedCustomers.push(customer);
        }
    }

    console.log(`Set to add [${customers.length}] customers`);
    console.log(`Removed [${customers.length - cleanedCustomers.length}] customers as they already existed`);
    return cleanedCustomers;
}

async function getExistingCustomerIds(): Promise<AllCustomersId[]> {
    const url = 'http://customer-app:4000/';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: 'query AllCustomers {\n  allCustomers {\n    id\n    stores {\n      id\n    }\n  }\n}',
            variables: {},
        })
    };
    const request = new Request(url, options);

    const response = await fetch(request);

    if (response.ok) {
        const allCustomersIds: AllCustomersId[] = [];
        await response.json()
            .then(function (json) {
                for (const customerApiResult of json.data.allCustomers) {

                    const storeIds = Array.isArray(customerApiResult.stores) ?
                        customerApiResult.stores.map((store: { id: any; }) => {
                            return +store.id;
                        }) :
                        [];

                    const allCustomerIds: AllCustomersId = {
                        customerId: typeof customerApiResult.id === "string" ? +customerApiResult.id : 0,
                        storeIds: storeIds
                    };

                    allCustomersIds.push(allCustomerIds);
                }
            });

        return allCustomersIds;
    } else {
        console.log(`Response NOT OK in getExistingCustomerIds()`);
        return [];
    }
}