import _ from "lodash";
import sleep from "sleep-promise";
import AWS from "aws-sdk";

var documentClient;

function init(config) {
  if (config.profile) {
    var credentials = new AWS.SharedIniFileCredentials({
      profile: config.profile,
    });
    AWS.config.credentials = credentials;
  }
  documentClient = new AWS.DynamoDB.DocumentClient({
    region: "us-east-1",
  });
}

async function extractFromDynamoDB(table) {
  let params = {
    TableName: table,
  };
  let fullResult = [];
  let lastEvaluatedKey = null;
  do {
    console.log("Scanning Dynamo");
    let queryParams = _.clone(params);
    if (lastEvaluatedKey) {
      queryParams.ExclusiveStartKey = lastEvaluatedKey;
    }
    let result = await documentClient.scan(queryParams).promise();
    if (result) {
      fullResult.push(result);
    }
    console.log("Result size " + result.Items.length);
    console.log(
      "Result LastEvaluatedKey " + JSON.stringify(result.LastEvaluatedKey)
    );
    if (typeof result.LastEvaluatedKey != "undefined") {
      lastEvaluatedKey = result.LastEvaluatedKey;
    } else {
      console.log("Setting lastEvaluatedKey to null");
      lastEvaluatedKey = null;
    }
  } while (lastEvaluatedKey !== null);
  return fullResult;
}

async function writeToDynamoDB(chunkedPutRequests, table, dryrun) {
  let unprocessed = [];
  let results = [];

  for (let i = 0; i < chunkedPutRequests.length; i++) {
    console.log(`Writing Batch ${i}`);
    let batchResult = await writeBatchToDynamoDB(
      chunkedPutRequests[i],
      table,
      dryrun
    );
    console.log("Result", JSON.stringify(batchResult, 0, 4));
    results.push(batchResult);
    if (
      batchResult &&
      batchResult.UnprocessedItems &&
      batchResult.UnprocessedItems[table]
    ) {
      unprocessed = unprocessed.concat(batchResult.UnprocessedItems[table]);
    }
    await sleep(1100); // if we chunk in writeCapacity groups, then we can send one group per second --- but leave a little buffer
  }
  console.log("UnprocessedItems total was", unprocessed.length);
  return results;
}

async function writeBatchToDynamoDB(putRequests, table, dryrun) {
  let params = {
    RequestItems: {},
  };
  params.RequestItems[table] = putRequests;
  if (dryrun) {
    let paramsToSend = JSON.stringify(params);
    console.log(
      "Would have put to DynamoDB",
      paramsToSend,
      paramsToSend.length
    );
    return Promise.resolve(true);
  } else {
    return await documentClient.batchWrite(params).promise();
  }
}

const _init = init;
export { _init as init };
const _extractFromDynamoDB = extractFromDynamoDB;
export { _extractFromDynamoDB as extractFromDynamoDB };
const _writeToDynamoDB = writeToDynamoDB;
export { _writeToDynamoDB as writeToDynamoDB };
