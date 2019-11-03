
define(['postmonger'], function (Postmonger) {
    'use strict';

    let connection = new Postmonger.Session();

    let authTokens = {};
    let payload = {};
    let eventDefinitionKey = '';
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

    $(window).ready(onRender);

    connection.on('initActivity', initialize); //In response to the first ready event
    connection.on('requestedTokens', onGetTokens); // Get Tokens
    connection.on('requestedEndpoints', onGetEndpoints); //Get Endpoints
    connection.on('requestedTriggerEventDefinition', onEventDefinition); //Get EventDefinition
    //connection.on('requestInteractionDefaults', interactionDefaults);
    connection.on('clickedNext', save); //Save function within MC

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestTriggerEventDefinition');
        //connection.trigger('requestInteractionDefaults');
    }

    /**
     * This function is to pull out the event definition Key.
     * With the eventDefinitionKey, it can set the field path and save the config for the activity.
    */
    function onEventDefinition(eventDefinitionModel){
        if(eventDefinitionModel){
            console.log(JSON.stringify(eventDefinitionModel));
            eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
        }
    }

    /*    
    function interactionDefaults(settings){
        if(settings){
            //console.log('settings -> ' + settings);
        }
    }
    */

    /*
        Journey Builder responds by passing an activity definition JSON payload.
    */
    function initialize(data) {
        console.log(JSON.stringify(data));
        
        if (data) {
            payload = data;
        }

        let hasInArguments = Boolean(
            payload &&
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        if(hasInArguments){
            let stepCode = data.arguments.execute.inArguments[0].journeyStepCode;
            $("#journeyStep").val(stepCode);
        }


        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }

    function onGetTokens(tokens) {
        if(tokens){
            console.log(JSON.stringify(tokens));
            authTokens = tokens;
        }
    }

    function onGetEndpoints(endpoints) {
        if(endpoints){
            console.log(JSON.stringify(endpoints));
        }
    }

    function getJourneyStepCode() {
        return $('#journeyStep').val().trim();
    };
    /**
     * Save function is fired off upon clicking of "Done" in Marketing Cloud
     * The config.json will be updated here if there are any updates to be done via Front End UI
     */
    function save() {

        let journeyStep = getJourneyStepCode();

        let inArgs = payload['arguments'].execute.inArguments;

        if(eventDefinitionKey) {
            $.each(inArgs, function (index, inAug) {
                $.each(inAug, function (key, val) {
                    inAug[key] = val.replace("eventDefinitionKey", eventDefinitionKey);
                });

                inAug['journeyStepCode'] = getJourneyStepCode();

                if(authTokens && authTokens['access_token']){
                    inAug['token'] = authTokens['access_token'];
                }
                
            });
        }

        payload['metaData'].isConfigured = true;
        console.log(JSON.stringify(payload));

        //Called when the activity modal should be closed, 
        //with the data saved to the activity on the canvas.
        connection.trigger('updateActivity', payload);

    }


    /**
     * This function is to pull the relevant information to create the schema of the objects
     * View the developer console in browser upon opening of application in MC Journey Builder for further clarity.
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
