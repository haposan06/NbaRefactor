
define(['postmonger'], function (Postmonger) {
    'use strict';

    let connection = new Postmonger.Session();

    let authTokens = {};
    let payload = {};
    let eventDefinitionKey = '';

    $(window).ready(onRender);

    connection.on('initActivity', initialize); //In response to the first ready event
    connection.on('requestTokens', onGetTokens); //Get Endpoints
    connection.on('requestedEndpoints', onGetEndpoints); //Get Endpoints
    connection.on('requestedTriggerEventDefinition', onEventDefinition); //Get EventDefinition
    connection.on('clickedNext', save); //Save function within MC

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestTriggerEventDefinition');
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

    }

    function getJourneyStepCode() {
        return $('#journeyStep').val().trim();
    };
    /**
     * Save function is fired off upon clicking of "Done" in Marketing Cloud
     * The config.json will be updated here if there are any updates to be done via Front End UI
     */
    function save() {

        let inArgs = payload['arguments'].execute.inArguments;

        if(eventDefinitionKey) {
            $.each(inArgs, function (index, inAug) {
                $.each(inAug, function (key, val) {
                    inAug[key] = val.replace("eventDefinitionKey", eventDefinitionKey);
                });

                inAug['journeyStepCode'] = getJourneyStepCode();

                if(authTokens && authTokens.token){
                    inAug['token'] = authTokens.token;
                }
                
            });
        }

        payload['metaData'].isConfigured = true;
        console.log(JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }

});
