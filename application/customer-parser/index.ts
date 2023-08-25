import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getFileReader } from './fileReader/FileReader';
import { getContentMapper } from './contentMapper/ContentMapper';
import { getAPICaller } from './apiCaller/APICaller';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const fileReader = getFileReader();
    
    //customer-store.csv could be stored in AWS S3
    const fileContents = await fileReader.getFileContents("customer-store.csv");

    const contentMapper = getContentMapper();
    contentMapper.prepareContent(fileContents);
    contentMapper.mapContentToModels();

    const apiCaller = getAPICaller();
    await apiCaller.setCustomersToBeAdded(contentMapper.customers);
    const apiResult = await apiCaller.createCustomers();

    
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Read [${contentMapper.customers.length}] customers stores from csv. 
                      Succesful customer Ids sent to api [${apiResult.customerSuccesNames.length}]
                      Succesful store Ids sent to api [${apiResult.storeSuccesNames.length}]
                      Customer names: [${apiResult.customerSuccesNames.join(", ")}]
                      Store names: [${apiResult.storeSuccesNames.join(", ")}]
                      `,
        }),
    };
};