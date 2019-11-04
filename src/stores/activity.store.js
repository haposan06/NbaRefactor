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

  const accountDeMapping = new Map();

  // if(soapRespBody.hasOwnProperty("Property")){
  //   console.log('SOAP RESP BODY CONTAINS PROPERTY');
  //   const property = soapRespBody.RetrieveResponseMsg.Results.Properties.Property
  //     for (let i = 0; i < property.length; i += 1) {
  //       console.log('THERE IS VALUE FOR PROPERTY - >');
  //       accountDeMapping.set(property[i].Name, property[i].Value);
  //   }
  // }
  // else{
  //   console.log('No Property - >');
  //   log.logger.info('Soap Request Property Undefined');
  // }

  const objectHasProperty = async (obj,prop) => {
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
          if (p === prop) {
              return obj;
          } else if (obj[p] instanceof Object && objectHasProperty(obj[p], prop)) {
              return obj[p];
          }
      }
    }
    return null;
  }

  const hasProperty = objectHasProperty(soapRespBody,'Property');
  if(hasProperty){
    console.log('PROPERTY IS FOUND');
    const property = soapRespBody.RetrieveResponseMsg.Results.Properties.Property
      for (let i = 0; i < property.length; i += 1) {
        console.log('THERE IS VALUE FOR PROPERTY - >');
        accountDeMapping.set(property[i].Name, property[i].Value);
    }
  }
  else{
    console.log('No Property - >');
    log.logger.info('Soap Request Property Undefined');
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
      if (jsonValue.status !== process.env.KO_STATUS_OK) {
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

  const jsonValue = JSON.parse(body);
  let error = process.env.Error;
  if (connectionErrorMessage.length > 0) {
    jsonValue.status = error;
    for (let i = 0; i < connectionErrorMessage.length; i += 1) {
      if (connectionErrorMessage[i] !== undefined) {
        jsonValue.message = connectionErrorMessage[i];
      }
      log.logger.info(`MESSAGE VALUE - > ${jsonValue.message}`);
    }
  }
  else if (connectionErrorMessage.length === 0) {

    if(jsonValue.hasOwnProperty("offerProducts") !== true || jsonValue.offerProducts.length < 2 ){
      jsonValue.koStatus = process.env.KO_STATUS_YES;
    } 

    if (jsonValue.koStatus === process.env.KO_STATUS_NO && jsonValue.offerProducts.length >= 2) {
      log.logger.info(`offer Products${jsonValue.offerProducts}`);
      const offerProductsSorted = jsonValue.offerProducts.slice(0);
      offerProductsSorted.sort((a, b) => a.productRank - b.productRank);
      for (let i = 0; i < offerProductsSorted.length; i += 1) {
        jsonValue.offerProducts[i].productName = offerProductsSorted[i].productName;
        jsonValue.offerProducts[i].productCode = offerProductsSorted[i].productCode;
        jsonValue.offerProducts[i].componentCode = offerProductsSorted[i].componentCode;
      }
    }
  }

  let pkValue = decodedArgs.decisionId + '-' + decodedArgs.journeyStepCode;

  const bodyStringInsertRowDE = 
  [{
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
      Product1Name: (jsonValue.status !== error && jsonValue.offerProducts.length >= 2) ? jsonValue.offerProducts[0].productName : '',
      Product1Code: (jsonValue.status !== error && jsonValue.offerProducts.length >= 2) ? jsonValue.offerProducts[0].productCode : '',
      Product1Type: (jsonValue.status !== error && jsonValue.offerProducts.length >= 2) ? jsonValue.offerProducts[0].componentCode : '',
      Product2Name: (jsonValue.status !== error && jsonValue.offerProducts.length >= 2) ? jsonValue.offerProducts[1].productName : '',
      Product2Code: (jsonValue.status !== error && jsonValue.offerProducts.length >= 2) ? jsonValue.offerProducts[1].productCode : '',
      Product2Type: (jsonValue.status !== error && jsonValue.offerProducts.length >= 2) ? jsonValue.offerProducts[1].componentCode : '',
      koStatus: jsonValue.koStatus,
      Status: jsonValue.status,
      Message: jsonValue.message,
      channelMismatch: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.channelMismatch : ''),
      corporateClients: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.corporateClients : ''),
      underTrust: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.underTrust : ''),
      servicedBy: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.servicedBy : ''),
      customerStatus: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.customerStatus : ''),
      agentStatus: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.agentStatus : ''),
      controlGroup: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.controlGroup : ''),
      underBankruptcy: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.underBankruptcy : ''),
      foreignAddress: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.foreignAddress : ''),
      foreignMobileNumber: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.foreignMobileNumber : ''),
      phladeceased: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.phladeceased : ''),
      claimStatus: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.claimStatus : ''),
      claimType: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.claimType : ''),
      subClaimType: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.subClaimType : ''),
      failedTotalSumAssuredTest: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.failedTotalSumAssuredTest : ''),
      exclusionCodeImposed: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.exclusionCodeImposed : ''),
      extraMorality: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.extraMorality : ''),
      isSubstandard: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.isSubstandard : ''),
      amlwatchList: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.amlwatchList : ''),
      underwritingKOs: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.underwritingKOs : ''),
      existingProductsKOs: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.existingProductsKOs : ''),
      salesPersonKOs: (jsonValue.status !== error && jsonValue.hasOwnProperty("koReason") ? jsonValue.koReason.salesPersonKOs : '')
    }
  }];

  const upsertDEReqHeader = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
  const upsertDERequest = {
    body: bodyStringInsertRowDE,
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
