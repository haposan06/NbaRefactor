const getDataExtensionIDE = (body) => {

    const jsonValue = JSON.parse(body);

    const statusField = {
        koStatusValue = jsonValue.koStatus,
        statusValue = jsonValue.status,
        messageValue = jsonValue.message,
    }

    const koReasonFields = {
        channelMismatchValue = jsonValue.koReason.channelMismatch,
        corporateClientsValue = jsonValue.koReason.corporateClients,
        underTrustValue = jsonValue.koReason.underTrust,
        servicedByValue = jsonValue.koReason.servicedBy,
        customerStatusValue = jsonValue.koReason.customerStatus,
        agentStatusValue = jsonValue.koReason.agentStatus,
        controlGroupValue = jsonValue.koReason.controlGroup,
        underBankruptcyValue = jsonValue.koReason.underBankruptcy,
        foreignAddressValue = jsonValue.koReason.foreignAddress,
        foreignMobileNumberValue = jsonValue.koReason.foreignMobileNumber,
        phladeceasedValue = jsonValue.koReason.phladeceased,
        claimStatusValue = jsonValue.koReason.claimStatus,
        claimTypeValue = jsonValue.koReason.claimType,
        subClaimTypeValue = jsonValue.koReason.subClaimType,
        failedTotalSumAssuredTestValue = jsonValue.koReason.failedTotalSumAssuredTest,
        exclusionCodeImposedValue = jsonValue.koReason.exclusionCodeImposed,
        extraMoralityValue = jsonValue.koReason.extraMorality,
        isSubstandardValue = jsonValue.koReason.isSubstandard,
        amlwatchListValue = jsonValue.koReason.amlwatchList,
        underwritingKOsValue = jsonValue.koReason.underwritingKOs,
        existingProductsKOsValue = jsonValue.koReason.existingProductsKOs,
        salesPersonKOsValue = jsonValue.koReason.salesPersonKOs,
    }

    return {statusField, koReasonFields}

}