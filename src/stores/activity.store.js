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
      if (jsonValue.status !== 'success') {
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

// to be refined
const updateDataExtensionDE = async (body, token, decodedArgs) => {
  let newProduct1 = '';
  let newProduct2 = '';
  let newProduct1Code = '';
  let newProduct2Code = '';
  let newProduct1Type = '';
  let newProduct2Type = '';
  let koStatusValue = '';
  let statusValue = '';
  let messageValue = '';

  // koReasonFields
  let channelMismatchValue = '';
  let corporateClientsValue = '';
  let underTrustValue = '';
  let servicedByValue = '';
  let customerStatusValue = '';
  let agentStatusValue = ''; // here
  let controlGroupValue = '';
  let underBankruptcyValue = '';
  let foreignAddressValue = '';
  let foreignMobileNumberValue = '';
  let phladeceasedValue = '';
  let claimStatusValue = '';
  let claimTypeValue = '';
  let subClaimTypeValue = '';
  let failedTotalSumAssuredTestValue = '';
  let exclusionCodeImposedValue = '';
  let extraMoralityValue = '';
  let isSubstandardValue = '';
  let amlwatchListValue = '';
  let underwritingKOsValue = '';
  let existingProductsKOsValue = '';
  let salesPersonKOsValue = '';


  if (connectionErrorMessage.length > 0) {
    statusValue = process.env.ERROR;
    for (let i = 0; i < connectionErrorMessage.length; i += 1) {
      if (connectionErrorMessage[i] !== undefined) {
        messageValue = connectionErrorMessage[i];
      }
      log.logger.info(`MESSAGE VALUE - > ${messageValue}`);
    }
  }
  else if (connectionErrorMessage.length === 0) {
    const jsonValue = JSON.parse(body);

    koStatusValue = jsonValue.koStatus;
    statusValue = jsonValue.status;
    messageValue = jsonValue.message;

    if(jsonValue.hasOwnProperty("koReason")){
      channelMismatchValue = jsonValue.koReason.channelMismatch;
      corporateClientsValue = jsonValue.koReason.corporateClients;
      underTrustValue = jsonValue.koReason.underTrust;
      servicedByValue = jsonValue.koReason.servicedBy;
      customerStatusValue = jsonValue.koReason.customerStatus;
      agentStatusValue = jsonValue.koReason.agentStatus;
      controlGroupValue = jsonValue.koReason.controlGroup;
      underBankruptcyValue = jsonValue.koReason.underBankruptcy;
      foreignAddressValue = jsonValue.koReason.foreignAddress;
      foreignMobileNumberValue = jsonValue.koReason.foreignMobileNumber;
      phladeceasedValue = jsonValue.koReason.phladeceased;
      claimStatusValue = jsonValue.koReason.claimStatus;
      claimTypeValue = jsonValue.koReason.claimType;
      subClaimTypeValue = jsonValue.koReason.subClaimType;
      failedTotalSumAssuredTestValue = jsonValue.koReason.failedTotalSumAssuredTest;
      exclusionCodeImposedValue = jsonValue.koReason.exclusionCodeImposed;
      extraMoralityValue = jsonValue.koReason.extraMorality;
      isSubstandardValue = jsonValue.koReason.isSubstandard;
      amlwatchListValue = jsonValue.koReason.amlwatchList;
      underwritingKOsValue = jsonValue.koReason.underwritingKOs;
      existingProductsKOsValue = jsonValue.koReason.existingProductsKOs;
      salesPersonKOsValue = jsonValue.koReason.salesPersonKOs;
    }

    if(jsonValue.hasOwnProperty("offerProducts") !== true || jsonValue.offerProducts.length < 2 ){
        koStatusValue = process.env.KO_STATUS_YES;
    } 

    if (koStatusValue === process.env.KO_STATUS_NO && jsonValue.offerProducts.length >= 2) {
      log.logger.info(`offer Products${jsonValue.offerProducts}`);
      const offerProductsSorted = jsonValue.offerProducts.slice(0);
      offerProductsSorted.sort((a, b) => a.productRank - b.productRank);
      for (let i = 0; i < offerProductsSorted.length; i += 1) {
        if (i === 0) {
          newProduct1 = offerProductsSorted[i].productName;
          newProduct1Code = offerProductsSorted[i].productCode;
          newProduct1Type = offerProductsSorted[i].componentCode;
        }
        else if (i === 1) {
          newProduct2 = offerProductsSorted[i].productName;
          newProduct2Code = offerProductsSorted[i].productCode;
          newProduct2Type = offerProductsSorted[i].componentCode;
        }
      }
    }
  }

  let pkValue = decodedArgs.decisionId + '-' + decodedArgs.journeyStepCode;

  const bodyStringInsertRowDE = 
  {
    keys: {
      pK: pkValue
    },

    values: {

      customerId: decodedArgs.clientId,
      PersonContactId: decodedArgs.contactId,
      CampaignId: decodedArgs.campaignId,
      journeyStepCode: decodedArgs.journeyStepCode,
      microSegment: decodedArgs.microSegment,
      CampaignAudienceId : decodedArgs.decisionId,
      Product1Name: newProduct1,
      Product1Code: newProduct1Code,
      Product1Type: newProduct1Type,
      Product2Name: newProduct2,
      Product2Code: newProduct2Code,
      Product2Type: newProduct2Type,
      koStatus: koStatusValue,
      Status: statusValue,
      Message: messageValue,
      channelMismatch: channelMismatchValue,
      corporateClients: corporateClientsValue,
      underTrust: underTrustValue,
      servicedBy: servicedByValue,
      customerStatus: customerStatusValue,
      agentStatus: agentStatusValue,
      controlGroup: controlGroupValue,
      underBankruptcy: underBankruptcyValue,
      foreignAddress: foreignAddressValue,
      foreignMobileNumber: foreignMobileNumberValue,
      phladeceased: phladeceasedValue,
      claimStatus: claimStatusValue,
      claimType: claimTypeValue,
      subClaimType: subClaimTypeValue,
      failedTotalSumAssuredTest: failedTotalSumAssuredTestValue,
      exclusionCodeImposed: exclusionCodeImposedValue,
      extraMorality: extraMoralityValue,
      isSubstandard: isSubstandardValue,
      amlwatchList: amlwatchListValue,
      underwritingKOs: underwritingKOsValue,
      existingProductsKOs: existingProductsKOsValue,
      salesPersonKOs: salesPersonKOsValue
    }
  };

  const upsertDEReqHeader = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
  const upsertDERequest = {
    body: bodyStringInsertRowDE
    headers: upsertDEReqHeader,
    url: `${process.env.REST_BASE_URI}hub/v1/dataevents/key:${process.env.DATA_EXTENSION_KEY}/rowset`
  };
  log.logger.info(`KO Result Request=>${JSON.stringify(upsertDERequest)}`);
  log.logger.info(`KO Result Req Body=>${JSON.stringify(bodyStringInsertRowDE)}`);
  try {
    const { insertDEResponse, insertDEBody } = await RestUtil.post(upsertDERequest);
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
