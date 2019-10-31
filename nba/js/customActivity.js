
define(['postmonger'], function (Postmonger) {
    'use strict';


    //console.log('CUSTOM ACTIVITY ->');
    let connection = new Postmonger.Session();

    let API_PATH = '';
    let authTokens = {};
    let payload = {};
    let uponLoadJourneyStep = '';
   
    // Configuration variables
    let campaignId = '';
    let campaignName = '';
    let clientId = '';
    // let campaignMemberId = '';
    let accountId = '';
    let audienceId = '';
    let campaignType = '';
    let decisionIdValue = '';
    let isOnGoingValue = '';
    let campaignTypeValue= '';
    let campaignProductTypeValue = '';
    let contactIdValue = '';
    let overrideValue = '';
    let microSegmentValue = '';

    let splitCampaignId = '';
    let splitcampaignName = '';
    let splitclientId = '';
    let overrideSplit = '';
    let splitaccountId = '';
    // let splitcampaignMemberId = '';
    let splitaudienceId = '';
    let splitIsOnGoing = '';
    let splitCampaignType = '';
    let splitProductTypeValue =''
    let splitContactId = '';
    let splitMicroSegment = '';

    let eventDefinitionKey = '';
    let dataExtensionId = '';
    //let dataExtensionName = '';

    $(window).ready(onRender);
	//events that happen in journey builder
    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens); // Get Tokens
    connection.on('requestedEndpoints', onGetEndpoints); //Get Endpoints
    connection.on('requestedTriggerEventDefinition', triggerEventDefinition); //Get Entry Event Information
    connection.on('requestInteractionDefaults', interactionDefaults);
    connection.on('clickedNext', save); //Save function within MC

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestTriggerEventDefinition');
        connection.trigger('requestInteractionDefaults');
    }

    /**
     * This function is to pull out the event definition without journey builder.
     * With the eventDefinitionKey, you are able to pull out values that passes through the journey
    */
    function triggerEventDefinition(eventDefinitionModel){
        if(eventDefinitionModel){
            eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
            dataExtensionId = eventDefinitionModel.dataExtensionId;
           // dataExtensionName = eventDefinitionModel.schema.name;
           // console.log('dataExtensionName - > ' + dataExtensionName);
        }
    }

    function interactionDefaults(settings){
        if(settings){
            //console.log('settings -> ' + settings);
        }
    }
    
    function initialize(data) {
        
        if (data) {
            uponLoadJourneyStep = data.arguments.execute.inArguments[0].journeyStepCode;
            console.log('uponLoadJourneyStep - >' + uponLoadJourneyStep);
            $("#journeyStep").val(uponLoadJourneyStep);
            payload = data;
        }
        //console.log('DATA - > ' + data);
        initialLoad(data);
        parseEventSchema(data);
    }

    function onGetTokens(tokens) {
        if(tokens){
            authTokens = tokens;
        }
    }

    function onGetEndpoints(endpoints) {
        if(endpoints){
            //console.log('endpoints - > ' + endpoints);
        }
    }

    /**
     * Save function is fired off upon clicking of "Done" in Marketing Cloud
     * The config.json will be updated here if there are any updates to be done via Front End UI
     */
    function save() {

        //var sourceFile = require('../../app.js');

        console.log('SAVING CONFIG - >');
        console.log('EVENT DEFINITION KEY - > ' + eventDefinitionKey);
        let journeyStep = $('#journeyStep').val();

        payload['arguments'].execute.inArguments = [
            {
                "journeyStepCode" : journeyStep,
                "campaignId" : "{{Event." + eventDefinitionKey + '."' + splitCampaignId[2] + '"}}',
                "campaignName" : "{{Event." + eventDefinitionKey + '."' + splitcampaignName[2] + '"}}',
                "clientId" : "{{Event." +eventDefinitionKey + '."' + splitclientId[2] + '"}}',
                "decisionId" :  "{{Event." +eventDefinitionKey + '."' + splitaudienceId[2] + '"}}',
                "campaignType" :  "{{Event." +eventDefinitionKey + '."' + splitCampaignType[2] + '"}}',
                "campaignProductType" : "{{Event." +eventDefinitionKey + '."' + splitProductTypeValue[2] + '"}}',
                "contactId" : "{{Event." +eventDefinitionKey + '."' + splitContactId[2] + '"}}',
                "override" : "{{Event." +eventDefinitionKey + '."' + overrideSplit[2] + '"}}',
                "accountId" : "{{Event." +eventDefinitionKey + '."' + splitaccountId[2] + '"}}',
                "microSegment" : "{{Event." +eventDefinitionKey + '."' + splitMicroSegment[2] + '"}}',
            }
        ];        
        payload['metaData'].isConfigured = true;
        console.log('payload ====>' + payload);
        connection.trigger('updateActivity', payload);

    }

    /**
     * 
     * @param {*} data
     * 
     * This data param is the config json payload that needs to be loaded back into the UI upon opening the custom application within journey builder 
     * This function is invoked when the user clicks on the custom activity in Marketing Cloud. 
     * If there are information present, it should be loaded back into the appropriate places. 
     * e.g. input fields, select lists
     */
    function initialLoad (data) {
        //console.log('INITIAL LOAD - >');
    };


    /**
     * This function is to pull the relevant information to create the schema of the objects
     * 
     * This function pulls out the schema for additional customizations that can be used.
     * This function leverages on the required field of "Last Name" to pull out the overall event schema
     * 
     * returned variables of: lastnameSchema , eventSchema.
     * eventSchema = Case:Contact:
     * lastnameSchema = Case:Contact:<last_name_schema>
     * 
     * View the developer console in chrome upon opening of application in MC Journey Builder for further clarity.
     */
    function parseEventSchema(data) {
        // Pulling data from the schema
        connection.trigger('requestSchema');
        connection.on('requestedSchema', function (data) {
            // save schema
            let dataJson = data['schema'];
            for (let i = 0; i < dataJson.length; i++) {

                ////SALESFORCE ENTRY
                if(dataJson[i].key.includes('NBA_Campaign_Audience__c:NBA_Campaign__r:Id')){
                    campaignId = dataJson[i].key;
                    splitCampaignId = campaignId.split('.');
                    console.log('splitCampaignId - > ' + splitCampaignId);
                }
                else if(dataJson[i].key.includes('NBA_Campaign_Audience__c:NBA_Campaign__r:Name')){
                    campaignName = dataJson[i].key;
                    splitcampaignName = campaignName.split('.');
                    console.log('splitcampaignName - > ' + splitcampaignName);
                }
                else if(dataJson[i].key.includes('NBA_Campaign_Audience__c:NBA_Client_Id__c')){
                    clientId = dataJson[i].key;
                    splitclientId = clientId.split('.');
                    console.log('splitclientId - > ' + splitclientId);
                }
                else if(dataJson[i].key.includes('NBA_Campaign_Audience__c:NBA_Customer__r:Id')){
                    accountId = dataJson[i].key;
                    splitaccountId = accountId.split('.');
                    console.log('splitaccountId - > ' + splitclientId);
                }
                else if(dataJson[i].key.includes('NBA_Campaign_Audience__c:Id')){
                    audienceId = dataJson[i].key;
                    splitaudienceId  = audienceId.split('.');
                    console.log('splitaudienceId - > ' + splitaudienceId);
                }
                else if(dataJson[i].key.includes('NBA_Campaign_Audience__c:NBA_Campaign__r:NBA_Product_Type__c')){
                    campaignProductTypeValue = dataJson[i].key;
                    splitProductTypeValue  = campaignProductTypeValue.split('.');
                    console.log('splitProductTypeValue -> ' + splitProductTypeValue);
                }
                else if(dataJson[i].key.includes('NBA_Campaign_Audience__c:NBA_Campaign__r:Campaign_Type__c')){
                    campaignTypeValue = dataJson[i].key;
                    splitCampaignType  = campaignTypeValue.split('.');
                    console.log('splitCampaignType - > ' + splitCampaignType);
                }
                else if(dataJson[i].key.includes('NBA_Campaign_Audience__c:NBA_Customer__r:PersonContactId')){
                    contactIdValue = dataJson[i].key;
                    splitContactId =  contactIdValue.split('.');
                    console.log('splitContactId - > ' + splitContactId);
                }
                else if(dataJson[i].key.includes('NBA_Campaign_Audience__c:NBA_Campaign__r:NBA_Override_Contact_Framework__c')){
                    overrideValue = dataJson[i].key;
                    overrideSplit =  overrideValue.split('.');
                    console.log('overrideSplit - > ' + overrideSplit);
                }
                else if(dataJson[i].key.includes('NBA_Campaign_Audience__c:NBA_Customer__r:Customer_Segmentation__c')){
                    microSegmentValue = dataJson[i].key;
                    splitMicroSegment  = microSegmentValue.split('.');
                    console.log('splitMicroSegment ->' + splitMicroSegment);
                }
            }
        });
    }

});
