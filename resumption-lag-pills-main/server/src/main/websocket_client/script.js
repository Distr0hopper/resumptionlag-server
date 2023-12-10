let expConfig, metaInfo;
let nextTrial = 0;
let trialsConfig, trials, currentTrial, interruption, currentsichtbarkeit, patientID, nextPatient, block, patient;

//Overlay "verdeckung" an und ausschalten
function unsichtbar() {
  document.getElementById("verdeckung").style.display = "block";
}

function sichtbar() {
  document.getElementById("verdeckung").style.display = "none";
}

function showTrainingOverlay(amountOfErrors) {
    document.getElementById("overlay").style.display = "block";
    $("#text").text("Amount of Errors: " + amountOfErrors);
}

function hideTrainingOverlay() {
    document.getElementById("overlay").style.display = "none";
}

function checkMetaInfo() {
    expConfig = JSON.parse(localStorage["expConfig"]);
    metaInfo = JSON.parse(expConfig.metaInfo);
    let training = metaInfo.TrainingIncluded;
    // participantNumber = metaInfo.ParticipantNumber;
    //device = metaInfo.Device;
    trialsConfig = JSON.parse(expConfig.trialsConfig);
    trials = trialsConfig.trials;
    currentTrial = trials[nextTrial];
    interruption = currentTrial.interruptionTrial;
    currentsichtbarkeit = currentTrial.sichtbarkeit;
    patientID = currentTrial.patient;

    if (training.toString() === "true") {
        $("#trialInfo").text("Training");
        trialsConfig = JSON.parse(expConfig.trialsConfig);
        currentTrial = trialsConfig.trainingsTrial;
        console.log(nextPatient);
        if (nextPatient === 101) {
            currentTrial.patient = 101;
        }
        nextPatient = 100;
        patientID = currentTrial.patient;
        block = "Training";
    } else {
        checkConfigTrial();
    }
}

function checkConfigTrial() {
    let trialsConfig = JSON.parse(expConfig.trialsConfig);
    trials = trialsConfig.trials;
    nextPatient = 0;
    nextTrial = 0;
    block = "Main";
    currentTrial = trials[nextTrial];
    $("#trialInfo").text("1/" + trials.length + " Patients");
}

function refreshPatient() {
    console.log("Current Trial: " + currentTrial.toString());
    var patientList = expConfig.list;
    let currentPatientId = currentTrial.patient;
    patientList.forEach(function (p) {
        if (p.id === currentPatientId) {
            patient = p;
        }
    });
    let stringAllergies = "";
    if (patient.allergies.length !== 1) {
        patient.allergies.forEach(function (item) {
            stringAllergies = stringAllergies + item + ", ";
        });
        stringAllergies = stringAllergies.substring(0, stringAllergies.length - 2);
    } else {
        stringAllergies = patient.allergies[0];
    }
    $("#name").text(patient.name);
    $("#dateOfBirth").text(patient.dateOfBirth);
    $("#heightInfo").text(patient.height);
    $("#weightInfo").text(patient.weight);
    $("#allergiesInfo").text(stringAllergies);
    console.log("Allergies: " + stringAllergies);

    $("#drugOneInfo").text(patient.drugOneDosis + " ml  (" + patient.drugOneTime + ")");
    $("#drugTwoInfo").text(patient.drugTwoDosis + " mg  (" + patient.drugTwoTime + ")");
    $("#drugThreeInfo").text(patient.drugThreeDosis + " mg  (" + patient.drugThreeTime + ")");

    $("#respiratoryDescriptionInfo").text(patient.respiratoryDescription);
    $("#respiratorySizeInfo").text(patient.respiratorySize);
    $("#respiratoryTypeInfo").text(patient.respiratoryType);

    $("#catheterDescriptionInfo").text(patient.catheterDescription);
    $("#catheterPositionInfo").text(patient.catheterPosition);
    $("#catheterTypeInfo").text(patient.catheterType);

    $("#tubeDescriptionInfo").text(patient.tubeDescription);
    $("#tubeTimeInfo").text(patient.tubeTime);
    $("#tubeTypeInfo").text(patient.tubeType);

    $("#positioningMainInfo").text(patient.positioningMain);
    $("#positioningHeadInfo").text(patient.positioningHead);
    $("#positioningTrunkInfo").text(patient.positioningTrunk);
}


