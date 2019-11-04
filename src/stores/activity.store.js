const jsonCircular = require('circular-json');
const fs = require('fs');
const path = require('path');
const RestUtil = require('../utils/rest');
const SoapUtil = require('../utils/soap');
const log = require('../utils/logger');

let customerSegmentationXML;
fs.readFile(`${path.join(__dirname, '../templates')}/NBA_PolicyHolder_Template`, 'utf8', async (err, data) => {
  if (err) {
    log.logger.error(`Error when reading file: ${err}`);
  }
  customerSegmentationXML = data;
});

const connectionErrorMessage = [];

const getDataXMLJD = async (decoded, token) => {
  if (!customerSegmentationXML) {
    throw new Error('Error getDataXMLJD : Unable to find xml template');
  }
  let xml;
  xml = customerSegmentationXML;
  xml = xml.replace('[token]', token);
  xml = xml.replace('[accountId]', decoded.accountId);
  const soapRequest = {
    url: `${process.env.SOAP_BASE_URI}Service.asmx`,
    soapAction: 'Retrieve',
    body: xml
  };
  const soapRespBody = await SoapUtil.post(soapRequest);
  const property = soapRespBody.RetrieveResponseMsg.Results;
  const accountDeMapping = new Map();
  if (property === undefined) {
    log.logger.info('Soap Request Property Undefined');
  }
  else {
    // check property is existing in the response
    const properties = soapRespBody.RetrieveResponseMsg.Results.Properties.Property;
    for (let i = 0; i < properties.length; i += 1) {
      accountDeMapping.set(properties[i].Name, properties[i].Value);
    }
  }
  return accountDeMapping;
};

const requestGetProductInformationJD = async (accountDeMapping, decodedArgs, token) => {
  var bodyStringRequest = {
    decisionId: decodedArgs.decisionId,
    platform: process.env.PLATFORM,
    audienceList: [{
      customerId: decodedArgs.clientId,
      microSegment: decodedArgs.microSegment,
      isOngoing: accountDeMapping.get('NBA_Ongoing_Interaction__c'),
      crmId: decodedArgs.crmId
    }
    ],
    campaign: {
      campaignId: decodedArgs.campaignId,
      campaignName: decodedArgs.campaignName,
      campaignType: decodedArgs.campaignType,
      campaignProductType: [
        decodedArgs.campaignProductType
      ],
      overrideContactFramwork: decodedArgs.overrideFramework
    }
  };

  var header = {
    'Content-Type': 'application/json',
    'Content-Length': bodyStringRequest.length
  };

  var mcRequest = {
    body: bodyStringRequest,
    headers: header,
    url: process.env.WS_URL

  };
  try {
    const { response, body } = await RestUtil.post(mcRequest);
    if (body) {
      const jsonValue = JSON.parse(body);
      if (jsonValue.status !== 'OK') {
        log.logger.info(`connectionErrorMessage - > ${body}`);
        connectionErrorMessage[0] = `${jsonValue.status}-${jsonValue.message}`;
      }
    }
    return body;
  }
  catch (exception) {
    throw new Error(exception);
  }
};

