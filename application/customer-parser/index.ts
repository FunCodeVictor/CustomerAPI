import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { getFileReader } from './fileReader/FileReader';
import { getContentMapper } from './contentMapper/ContentMapper';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const fileReader = getFileReader();
    
    //customer-store.csv could be stored in AWS S3
    const fileContents = await fileReader.getFileContents("customer-store.csv");

    const contentMapper = getContentMapper();
    contentMapper.prepareContent(fileContents);
    contentMapper.mapContentToModels();


    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Read [${contentMapper.customers.length}] customers and [${contentMapper.storeCount}] stores from csv`,
        }),
    };
};