$(document).ready(function () {

    let nextTrial = 0;
    var buttonID = 0;
    var trial = 1;
    localStorage["nextPatient"] = 0;
    var jsonObj = [];
    var jsonObjCopy = [];
    var jsonString = "";
    var allErrors = 0;
    var errorsInputPatientInfo = 0;
    var errorsInputMedication = 0;
    var errorsInputRT = 0;
    var errorsInputCatheter = 0;
    var errorsInputTube = 0;
    var errorsInputPositioning = 0;
    var errorsEmptyModule = 0;
    var timestampBaselinePatientInfo, timestampBaselineMedication, timestampBaselineRT, timestampBaselineCatheter,
        timestampBaselineTube, timestampBaselinePositioning, timestampBaselineProcess;
    var timestampResumption;
    var timestampResumptionProcess;

    var timestampBaselinePatientInfoInt, timestampBaselineMedicationInt, timestampBaselineRTInt,
        timestampBaselineCatheterInt,
        timestampBaselineTubeInt, timestampBaselinePositioningInt, timestampBaselineProcessInt;
    var timestampResumptionInt;
    var timestampResumptionProcessInt;
    var clickOKPatientInfoInt, clickOKMedicationInt, clickOKRTInt, clickOKCatheterInt, clickOKTubeInt,
        clickOKPositioningInt;

    var clickOKPatientInfo, clickOKMedication, clickOKRT, clickOKCatheter, clickOKTube, clickOKPositioning;
    var correctAllergieSelected = 0;
    var errorsModule = 0;
    var patientInfoInterrupted = false;
    var medicationInterrupted = false;
    var RTInterrupted = false;
    var catheterInterrupted = false;
    var tubeInterrupted = false;
    var positioningInterrupted = false;
    var module;
    var interruptionLength;
    var timeout;
    var allergieError = false;
    var wrongClickAfterInterruption = 0;

    var now = new Date();
    var fixedDate = parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3);
    console.log(fixedDate);
    localStorage["fixedDate"] = fixedDate;

    var todaysDate = now.getDate() + "/" + ((now.getMonth() < 10) ? "0" + now.getMonth() : now.getMonth()) + "/" + now.getFullYear();
    $("#todaysDate").text(todaysDate);
    
    function disableInputFields() {
        // Patient Information disabled
        $("#height, #weight, #checkAllergies1, #checkAllergies2, #checkAllergies3, #checkAllergiesInput, #allergiesInput").prop("disabled", true);
        // Medication disabled
        $("#dropDownMedication1, #dropDownMedication2, #dropDownMedication3, #timeMedication1, #timeMedication2, #timeMedication3").prop("disabled", true);
        // Respiratory Tract disabled
        $("#dropDownRT1, #dropDownRT2, #dropDownRT3").prop("disabled", true);
        // Catheter disabled
        $("#checkArterial, #arterialInput, #dropDownArterial, #checkCVC, #CVCInput, #dropDownCVC, #checkPVC, #PVCInput, #dropDownPVC").prop("disabled", true);
        // Tube disabled
        $("#checkTube1, #dropDownTube1, #checkTube2, #dropDownTube2, #checkTube3, #dropDownTube3, #timeTube").prop("disabled", true);
        // Positioning disabled
        $("#supinePos, #torsoHigh, #torsoLow, #stomach, #foamShell, #gelRing, #spineOrtho, #shoulderSupport").prop("disabled", true);
    }

    // Deletes input when clicking OK button
    function deleteInput() {
        $(".module").find('input, input[type="checkbox"]').val("");
        $('input[type="checkbox"]').prop("checked", false);
        $("#dropDownMedication1, #dropDownMedication2, #dropDownMedication2, #dropDownMedication3").prop('selectedIndex', 0);
        $("#dropDownRT1, #dropDownRT2, #dropDownRT3").prop('selectedIndex', 0);
        $("#dropDownArterial, #dropDownCVC, #dropDownPVC").prop('selectedIndex', 0);
        $("#dropDownTube1, #dropDownTube2, #dropDownTube3").prop('selectedIndex', 0);
        $("input[name=tubeRadio]").prop('checked', false);
        $("input[name=catheterRadio]").prop('checked', false);
        $("input[name=posRadio]").prop('checked', false);
        $("input[name=headRadio]").prop('checked', false);
        $("input[name=trunkRadio]").prop('checked', false);
        $("#actualStero").text("---");
        $("#actualFena").text("---");
        $("#actualProp").text("---");
    }

    function getTrialInfo() {
        if (currentTrial === trialsConfig.trainingsTrial) {
            block = "Training";
            //trial = trials[nextTrial].id;
        } else {
            block = "Main";
            trial = trials[nextTrial].id;
        }

        interruption = currentTrial.interruptionTrial;
        patientID = currentTrial.patient;
        currentsichtbarkeit = currentTrial.sichtbarkeit;
        //errorsModule = 0;

    }


    function sendInterruption(interruptionLength) {

        /// clear selected text (only from labels, not from input fields)
        let sel = document.getSelection();
        sel.removeAllRanges();

        // the interruption is started immediately, if the user does not have to set a cue manually.
        // Otherwise, this is sent from the hololens, when the user places a cue.
        if (expConfig.hololensCueType !== "manual")
        {
            logStartTime()

            //sends the interruption length to the frontend tablet
            WS.reportInterruptionPoint(interruptionLength);
        }

        let nextModule = getNextModulesEditButton()
        let rect = nextModule.getBoundingClientRect()

        // Application shall be run in fullscreen!
        // availWidth/Height exclude the taskbar width/height
        let screenWidth = window.screen.width;
        let screenHeight = window.screen.height;

        // center position relative to screen
        let relativeX = (rect.x + (rect.width  /2)) / screenWidth
        let relativeY = (rect.y + 18 + (rect.height /2)) / screenHeight //button is 35x35 px

        let relCenter = {}
        relCenter.x = relativeX
        relCenter.y = relativeY

        let obj = {}
        obj.relativeCenter = relCenter
        obj.interruptionLength = interruptionLength
        obj.hololensCueType = expConfig.hololensCueType
        let msg = JSON.stringify(obj)

        WS.sendToLens(msg)
    }

    function getPreviousModule()
    {
        //ButtonID 1 = Module 1, ButtonID 2 = Module 2...
        // $()[0], because jQuery Syntax: https://stackoverflow.com/a/4070010
        switch(buttonID) {
            case 1:
                return $("#patientInformation")[0]
            case 2:
                return $("#medication")[0]
            case 3:
                return $("#respiratoryTract")[0]
            case 4:
                return $("#catheter")[0]
            case 5:
                return $("#tube")[0]
            case 6:
                return $("#positioning")[0]
            default:
                console.log("unknown Button ID")
                return null
        }
    }

    function getNextModule()
    {
        //ButtonID 1 = Module 1, ButtonID 2 = Module 2...
        // $()[0], because jQuery Syntax: https://stackoverflow.com/a/4070010
        switch(buttonID) {
            case 1:
                return $("#medication")[0]
            case 2:
                return $("#respiratoryTract")[0]
            case 3:
                return $("#catheter")[0]
            case 4:
                return $("#tube")[0]
            case 5:
                return $("#positioning")[0]
            case 6:
                return $("#processButton")[0]
            default:
                console.log("unknown Button ID")
                return null
        }
    }

    function getNextModulesEditButton()
    {
        //ButtonID 1 = Module 1, ButtonID 2 = Module 2...
        // $()[0], because jQuery Syntax: https://stackoverflow.com/a/4070010
        switch(buttonID) {
            case 1:
                return $("#editMedication")[0]
            case 2:
                return $("#editRT")[0]
            case 3:
                return $("#editCatheter")[0]
            case 4:
                return $("#editTube")[0]
            case 5:
                return $("#editPositioning")[0]
            case 6:
                return $("#processButton")[0]
            default:
                console.log("unknown Button ID")
                return null
        }
    }

    function resetInterruptionInfo() {
        patientInfoInterrupted = false;
        medicationInterrupted = false;
        RTInterrupted = false;
        catheterInterrupted = false;
        tubeInterrupted = false;
        positioningInterrupted = false;

    }

    function resetErrors() {
        errorsEmptyModule = 0;
        errorsModule = 0;
        localStorage["startInterruption"] = " ";
        localStorage["startInterruptionInteger"] = " ";
        localStorage["endTimeInt"] = " ";
        localStorage["endTimeInteger"] = " ";
        localStorage["errorCountInterruption"] = " ";
        timestampResumption = " ";
        timestampResumptionInt = " ";
        allergieError = false;
        wrongClickAfterInterruption = 0;
    }

    function addToJSON() {
        jsonObj.push({
            participantNumber: metaInfo.ParticipantNumber,
            block: block,
            device: metaInfo.Device,
            interruptionTrial: interruption,
            sichtbarkeit: currentsichtbarkeit,
            trial: trial,
            time: timestampResumption,
            timeInt: timestampResumptionInt,
            timeResumptionError: wrongClickAfterInterruption,
            patientID: patientID,
            module: module,
            errorsInput: 0,
            errorsEmptyModule: 0,
            errorsModule: errorsModule,
            errorCountInterruption: localStorage["errorCountInterruption"],
            interruptionLength: 0,
            clickOnOK: " ",
            hololensCueType: expConfig.hololensCueType,
            cueSetDuration: localStorage["cueSetDuration"],
            firstFocus: localStorage["firstFocusAfterEnableModule"],
            firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
        });
    }

    function processButton() {
        console.log("Process Button Function");
        if (buttonID !== 6) {
            console.log("Button ID not 6");
            if (patientInfoInterrupted || medicationInterrupted || RTInterrupted || catheterInterrupted || tubeInterrupted) {
                var now = new Date();
                timestampResumptionProcess = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                timestampResumptionProcessInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);
                wrongClickAfterInterruption = 1;
            }

            getTrialInfo();
            module = "Process Button";
            errorsModule = 1;

            jsonObj.push({
                participantNumber: metaInfo.ParticipantNumber,
                block: block,
                device: metaInfo.Device,
                interruptionTrial: interruption,
                sichtbarkeit: currentsichtbarkeit,
                trial: trial,
                time: timestampResumptionProcess,
                timeInt: timestampResumptionProcessInt,
                timeResumptionError: wrongClickAfterInterruption,
                patientID: patientID,
                module: module,
                errorsModule: errorsModule,
                errorsInput: 0,
                errorsEmptyModule: 0,
                errorCountInterruption: localStorage["errorCountInterruption"],
                interruptionLength: 0,
                clickOnOK: " ",
                hololensCueType: expConfig.hololensCueType,
                cueSetDuration: localStorage["cueSetDuration"],
                firstFocus: localStorage["firstFocusAfterEnableModule"],
                firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
            });

            timestampResumptionProcess = " ";
            timestampBaselineProcessInt = 0;

            return;
        }

        var now = new Date();
        timestampBaselineProcess = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
            .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
        timestampBaselineProcessInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

        module = "Process Button";
        getTrialInfo();

        jsonObj.push({
            participantNumber: metaInfo.ParticipantNumber,
            block: block,
            device: metaInfo.Device,
            interruptionTrial: interruption,
            sichtbarkeit: currentsichtbarkeit,
            trial: trial,
            time: timestampBaselineProcess,
            timeInt: timestampBaselineProcessInt,
            timeResumptionError: 0,
            patientID: patientID,
            module: module,
            errorsModule: 0,
            errorsInput: 0,
            errorsEmptyModule: 0,
            errorCountInterruption: localStorage["errorCountInterruption"],
            interruptionLength: 0,
            clickOnOK: timestampBaselineProcess,
            clickOnOKInt: timestampBaselineProcessInt,
            hololensCueType: expConfig.hololensCueType,
            cueSetDuration: localStorage["cueSetDuration"],
            firstFocus: localStorage["firstFocusAfterEnableModule"],
            firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
        });

        timestampBaselineProcess = " ";
        timestampBaselineProcessInt = 0;

        if (positioningInterrupted) {
            hideCueOnHololens()
        }
    }

    checkMetaInfo();
    refreshPatient();
    // Disable all input fields in the beginning
    disableInputFields();
    $("#processButton").prop("disabled", true);

    $(function () {
        $("#startExp").click(function () {
            $("#overlay").css("display", "none");
            checkConfigTrial();
            refreshPatient();

            WS.resetInterruptionTaskIndex()

            if (metaInfo.CalibrationIncluded) {
                document.getElementById('primaryTask').style.display = "none";
                switch (metaInfo.Device.toString()) {
                    case "AR Mode":
                        WS.reportCalibration();
                        document.getElementById('overlayCalibrationAR').style.display = "inline";
                        document.body.style.backgroundColor = "black";
                        break;
                    case "Glance Mode":
                        WS.reportCalibration();
                        document.getElementById('overlayCalibrationGlance').style.display = "inline";
                        document.body.style.backgroundColor = "black";
                        break;
                    case "Opaque":
                        WS.reportCalibration();
                        document.getElementById('overlayCalibration').style.display = "inline";
                        document.body.style.backgroundColor = "black";
                        break;
                    default:
                        document.body.style.backgroundColor = "white";
                        document.getElementById('primaryTask').style.display = 'inline';
                        document.getElementById('overlayCalibration').style.display = "none";
                        document.getElementById('overlayCalibrationAR').style.display = "none";
                        document.getElementById('overlayCalibrationGlance').style.display = "none";
                        break;
                }
            }

        });
        $("#redoTraining").click(function () {
            $("#overlay").css("display", "none");
            nextPatient = 101;
            allErrors = 0;
            checkMetaInfo();
            refreshPatient();
        })
    });

    // Checks input of module
    $(function () {
        var buttonpressed;
        $(".okButton").click(function () {

            buttonpressed = $(this).attr('id');
            $(".moduleTop").css('background-color', 'var(--main-color-faded)');
            $(".okButton").css('background-color', 'var(--main-color-faded)');

            if (buttonpressed === "okPatientInformation") {

                module = "Patient Information";

                var now = new Date();
                clickOKPatientInfo = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                clickOKPatientInfoInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

                // Check empty module
                if ($("#height").val() === "" && $("#weight").val() === "" && (!$("input[type=checkbox]").is(":checked"))) {
                    errorsEmptyModule++;
                    allErrors++;
                    console.log("Empty Module Patient Info");

                } else {
                    if ($("#height").val() !== patient.height.toString()) {
                        errorsInputPatientInfo++;
                        allErrors++;
                        console.log("Error Input Height");
                    }
                    if ($("#weight").val() !== patient.weight.toString()) {
                        errorsInputPatientInfo++;
                        allErrors++;
                        console.log("Error Input Weight");
                    }

                    if (!$("input[type='checkbox']").is(":checked")) {
                        errorsInputPatientInfo++;
                        allErrors++;
                        console.log("No allergies selected");
                    } else {
                        // Check first checkbox
                        console.log(patient.allergies.toString());
                        if ($("#checkAllergies1").is(":checked")) {
                                if ("No allergies" !== patient.allergies.toString()) {
                                    allergieError = true;
                                    console.log("'No allergies' false");
                                }
                        }

                        // Check second checkbox
                        if ($("#checkAllergies2").is(":checked")) {
                            if ("Pollen" !== patient.allergies.toString()) {
                                    allergieError = true;
                                    console.log("'Pollen' false");
                            }
                        }

                        // Check third checkbox
                        if ($("#checkAllergies3").is(":checked")) {
                            if ("Latex" !== patient.allergies.toString()) {
                                    allergieError = true;
                                    console.log("'Latex' false");
                            }
                        }

                        // Check input checkbox
                        if ($("#checkAllergiesInput").is(":checked")) {
                            if ($("#allergiesInput").val().toLowerCase() !== patient.allergies.toString().toLowerCase()) {
                                    allergieError = true;
                                    console.log("'Input Allergies' false");
                            }
                        }

                        if(allergieError) {
                            errorsInputPatientInfo++;
                            allErrors++;
                        }


                    }
                }

                deleteInput();
                $("#bodyWeight").text("--");
                disableInputFields();

                console.log("Errors Input Patient Info: " + errorsInputPatientInfo);

                interruptionLength = currentTrial.patientInformation;

                console.log(clickOKPositioning);

                if (buttonID === 0) {
                    buttonID = 1;
                    if (interruptionLength !== 0) {
                        sendInterruption(interruptionLength);
                        patientInfoInterrupted = true;
                        medicationInterrupted, RTInterrupted, catheterInterrupted, tubeInterrupted, positioningInterrupted = false;
                    } else {
                        resetInterruptionInfo();
                    }
                }

                setTimeout(function () {
                    getTrialInfo();
                    interruptionLength = currentTrial.patientInformation;
                    jsonObj.push({
                        participantNumber: metaInfo.ParticipantNumber,
                        block: block,
                        device: metaInfo.Device,
                        interruptionTrial: interruption,
                        sichtbarkeit: currentsichtbarkeit,
                        trial: trial,
                        time: timestampBaselinePatientInfo,
                        timeInt: timestampBaselinePatientInfoInt,
                        timeResumptionError: 0,
                        patientID: patientID,
                        module: module,
                        errorsModule: errorsModule,
                        errorsInput: errorsInputPatientInfo,
                        errorsEmptyModule: errorsEmptyModule,
                        errorCountInterruption: localStorage["errorCountInterruption"],
                        interruptionLength: interruptionLength,
                        clickOnOK: clickOKPatientInfo,
                        clickOnOKInt: clickOKPatientInfoInt,
                        startTimeIT: localStorage["startInterruption"],
                        endTimeIT: localStorage["endTimeInt"],
                        startTimeInteger: localStorage["startInterruptionInteger"],
                        endTimeInteger: localStorage["endTimeInteger"],
                        hololensCueType: expConfig.hololensCueType,
                        cueSetDuration: localStorage["cueSetDuration"],
                        firstFocus: localStorage["firstFocusAfterEnableModule"],
                        firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
                    });

                    resetErrors();
                    errorsInputPatientInfo = 0;

                }, (interruptionLength * 1000) + 700);


            } else if (buttonpressed === "okMedication") {

                module = "Medication";

                var now = new Date();
                clickOKMedication = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                clickOKMedicationInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);


                // Check empty module
                if ($('#dropDownMedication1 :selected').val() === "" && $('#dropDownMedication2 :selected').val() === ""
                    && $('#dropDownMedication3 :selected').val() === "" && $("#timeMedication1").val() == ""
                    && $("#timeMedication2").val() === "" && $("#timeMedication3").val() === "") {
                    errorsEmptyModule++;
                    allErrors++;
                    console.log("Empty Module Medication");
                } else {
                    if ($('#dropDownMedication1 :selected').val() !== patient.drugOneDosis.toString()) {
                        errorsInputMedication++;
                        allErrors++;
                        console.log("Medication 1 DropDown falsely selected");
                    }
                    if ($('#dropDownMedication2 :selected').val() !== patient.drugTwoDosis.toString()) {
                        errorsInputMedication++;
                        allErrors++;
                        console.log("Medication 2 DropDown falsely selected");
                    }
                    if ($('#dropDownMedication3 :selected').val() !== patient.drugThreeDosis.toString()) {
                        errorsInputMedication++;
                        allErrors++;
                        console.log("Medication 3 DropDown falsely selected");
                    }
                    if ($("#timeMedication1").val() !== patient.drugOneTime.toString()) {
                        errorsInputMedication++;
                        allErrors++;
                        console.log("Medication 1 Time falsely selected");
                    }
                    if ($("#timeMedication2").val() !== patient.drugTwoTime.toString()) {
                        errorsInputMedication++;
                        allErrors++;
                        console.log("Medication 2 Time falsely selected");
                    }
                    if ($("#timeMedication3").val() !== patient.drugThreeTime.toString()) {
                        errorsInputMedication++;
                        allErrors++;
                        console.log("Medication 3 Time falsely selected");
                    }
                }

                deleteInput();
                disableInputFields();

                console.log("Errors Input Medication: " + errorsInputMedication);

                interruptionLength = currentTrial.medication;

                console.log(clickOKMedication);

                if (buttonID === 1) {
                    buttonID = 2;
                    if (interruptionLength !== 0) {
                        sendInterruption(interruptionLength);
                        medicationInterrupted = true;
                        patientInfoInterrupted, RTInterrupted, catheterInterrupted, tubeInterrupted, positioningInterrupted = false;
                    } else {
                        resetInterruptionInfo();
                    }
                }

                setTimeout(function () {
                    getTrialInfo();
                    jsonObj.push({
                        participantNumber: metaInfo.ParticipantNumber,
                        block: block,
                        device: metaInfo.Device,
                        interruptionTrial: interruption,
                        sichtbarkeit: currentsichtbarkeit,
                        trial: trial,
                        time: timestampBaselineMedication,
                        timeInt: timestampBaselineMedicationInt,
                        timeResumptionError: 0,
                        patientID: patientID,
                        module: module,
                        errorsModule: errorsModule,
                        errorsInput: errorsInputMedication,
                        errorsEmptyModule: errorsEmptyModule,
                        errorCountInterruption: localStorage["errorCountInterruption"],
                        interruptionLength: interruptionLength,
                        clickOnOK: clickOKMedication,
                        clickOnOKInt: clickOKMedicationInt,
                        startTimeIT: localStorage["startInterruption"],
                        endTimeIT: localStorage["endTimeInt"],
                        startTimeInteger: localStorage["startInterruptionInteger"],
                        endTimeInteger: localStorage["endTimeInteger"],
                        hololensCueType: expConfig.hololensCueType,
                        cueSetDuration: localStorage["cueSetDuration"],
                        firstFocus: localStorage["firstFocusAfterEnableModule"],
                        firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
                    });

                    resetErrors();
                    errorsInputMedication = 0;

                }, (interruptionLength * 1000) + 700);


            } else if (buttonpressed === "okRT") {


                module = "Respiratory Tract";

                var now = new Date();
                clickOKRT = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                clickOKRTInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);


                if ($('#dropDownRT1 :selected').val() === "" && $('#dropDownRT2 :selected').val() === ""
                    && $('#dropDownRT3 :selected').val() === "") {
                    errorsEmptyModule++;
                    allErrors++;
                    console.log("Empty Module Respiratory Tract");
                } else {
                    if ($('#dropDownRT1 :selected').val() !== patient.respiratoryDescription.toString()) {
                        errorsInputRT++;
                        allErrors++;
                        console.log("RT 1 DropDown falsely selected");
                    }

                    if ($('#dropDownRT2 :selected').val() !== patient.respiratoryType.toString()) {
                        errorsInputRT++;
                        allErrors++;
                        console.log("RT 2 DropDown falsely selected");
                    }

                    if ($('#dropDownRT3 :selected').val() !== patient.respiratorySize.toString()) {
                        errorsInputRT++;
                        allErrors++;
                        console.log("RT 3 DropDown falsely selected");
                    }
                }

                deleteInput();
                disableInputFields();

                console.log("Errors Input RT: " + errorsInputRT);

                interruptionLength = currentTrial.respiratory;

                console.log(clickOKRT);

                if (buttonID === 2) {
                    buttonID = 3;
                    if (interruptionLength !== 0) {
                        sendInterruption(interruptionLength);
                        RTInterrupted = true;
                        patientInfoInterrupted, medicationInterrupted, catheterInterrupted, tubeInterrupted, positioningInterrupted = false;
                    } else {
                        resetInterruptionInfo();
                    }
                }

                setTimeout(function () {
                    getTrialInfo();
                    jsonObj.push({
                        participantNumber: metaInfo.ParticipantNumber,
                        block: block,
                        device: metaInfo.Device,
                        interruptionTrial: interruption,
                        sichtbarkeit: currentsichtbarkeit,
                        trial: trial,
                        time: timestampBaselineRT,
                        timeInt: timestampBaselineRTInt,
                        timeResumptionError: 0,
                        patientID: patientID,
                        module: module,
                        errorsModule: errorsModule,
                        errorsInput: errorsInputRT,
                        errorsEmptyModule: errorsEmptyModule,
                        errorCountInterruption: localStorage["errorCountInterruption"],
                        interruptionLength: interruptionLength,
                        clickOnOK: clickOKRT,
                        clickOnOKInt: clickOKRTInt,
                        startTimeIT: localStorage["startInterruption"],
                        endTimeIT: localStorage["endTimeInt"],
                        startTimeInteger: localStorage["startInterruptionInteger"],
                        endTimeInteger: localStorage["endTimeInteger"],
                        hololensCueType: expConfig.hololensCueType,
                        cueSetDuration: localStorage["cueSetDuration"],
                        firstFocus: localStorage["firstFocusAfterEnableModule"],
                        firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
                    });

                    resetErrors();
                    errorsInputRT = 0;
                }, (interruptionLength * 1000) + 700);


            } else if (buttonpressed === "okCatheter") {

                module = "Catheter";

                var now = new Date();
                clickOKCatheter = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                clickOKCatheterInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

                if (!$("input[name='catheterRadio']").is(":checked")) {
                    errorsEmptyModule++;
                    allErrors++;
                    console.log("Empty Module Catheter");
                } else {

                    console.log($("#checkArterial").is(":checked"));
                    if ($("#checkArterial").is(":checked")) {
                        if (patient.catheterType.toString() !== "Arterial") {
                            errorsInputCatheter++;
                            allErrors++;
                            console.log("Wrongly chosen arterial");
                        } else if (patient.catheterType.toString() === "Arterial") {
                            if ($("#arterialInput").val() === "") {
                                errorsInputCatheter++;
                                allErrors++;
                                console.log("Input field empty when arterial is chosen!");
                            }

                            if ($('#dropDownArterial :selected').val() === "") {
                                errorsInputCatheter++;
                                allErrors++;
                                console.log("DropDown empty when arterial is chosen!");
                            }
                        }

                        if ($("#arterialInput").val().toLowerCase() !== patient.catheterDescription.toString()) {
                            errorsInputCatheter++;
                            allErrors++;
                            console.log("Arterial selected: Wrong input");
                        }

                        if ($('#dropDownArterial :selected').val() !== patient.catheterPosition.toString()) {
                            errorsInputCatheter++;
                            allErrors++;
                            console.log("Arterial selected: Wrong dropDown");
                        }

                    }

                    console.log($("#checkCVC").is(":checked"));
                    if ($("#checkCVC").is(":checked")) {
                        if(patient.catheterType.toString() !== "CVC") {
                            errorsInputCatheter++;
                            allErrors++;
                            console.log("Wrongly chosen CVC");
                        } else if(patient.catheterType.toString() === "CVC") {
                            if ($("#CVCInput").val() === "") {
                                errorsInputCatheter++;
                                allErrors++;
                                console.log("CVC Input is empty!");
                            }
                            if ($('#dropDownCVC :selected').val() === "") {
                                errorsInputCatheter++;
                                allErrors++;
                                console.log("CVC DropDown not selected!")
                            }
                        }

                        if ($("#CVCInput").val().toLowerCase() !== patient.catheterDescription.toString()) {
                            errorsInputCatheter++;
                            allErrors++;
                            console.log("CVC selected: Wrong input");
                        }

                        if ($('#dropDownCVC :selected').val() !== patient.catheterPosition.toString()) {
                            errorsInputCatheter++;
                            allErrors++;
                            console.log("CVC selected: Wrong dropDown");
                        }
                    }

                    console.log($("#checkPVC").is(":checked"));
                    if ($("#checkPVC").is(":checked")) {
                        if(patient.catheterType.toString() !== "PVC") {
                            errorsInputCatheter++;
                            allErrors++;
                            console.log("Wrongly chosen PVC");
                        } else if(patient.catheterType.toString() === "PVC") {
                            if ($("#PVCInput").val() === "") {
                                errorsInputCatheter++;
                                allErrors++;
                                console.log("PVC Input is empty!");
                            }
                            if ($('#dropDownPVC :selected').val() === "") {
                                errorsInputCatheter++;
                                allErrors++;
                                console.log("PVC DropDown not selected!")
                            }
                        }
                        if ($("#PVCInput").val().toLowerCase() !== patient.catheterDescription.toString()) {
                            errorsInputCatheter++;
                            allErrors++;
                            console.log("PVC selected: Wrong input");
                        }

                        if ($('#dropDownPVC :selected').val() !== patient.catheterPosition.toString()) {
                        console.log($('#dropDownPVC :selected').val());
                        console.log(patient.catheterPosition.toString());
                            errorsInputCatheter++;
                            allErrors++;
                            console.log("PVC selected: Wrong dropDown");
                        }
                    }

                }

                deleteInput();
                disableInputFields();

                console.log("Errors Input Catheter: " + errorsInputCatheter);

                interruptionLength = currentTrial.catheter;

                console.log(clickOKCatheter);

                if (buttonID === 3) {
                    buttonID = 4;
                    if (interruptionLength !== 0) {
                        sendInterruption(interruptionLength);
                        catheterInterrupted = true;
                        patientInfoInterrupted, medicationInterrupted, RTInterrupted, tubeInterrupted, positioningInterrupted = false;
                    } else {
                        resetInterruptionInfo();
                    }
                }

                setTimeout(function () {
                    getTrialInfo();
                    jsonObj.push({
                        participantNumber: metaInfo.ParticipantNumber,
                        block: block,
                        device: metaInfo.Device,
                        interruptionTrial: interruption,
                        sichtbarkeit: currentsichtbarkeit,
                        trial: trial,
                        time: timestampBaselineCatheter,
                        timeInt: timestampBaselineCatheterInt,
                        timeResumptionError: 0,
                        patientID: patientID,
                        module: module,
                        errorsModule: errorsModule,
                        errorsInput: errorsInputCatheter,
                        errorsEmptyModule: errorsEmptyModule,
                        errorCountInterruption: localStorage["errorCountInterruption"],
                        interruptionLength: interruptionLength,
                        clickOnOK: clickOKCatheter,
                        clickOnOKInt: clickOKCatheterInt,
                        startTimeIT: localStorage["startInterruption"],
                        endTimeIT: localStorage["endTimeInt"],
                        startTimeInteger: localStorage["startInterruptionInteger"],
                        endTimeInteger: localStorage["endTimeInteger"],
                        hololensCueType: expConfig.hololensCueType,
                        cueSetDuration: localStorage["cueSetDuration"],
                        firstFocus: localStorage["firstFocusAfterEnableModule"],
                        firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
                    });

                    resetErrors();
                    errorsInputCatheter = 0;
                }, (interruptionLength * 1000) + 700);


            } else if (buttonpressed === "okTube") {

                module = "Tube";

                var now = new Date();
                clickOKTube = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                clickOKTubeInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

                // Check empty module
                if (!$("input[name='tubeRadio']").is(":checked")) {
                    errorsEmptyModule++;
                    allErrors++;
                    console.log("Empty Module Tube");

                } else {
                    // Check if right option is selected
                    if ($("#checkTube1").is(":checked")) {
                        if ("Stomach tube" !== patient.tubeDescription.toString()) {
                            if ($('#dropDownTube1 :selected').val() !== patient.tubeType.toString()) {
                                errorsInputTube++;
                                allErrors++;
                                console.log("Wrong Tube selected (Stomach Tube) -> Wrong DropDown");
                            }
                            errorsInputTube++;
                            allErrors++;
                            console.log("Wrong Tube selected (Stomach Tube)");
                        } else if ("Stomach tube" === patient.tubeDescription.toString()) {
                            if ($('#dropDownTube1 :selected').val() === "") {
                                errorsInputTube++;
                                allErrors++;
                                console.log("If Stomach Tube selected: empty DropDown!");
                            }
                            if ($('#dropDownTube1 :selected').val() !== patient.tubeType.toString()) {
                                errorsInputTube++;
                                allErrors++;
                                console.log("If Stomach Tube selected: wrong DropDown!");
                            }
                        }
                    } else if ($("#checkTube2").is(":checked")) {
                        if ("Temperature tube" !== patient.tubeDescription.toString()) {
                            if ($('#dropDownTube2 :selected').val() !== patient.tubeType.toString()) {
                                errorsInputTube++;
                                allErrors++;
                                console.log("Wrong Tube selected (Temperature Tube) -> Wrong DropDown");
                            }
                            errorsInputTube++;
                            allErrors++;
                            console.log("Wrong Tube selected (Temperature Tube)");
                        } else if ("Temperature tube" === patient.tubeDescription.toString()) {
                            if ($('#dropDownTube2 :selected').val() === "") {
                                errorsInputTube++;
                                allErrors++;
                                console.log("If Temperature Tube selected: empty DropDown!");
                            }
                            if ($('#dropDownTube2 :selected').val() !== patient.tubeType.toString()) {
                                errorsInputTube++;
                                allErrors++;
                                console.log("If Temperature Tube selected: wrong DropDown!");
                            }
                        }
                    } else if ($("#checkTube3").is(":checked")) {
                        if ("TEE-tube" !== patient.tubeDescription.toString()) {
                            if ($('#dropDownTube3 :selected').val() !== patient.tubeType.toString()) {
                                errorsInputTube++;
                                allErrors++;
                                console.log("Wrong Tube selected (TEE-Tube) -> Wrong DropDown");
                            }
                            errorsInputTube++;
                            allErrors++;
                            console.log("Wrong Tube selected (TEE-Tube)");
                        } else if ("TEE-tube" === patient.tubeDescription.toString()) {
                            if ($('#dropDownTube3 :selected').val() === "") {
                                errorsInputTube++;
                                allErrors++;
                                console.log("If TEE-Tube selected: empty DropDown!");
                            }
                            if ($('#dropDownTube3 :selected').val() !== patient.tubeType.toString()) {
                                errorsInputTube++;
                                allErrors++;
                                console.log("If TEE-Tube selected: wrong DropDown!");
                            }
                        }
                    }

                    // Check time input
                    if ($("#timeTube").val() !== patient.tubeTime.toString()) {
                        errorsInputTube++;
                        allErrors++;
                        console.log("Wrong Time Tube");
                    }
                }

                deleteInput();
                disableInputFields();

                console.log("Errors Input Tube: " + errorsInputTube);

                interruptionLength = currentTrial.tube;

                console.log(clickOKTube);

                if (buttonID === 4) {
                    buttonID = 5;
                    if (interruptionLength !== 0) {
                        sendInterruption(interruptionLength);
                        tubeInterrupted = true;
                        patientInfoInterrupted, medicationInterrupted, RTInterrupted, catheterInterrupted, positioningInterrupted = false;
                    } else {
                        resetInterruptionInfo();
                    }
                }

                setTimeout(function () {
                    getTrialInfo();
                    jsonObj.push({
                        participantNumber: metaInfo.ParticipantNumber,
                        block: block,
                        device: metaInfo.Device,
                        interruptionTrial: interruption,
                        sichtbarkeit: currentsichtbarkeit,
                        trial: trial,
                        time: timestampBaselineTube,
                        timeInt: timestampBaselineTubeInt,
                        timeResumptionError: 0,
                        patientID: patientID,
                        module: module,
                        errorsModule: errorsModule,
                        errorsInput: errorsInputTube,
                        errorsEmptyModule: errorsEmptyModule,
                        errorCountInterruption: localStorage["errorCountInterruption"],
                        interruptionLength: interruptionLength,
                        clickOnOK: clickOKTube,
                        clickOnOKInt: clickOKTubeInt,
                        startTimeIT: localStorage["startInterruption"],
                        endTimeIT: localStorage["endTimeInt"],
                        startTimeInteger: localStorage["startInterruptionInteger"],
                        endTimeInteger: localStorage["endTimeInteger"],
                        hololensCueType: expConfig.hololensCueType,
                        cueSetDuration: localStorage["cueSetDuration"],
                        firstFocus: localStorage["firstFocusAfterEnableModule"],
                        firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
                    });

                    resetErrors();
                    errorsInputTube = 0;
                }, (interruptionLength * 1000) + 700);


            } else if (buttonpressed === "okPositioning") {

                module = "Positioning";

                var now = new Date();
                clickOKPositioning = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                clickOKPositioningInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

                // Check empty module
                if (!$("input[name='posRadio'], input[name='headRadio'], input[name='trunkRadio']").is(":checked")) {
                    errorsEmptyModule++;
                    allErrors++;
                    console.log("Empty Module Positioning");

                } else {
                    if ($("#supinePos").is(":checked")) {
                        if ("Supine position" !== patient.positioningMain.toString()) {
                            errorsInputPositioning++;
                            allErrors++;
                            console.log("Wrong radio button (supine)");
                        }
                    } else if ($("#torsoHigh").is(":checked")) {
                        if ("Torso high" !== patient.positioningMain.toString()) {
                            errorsInputPositioning++;
                            allErrors++;
                            console.log("Wrong radio button (torsoHigh)");
                        }
                    } else if ($("#torsoLow").is(":checked")) {
                        if ("Torso low" !== patient.positioningMain.toString()) {
                            errorsInputPositioning++;
                            allErrors++;
                            console.log("Wrong radio button (torsoLow)");
                        }
                    } else if ($("#stomach").is(":checked")) {
                        if ("Stomach" !== patient.positioningMain.toString()) {
                            errorsInputPositioning++;
                            allErrors++;
                            console.log("Wrong radio button (stomach)");
                        }
                    }

                    if ($("#foamShell").is(":checked")) {
                        if ("In foam shell" !== patient.positioningHead.toString()) {
                            errorsInputPositioning++;
                            allErrors++;
                            console.log("Wrong radio button (foam)");
                        }
                    } else if ($("#gelRing").is(":checked")) {
                        if ("On gel ring" !== patient.positioningHead.toString()) {
                            errorsInputPositioning++;
                            allErrors++;
                            console.log("Wrong radio button (gelRing)");
                        }
                    }

                    if ($("#spineOrtho").is(":checked")) {
                        if ("Spine orthograde" !== patient.positioningTrunk.toString()) {
                            errorsInputPositioning++;
                            allErrors++;
                            console.log("Wrong radio button (spineOrtho)");
                        }
                    } else if ($("#shoulderSupport").is(":checked")) {
                        if ("Shoulder support" !== patient.positioningTrunk.toString()) {
                            errorsInputPositioning++;
                            allErrors++;
                            console.log("Wrong radio button (shoulder)");
                        }
                    }

                    if (!$("input[name='posRadio']").is(":checked")) {
                        errorsInputPositioning++;
                        console.log("Main not selected");
                    }

                    if (!$("input[name='headRadio']").is(":checked")) {
                        errorsInputPositioning++;
                        console.log("Head not selected");
                    }

                    if (!$("input[name='trunkRadio']").is(":checked")) {
                        errorsInputPositioning++;
                        console.log("Trunk not selected");
                    }

                }



                deleteInput();
                disableInputFields();

                console.log("Errors Input Positioning: " + errorsInputPositioning);

                interruptionLength = currentTrial.positioning;

                if (buttonID === 5) {
                    buttonID = 6;
                    if (interruptionLength !== 0) {
                        sendInterruption(interruptionLength);
                        positioningInterrupted = true;
                        patientInfoInterrupted, medicationInterrupted, RTInterrupted, catheterInterrupted, tubeInterrupted = false;
                        timeout = (interruptionLength * 1000) + 700;
                    } else {
                        resetInterruptionInfo();
                        timeout = 100;
                    }
                }

                setTimeout(function () {
                    getTrialInfo();
                    jsonObj.push({
                        participantNumber: metaInfo.ParticipantNumber,
                        block: block,
                        device: metaInfo.Device,
                        interruptionTrial: interruption,
                        sichtbarkeit: currentsichtbarkeit,
                        trial: trial,
                        time: timestampBaselinePositioning,
                        timeInt: timestampBaselinePositioningInt,
                        timeResumptionError: 0,
                        patientID: patientID,
                        module: module,
                        errorsInput: errorsInputPositioning,
                        errorsEmptyModule: errorsEmptyModule,
                        errorsModule: errorsModule,
                        errorCountInterruption: localStorage["errorCountInterruption"],
                        interruptionLength: interruptionLength,
                        clickOnOK: clickOKPositioning,
                        clickOnOKInt: clickOKPositioningInt,
                        startTimeIT: localStorage["startInterruption"],
                        endTimeIT: localStorage["endTimeInt"],
                        startTimeInteger: localStorage["startInterruptionInteger"],
                        endTimeInteger: localStorage["endTimeInteger"],
                        hololensCueType: expConfig.hololensCueType,
                        cueSetDuration: localStorage["cueSetDuration"],
                        firstFocus: localStorage["firstFocusAfterEnableModule"],
                        firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
                    });

                    resetErrors();
                    errorsInputPositioning = 0;
                }, timeout);


                $("#processButton").prop("disabled", false);

            }

        });
    });

    // [WIP] Desperate try to refactor
    function setJsonObjValuesShort(time, timeInt, timeResumptionError, errorsInput, errorsEmptyModule, interruptionLength, clickOnOk, clickOnOkInt)
    {
        jsonObj.push({
            participantNumber: metaInfo.ParticipantNumber,
            block: block,
            device: metaInfo.Device,
            interruptionTrial: interruption,
            sichtbarkeit: currentsichtbarkeit,
            trial: trial,
            time: time,
            timeInt: timeInt,
            timeResumptionError: timeResumptionError,
            patientID: patientID,
            module: module,
            errorsInput: errorsInput,
            errorsEmptyModule: errorsEmptyModule,
            errorsModule: errorsModule,
            errorCountInterruption: localStorage["errorCountInterruption"],
            interruptionLength: interruptionLength,
            clickOnOK: clickOnOk,
            hololensCueType: expConfig.hololensCueType,
            cueSetDuration: localStorage["cueSetDuration"],
            firstFocus: localStorage["firstFocusAfterEnableModule"],
            firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
        })
    }

    // [WIP] Desperate try to refactor
    function setJsonObjValues(time, timeInt, timeResumptionError, errorsInput, errorsEmptyModule, interruptionLength, clickOnOk, clickOnOkInt)
    {
        jsonObj.push({
            participantNumber: metaInfo.ParticipantNumber,
            block: block,
            device: metaInfo.Device,
            interruptionTrial: interruption,
            sichtbarkeit: currentsichtbarkeit,
            trial: trial,
            time: time,
            timeInt: timeInt,
            timeResumptionError: timeResumptionError,
            patientID: patientID,
            module: module,
            errorsInput: errorsInput,
            errorsEmptyModule: errorsEmptyModule,
            errorsModule: errorsModule,
            errorCountInterruption: localStorage["errorCountInterruption"],
            interruptionLength: interruptionLength,
            clickOnOK: clickOnOk,
            clickOnOKInt: clickOnOkInt,
            startTimeIT: localStorage["startInterruption"],
            endTimeIT: localStorage["endTimeInt"],
            startTimeInteger: localStorage["startInterruptionInteger"],
            endTimeInteger: localStorage["endTimeInteger"],
            hololensCueType: expConfig.hololensCueType,
            cueSetDuration: localStorage["cueSetDuration"],
            firstFocus: localStorage["firstFocusAfterEnableModule"],
            firstFocusInt: localStorage["firstFocusAfterEnableModuleInt"]
        })
    }

    function hideCueOnHololens() {

        // send Message to hololens, that the correct module was enabled and the cue shall be disabled
        let cont = {}
        cont.correctModuleEnabled = "true"

        WS.sendToLens(JSON.stringify(cont))
    }

    // Enables editing when edit button is clicked and shows error message
    $("#editPatientInformation").click(function () {
        if (buttonID !== 0) {
            $("#error1").css('visibility', 'visible');
            setTimeout(function () {
                $("#error1").css('visibility', 'hidden');
            }, 1000);

            errorsModule = 1;
            allErrors++;

            if (patientInfoInterrupted || medicationInterrupted || RTInterrupted || catheterInterrupted || tubeInterrupted || positioningInterrupted) {
                var now = new Date();
                timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);
                wrongClickAfterInterruption = 1;
            }

            getTrialInfo();
            module = "Patient Information";

            var now = new Date();
            timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
            timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

            addToJSON();
            resetErrors();

            return;
        }
        $("#patientTop, #okPatientInformation").css("background-color", "var(--main-color");
        $("#height, #weight, #checkAllergies1, #checkAllergies2, #checkAllergies3, #checkAllergiesInput, #allergiesInput").prop("disabled", false);

        var now = new Date();
        timestampBaselinePatientInfo = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
            .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
        timestampBaselinePatientInfoInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

        // Since there cannot be an interruption after clicking "process", no cue can be present here
        // hideCueOnHololens()
    });

    $("#editMedication").click(function () {
        if (buttonID !== 1) {
            $("#error2").css('visibility', 'visible');
            setTimeout(function () {
                $("#error2").css('visibility', 'hidden');
            }, 1000);

            errorsModule = 1;
            allErrors++;

            if (medicationInterrupted || RTInterrupted || catheterInterrupted || tubeInterrupted || positioningInterrupted) {
                var now = new Date();
                timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);
                wrongClickAfterInterruption = 1;
            }

            getTrialInfo();
            module = "Medication";

            var now = new Date();
            timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
            timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

            addToJSON();
            resetErrors();

            return;
        }
        $("#medicationTop, #okMedication").css("background-color", "var(--main-color");
        $("#dropDownMedication1, #dropDownMedication2, #dropDownMedication3, #timeMedication1, #timeMedication2, #timeMedication3").prop("disabled", false);

        var now = new Date();
        timestampBaselineMedication = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
            .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
        timestampBaselineMedicationInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

        if (patientInfoInterrupted) {
            hideCueOnHololens()
        }

    });

    $("#editRT").click(function () {
        if (buttonID !== 2) {
            $("#error3").css('visibility', 'visible');
            setTimeout(function () {
                $("#error3").css('visibility', 'hidden');
            }, 1000);

            errorsModule = 1;
            allErrors++;


            if (RTInterrupted || patientInfoInterrupted || catheterInterrupted || tubeInterrupted || positioningInterrupted) {
                var now = new Date();
                timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);
                wrongClickAfterInterruption = 1;
            }

            getTrialInfo();
            module = "Respiratory Tract";

            var now = new Date();
            timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
            timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

            addToJSON();
            resetErrors();

            return;
        }
        $("#respiratoryTop, #okRT").css("background-color", "var(--main-color");
        $("#dropDownRT1, #dropDownRT2, #dropDownRT3").prop("disabled", false);

        var now = new Date();
        timestampBaselineRT = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
            .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
        timestampBaselineRTInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

        if (medicationInterrupted) {
            hideCueOnHololens()
        }

    });

    $("#editCatheter").click(function () {

        if (buttonID !== 3) {
            $("#error4").css('visibility', 'visible');
            setTimeout(function () {
                $("#error4").css('visibility', 'hidden');
            }, 1000);

            errorsModule = 1;
            allErrors++;

            if (medicationInterrupted || patientInfoInterrupted || catheterInterrupted || tubeInterrupted || positioningInterrupted) {
                var now = new Date();
                timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);
                wrongClickAfterInterruption = 1;
            }

            getTrialInfo();
            module = "Catheter";

            var now = new Date();
            timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
            timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

            addToJSON();
            resetErrors();

            return;
        }
        $("#catheterTop, #okCatheter").css("background-color", "var(--main-color");
        $("#checkArterial, #checkCVC, #checkPVC").prop("disabled", false);

        var now = new Date();
        timestampBaselineCatheter = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
            .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
        timestampBaselineCatheterInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

        if (RTInterrupted) {
            hideCueOnHololens()
        }
    });

    $("#editTube").click(function () {

        if (buttonID !== 4) {
            $("#error5").css('visibility', 'visible');
            setTimeout(function () {
                $("#error5").css('visibility', 'hidden');
            }, 1000);

            errorsModule = 1;
            allErrors++;

            if (medicationInterrupted || patientInfoInterrupted || tubeInterrupted || RTInterrupted || positioningInterrupted) {
                var now = new Date();
                timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);
                wrongClickAfterInterruption = 1;
            }

            getTrialInfo();
            module = "Tube";

            var now = new Date();
            timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
            timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

            addToJSON();
            resetErrors();

            return;
        }
        $("#tubeTop, #okTube").css("background-color", "var(--main-color");
        $("#checkTube1, #checkTube2, #checkTube3, #timeTube").prop("disabled", false);

        var now = new Date();
        timestampBaselineTube = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
            .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
        timestampBaselineTubeInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

        if (catheterInterrupted) {
            hideCueOnHololens()
        }
    });

    $("#editPositioning").click(function () {
        if (buttonID !== 5) {
            $("#error6").css('visibility', 'visible');
            setTimeout(function () {
                $("#error6").css('visibility', 'hidden');
            }, 1000);

            errorsModule = 1;
            allErrors++;

            if (medicationInterrupted || patientInfoInterrupted || catheterInterrupted || RTInterrupted || positioningInterrupted) {
                var now = new Date();
                timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                    .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
                timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);
                wrongClickAfterInterruption = 1;
            }

            getTrialInfo();
            module = "Positioning";

            var now = new Date();
            timestampResumption = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
                .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
            timestampResumptionInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

            addToJSON();
            resetErrors();

            return;

        }

        $("#positioningTop, #okPositioning").css("background-color", "var(--main-color");
        $("#supinePos, #torsoHigh, #torsoLow, #stomach, #foamShell, #gelRing, #spineOrtho, #shoulderSupport").prop("disabled", false);

        var now = new Date();
        timestampBaselinePositioning = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
            .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
        timestampBaselinePositioningInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

        if (tubeInterrupted) {
            hideCueOnHololens()
        }
    });

    // Creates and saves JSON object
    $("#processButton").each(function () {
        $(this).click(function () {
            if (currentTrial === trialsConfig.trainingsTrial) {
                processButton();

                jsonString = JSON.stringify(jsonObj);
                console.log(jsonObj);
                WS.sendCSV(jsonString);
                jsonObjCopy.push(jsonObj);
                console.log(JSON.stringify(jsonObjCopy));
                jsonObj = [];
                jsonString = "";

                let totalErrors = allErrors + localStorage["errorCountInterruption"]
                showTrainingOverlay(totalErrors.toString());
                buttonID = 0;
                resetInterruptionInfo();
                $("#processButton").prop("disabled", true);
            }
            else if (trial < trials.length)
            {
                processButton();
                jsonString = JSON.stringify(jsonObj);
                console.log(jsonObj);
                WS.sendCSV(jsonString);
                jsonObjCopy.push(jsonObj);
                console.log(JSON.stringify(jsonObjCopy));
                jsonObj = [];
                jsonString = "";
                correctAllergieSelected = 0;
                trial++;
                errorsInputPatientInfo, errorsInputMedication, errorsInputRT, errorsInputCatheter, errorsInputTube, errorsInputPositioning = 0;
                resetInterruptionInfo();
                errorsEmptyModule = 0;
                buttonID = 0;
                nextTrial++;
                currentTrial = trials[nextTrial];

                disableInputFields();
                refreshPatient();
                $("#processButton").prop("disabled", true);

                if (nextTrial === trials.length) {
                    $("#trialInfo").text((nextTrial) + "/" + trials.length + " Patients");
                } else {
                    $("#trialInfo").text((1 + nextTrial) + "/" + trials.length + " Patients");
                }

            } else {
                processButton();

                correctAllergieSelected = 0;
                //clear();
                jsonString = JSON.stringify(jsonObj);
                console.log(jsonObj);
                WS.sendCSV(jsonString);
                jsonObjCopy.push(jsonObj);
                console.log(JSON.stringify(jsonObjCopy));
                //https://json-csv.com/
                window.open("endScreen.html", "_blank");
            }
        });
    });


    // Clicked an EditButton sets firstFocus to true.
    // When firstFocus is true, then the first focus-Event of an input-module element is logged.
    let firstFocus = true

    $(".editButton").click(function()
    {
        firstFocus = true
        console.log("edit was clicked")
        return
    })

    $(".input-module").focus(function ()
    {
        if (firstFocus === false) {
            return
        }

        console.log("first Focus after edit was made.")
        firstFocus = false

        //let module = $(this).closest(".module")
        //wenn firstFocus after editButtonClick, dann speicher die Zeit weg als "firstFocusAfterEnableModule"

        var now = new Date()

        let timestampFirstFocus = (now.getHours() + ':' + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())) + ':' + ((now.getSeconds() < 10) ? ("0" + now
            .getSeconds()) : (now.getSeconds())) + ',' + now.getMilliseconds());
        let timestampFirstFocusInt = (parseFloat((now.getHours() * 3600) + (now.getMinutes() * 60) + (now.getSeconds()) + "." + now.getMilliseconds()).toFixed(3) - fixedDate).toFixed(3);

        localStorage["firstFocusAfterEnableModule"] = timestampFirstFocus
        localStorage["firstFocusAfterEnableModuleInt"] = timestampFirstFocusInt
        return
    })


});

$(document).keydown(function(e){
    if(e.which === 119){

        if (document.fullscreenElement) {
            exitFullscreen(document.documentElement)
        } else {
            enterFullscreen(document.documentElement)
        }

    }
});

function enterFullscreen(element) {
    if(element.requestFullscreen) {
        element.requestFullscreen();
    } else if(element.msRequestFullscreen) {      // for IE11 (remove June 15, 2022)
        element.msRequestFullscreen();
    } else if(element.webkitRequestFullscreen) {  // iOS Safari
        element.webkitRequestFullscreen();
    }
}

function exitFullscreen() {
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}