const prepareUpsertedDataValue = (upsertedData, jsonValue) => {
  upsertedData.koStatusValue = jsonValue.koStatus;
  upsertedData.statusValue = jsonValue.status;
  upsertedData.messageValue = jsonValue.message;
  upsertedData.channelMismatchValue = jsonValue.koReason.channelMismatch;
  upsertedData.corporateClientsValue = jsonValue.koReason.corporateClients;
  upsertedData.underTrustValue = jsonValue.koReason.underTrust;
  upsertedData.servicedByValue = jsonValue.koReason.servicedBy;
  upsertedData.customerStatusValue = jsonValue.koReason.customerStatus;
  upsertedData.agentStatusValue = jsonValue.koReason.agentStatus;
  upsertedData.controlGroupValue = jsonValue.koReason.controlGroup;
  upsertedData.underBankruptcyValue = jsonValue.koReason.underBankruptcy;
  upsertedData.foreignAddressValue = jsonValue.koReason.foreignAddress;
  upsertedData.foreignMobileNumberValue = jsonValue.koReason.foreignMobileNumber;
  upsertedData.phladeceasedValue = jsonValue.koReason.phladeceased;
  upsertedData.claimStatusValue = jsonValue.koReason.claimStatus;
  upsertedData.claimTypeValue = jsonValue.koReason.claimType;
  upsertedData.subClaimTypeValue = jsonValue.koReason.subClaimType;
  upsertedData.failedTotalSumAssuredTestValue = jsonValue.koReason.failedTotalSumAssuredTest;
  upsertedData.exclusionCodeImposedValue = jsonValue.koReason.exclusionCodeImposed;
  upsertedData.extraMoralityValue = jsonValue.koReason.extraMorality;
  upsertedData.isSubstandardValue = jsonValue.koReason.isSubstandard;
  upsertedData.amlwatchListValue = jsonValue.koReason.amlwatchList;
  upsertedData.underwritingKOsValue = jsonValue.koReason.underwritingKOs;
  upsertedData.existingProductsKOsValue = jsonValue.koReason.existingProductsKOs;
  upsertedData.salesPersonKOsValue = jsonValue.koReason.salesPersonKOs;
};

const setUpsertDataValue = (upsertedData, decodedArgs) => JSON.stringify([
  {
    keys: {
      PK: `${decodedArgs.decisionId}-${decodedArgs.journeyStepCode}`,
      CampaignAudienceId: decodedArgs.decisionId
    },
    values: {
      customerId: decodedArgs.clientId,
      PersonContactId: decodedArgs.contactId,
      CampaignId: decodedArgs.campaignId,
      journeyStepCode: decodedArgs.journeyStepCode,
      Product1Name: upsertedData.newProduct1,
      Product1Code: upsertedData.newProduct1Code,
      Product1Type: upsertedData.newProduct1Type,
      Product2Name: upsertedData.newProduct2,
      Product2Code: upsertedData.newProduct2Code,
      Product2Type: upsertedData.newProduct2Type,
      koStatus: upsertedData.koStatusValue,
      Status: upsertedData.statusValue,
      Message: upsertedData.messageValue,
      channelMismatch: upsertedData.channelMismatchValue,
      corporateClients: upsertedData.corporateClientsValue,
      underTrust: upsertedData.underTrustValue,
      servicedBy: upsertedData.servicedByValue,
      customerStatus: upsertedData.customerStatusValue,
      agentStatus: upsertedData.agentStatusValue,
      controlGroup: upsertedData.controlGroupValue,
      underBankruptcy: upsertedData.underBankruptcyValue,
      foreignAddress: upsertedData.foreignAddressValue,
      foreignMobileNumber: upsertedData.foreignMobileNumberValue,
      phladeceased: upsertedData.phladeceasedValue,
      claimStatus: upsertedData.claimStatusValue,
      claimType: upsertedData.claimTypeValue,
      subClaimType: upsertedData.subClaimTypeValue,
      failedTotalSumAssuredTest: upsertedData.failedTotalSumAssuredTestValue,
      exclusionCodeImposed: upsertedData.exclusionCodeImposedValue,
      extraMorality: upsertedData.extraMoralityValue,
      isSubstandard: upsertedData.isSubstandardValue,
      amlwatchList: upsertedData.amlwatchListValue,
      underwritingKOs: upsertedData.underwritingKOsValue,
      existingProductsKOs: upsertedData.existingProductsKOsValue,
      salesPersonKOs: upsertedData.salesPersonKOsValue
    }
  }
]);

const updateDataExtensionDE = async (body, token, decodedArgs) => {
  const upsertedData = {};
  if (connectionErrorMessage.length > 0) {
    upsertedData.statusValue = process.env.ERROR;
    for (let i = 0; i < connectionErrorMessage.length; i += 1) {
      if (connectionErrorMessage[i] !== undefined) {
        upsertedData.messageValue = connectionErrorMessage[i];
      }
      log.logger.info(`MESSAGE VALUE - > ${messageValue}`);
    }
  }
  else if (connectionErrorMessage.length === 0) {
    const jsonValue = JSON.parse(body);
    await prepareUpsertedDataValue();

    if (jsonValue.offerProducts.length === 0 && jsonValue.koStatus === process.env.KO_STATUS_NO) {
      upsertedData.koStatusValue = process.env.KO_STATUS_YES;
    }
    else if (jsonValue.koStatus === process.env.KO_STATUS_YES
      && jsonValue.offerProducts.length !== 0) {
      upsertedData.koStatusValue = process.env.KO_STATUS_NO;
    }

    if (upsertedData.koStatusValue === process.env.KO_STATUS_NO
      && jsonValue.offerProducts.length !== 0) {
      log.logger.info(`offer Products${jsonValue.offerProducts}`);
      const offerProductsSorted = jsonValue.offerProducts.slice(0);
      offerProductsSorted.sort((a, b) => a.productRank - b.productRank);
      for (let i = 0; i < offerProductsSorted.length; i += 1) {
        if (i === 0) {
          upsertedData.newProduct1 = offerProductsSorted[i].productName;
          upsertedData.newProduct1Code = offerProductsSorted[i].productCode;
          upsertedData.newProduct1Type = offerProductsSorted[i].componentCode;
        }
        else if (i === 1) {
          upsertedData.newProduct2 = offerProductsSorted[i].productName;
          upsertedData.newProduct2Code = offerProductsSorted[i].productCode;
          upsertedData.newProduct2Type = offerProductsSorted[i].componentCode;
        }
      }
    }
  }

  const bodyStringInsertRowDE = await setUpsertDataValue(upsertedData, decodedArgs);
  const headerInsertDE = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
  const optionRequestInsertDE = {
    body: bodyStringInsertRowDE,
    headers: headerInsertDE,
    url: `${process.env.REST_BASE_URI}hub/v1/dataevents/key:${process.env.DATA_EXTENSION_KEY}/rowset`
  };
  log.logger.info(`KO Result Request=>${JSON.stringify(upsertDERequest)}`);
  log.logger.info(`KO Result Req Body=>${JSON.stringify(bodyStringInsertRowDE)}`);
  try {
    const { insertDEResponse, insertDEBody } = await RestUtil.post(optionRequestInsertDE);
    return insertDEBody;
  }
  catch (exception) {
    throw new Error(exception);
  }
};

class ActivityStore {
  static async save(req) {
    try {
      const payload = `Save===>${jsonCircular.stringify(req)}`;
      return payload;
    }
    catch (exception) {
      log.logger.error(`ActivityStore save error: ${exception}`);
      throw exception;
    }
  }

  static async publish(req) {
    try {
      const payload = 'Publish===>';
      return payload;
    }
    catch (exception) {
      log.logger.error(`ActivityStore publish error: ${exception}`);
      throw exception;
    }
  }

  static async validate(req) {
    try {
      const payload = `Validate===>${jsonCircular.stringify(req)}`;
      return payload;
    }
    catch (exception) {
      log.logger.error(`ActivityStore validate error: ${exception}`);
      throw exception;
    }
  }

  static async stop(req) {
    try {
      const payload = `Stop===>${jsonCircular.stringify(req)}`;
      return payload;
    }
    catch (exception) {
      log.logger.error(`ActivityStore stop error: ${exception}`);
      throw exception;
    }
  }

  static async execute(req) {
    try {
      log.logger.info(`ActivityStore execute => ${JSON.stringify(req.decoded)}`);
      const decodedArgs = req.decoded.inArguments[0];
      const accountDeMapping = await getDataXMLJD(decodedArgs, req.access_token);
      const getProductInfoBody = await
      requestGetProductInformationJD(accountDeMapping, decodedArgs, req.access_token);
      return await updateDataExtensionDE(getProductInfoBody, req.access_token, decodedArgs);
    }
    catch (exception) {
      log.logger.error(`ActivityStore execute error: ${exception}`);
      throw exception;
    }
  }
}

module.exports = ActivityStore;
