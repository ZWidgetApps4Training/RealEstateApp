var twilioSID = '';
var twilioAuth = '';
var twilioNumber = '';


function fetchDataFromOrg() {
    var data = { apiKeys: ["therealestate__Zylker_AuthToken"] };
    ZOHO.CRM.API.getOrgVariable(data).then(function (data) {
        console.log(data);
        if (data == undefined || data == "" || data.Success.Content == undefined || data.Success.Content == "") {
            console.log("Zillow is not configured!");
        } else {
            console.log(data.Success.Content);
            document.getElementById('ZylkerAccessToken').value = data.Success.Content;

        }
    });

    var data = { apiKeys: ["therealestate__Twilio_Account_SID", "therealestate__Twilio_AuthToken", "therealestate__Twilio_Mobile_Number"] };
    ZOHO.CRM.API.getOrgVariable(data).then(function (datas) {
        console.log(datas);
        var jsonResp = datas.Success.Content;
        console.log(jsonResp);
        console.log(jsonResp['therealestate__Twilio_Account_SID'].value);
        console.log(jsonResp);
        twilioSID = jsonResp['therealestate__Twilio_Account_SID'].value;
        twilioAuth = jsonResp['therealestate__Twilio_AuthToken'].value;
        twilioNumber = jsonResp['therealestate__Twilio_Mobile_Number'].value;

        document.getElementById('twilioSID').value = twilioSID;
        document.getElementById('twilioAuth').value = twilioAuth;
        document.getElementById('twilioNumber').value = twilioNumber;
    });

    isSignAuth();
}

function isSignAuth() {
    var connectorName = "zohosign";
    ZOHO.CRM.CONNECTOR.isConnectorAuthorized(connectorName).then(function (result) {
        console.log(result);
        if (result == "true") {
            document.getElementById('signBtn').innerHTML = 'Authorized';
            document.getElementById('signBtn').disabled = true;
        } else if (result == "false") {
            document.getElementById('signBtn').innerHTML = 'Authorize';
        }
    });
}

function dontShowAgain(){
    ZOHO.CRM.ACTION.enableAccountAccess().then(function(data){
        console.log(data);
    })
}

function noAccTwilio() {
    var link = document.getElementById("noAccount");
    var address = "https://www.twilio.com/try-twilio";
    link.href = address;
}

function twilioCredentials() {
    var link = document.getElementById("twilioCredential");
    var address = "https://console.twilio.com/?frameUrl=/console";
    link.href = address;
}

function closing() {
    console.log("close");
    ZOHO.CRM.UI.Popup.close()
        .then(function (data) {
            console.log(data);
        })
}

function enableClientPortal() {
    document.getElementById('clientPortal').style.display = "block";
    document.getElementById('home').style.display = "none";
    document.getElementById('zylker').style.display = "none";
    document.getElementById('twilio').style.display = "none";
}

function enableTwilio() {
    document.getElementById('clientPortal').style.display = "none";
    document.getElementById('home').style.display = "none";
    document.getElementById('zylker').style.display = "none";
    document.getElementById('twilio').style.display = "block";
}

function enableZylker() {
    document.getElementById('clientPortal').style.display = "none";
    document.getElementById('home').style.display = "none";
    document.getElementById('zylker').style.display = "block";
    document.getElementById('twilio').style.display = "none";
}

function updateClientName() {

    enableClientPortal();

    var connectorName = "therealestate";
    ZOHO.CRM.CONNECTOR.isConnectorAuthorized(connectorName).then(function (result) {
        console.log(result);
        if (result == "true") {
            document.getElementById('clientBtnAuth').innerHTML = 'Authorized';
            document.getElementById('clientBtnAuth').disabled = true;
            document.getElementById('ClientNameChange').style.display = "block";
            document.getElementById('isClientAuthorized').style.display = "none";

            ZOHO.CRM.CONNECTOR.invokeAPI("therealestate.getportals", {})
                .then(function (data) {
                    var portalName = JSON.parse(data['response']);
                    console.log(portalName['portals'][0]['name']);
                    document.getElementById('clientName').value = portalName['portals'][0]['name'];
                })
        } else {
            document.getElementById('clientBtnAuth').innerHTML = 'Authorize';
            document.getElementById('ClientNameChange').style.display = "none";
            document.getElementById('isClientAuthorized').style.display = "block";

        }
    });



}

function onClientSave() {
    var newClientValue = document.getElementById('clientName').value;
    console.log(newClientValue);
    var req_data = {
        "portalName": newClientValue
    };
    ZOHO.CRM.FUNCTIONS.execute("therealestate__clientportalnamechange", req_data)
        .then(function (data) {
            console.log(data['details']['output']);
            var val = JSON.parse(data['details']['output']);
            if (val['code'] == "success") {
                $('#btnTrigger').click();
                document.getElementById('sucessAndFailureResponse').innerHTML = 'Client Portal Name has been updated successfully.';
                document.getElementById('updateDowngrade').innerHTML = 'Client Portal';
            }
        })
}

function onZylkerSave() {
    var newZylker = document.getElementById('ZylkerAccessToken').value;
    console.log(newZylker);
    ZOHO.CRM.CONNECTOR.invokeAPI("crm.set", { "apiname": "therealestate__Zylker_AuthToken", "value": newZylker }).then(function (data) {
        console.log(data);
        console.log(JSON.parse(data));
        var value = JSON.parse(data);
        if (value['status_code'] == "200") {
            console.log("success");
            $('#btnTrigger').click();
            document.getElementById('sucessAndFailureResponse').innerHTML = 'Zylker Access Token has been updated successfully.';
            document.getElementById('updateDowngrade').innerHTML = 'Zylker Portal';
        }
    });
}

function back() {
    document.getElementById('clientPortal').style.display = "none";
    document.getElementById('zylker').style.display = "none";
    document.getElementById('twilio').style.display = "none";
    document.getElementById('home').style.display = "block";
}

function authorize() {
    var connectorName = "zohosign";
    ZOHO.CRM.CONNECTOR.authorize(connectorName);
    setTimeout(() => {
        isSignAuth();
    }, 5000);
}

function authorizeClient() {
    var connectorName = "therealestate";
    console.log(ZOHO.CRM.CONNECTOR.authorize(connectorName));
    setTimeout(() => {
        updateClientName();
    }, 5000);
}


function twilioSave() {

    var SID = document.getElementById('twilioSID').value;
    var Auth = document.getElementById('twilioAuth').value;
    var Num = document.getElementById('twilioNumber').value;
    console.log(SID);
    console.log(Auth);
    console.log(Num);
    if (SID == "") {
        alert("Please enter Twilio Account SID")
    }
    else if (Auth == "") {
        alert("Please enter Twilio AuthToken")
    }
    else if (Num == "") {
        alert("Please enter Twilio Mobile Number")
    }
    else {
        var str = SID + ":" + Auth;
        var encodedAuth = btoa(str);
        request = {
            url: "https://api.twilio.com/2010-04-01/Accounts/" + SID + "/IncomingPhoneNumbers.json",
            headers: {
                Authorization: "Basic " + encodedAuth,
            }
        }
        ZOHO.CRM.HTTP.get(request).then(function (data) {
            var list = JSON.parse(data);
            console.log(list);
            if (list.code == 20003) {
                alert("Please check either your entered Twilio Account SID or AuthToken is incorrect")
            } else if (list.code == 20404) {
                alert("Please check either your entered Twilio Account SID or AuthToken is incorrect")
            }
            else if (list.code == 20008) {
                alert("Resource not accessible with Test Account Credentials")
            } else if (list.first_page_uri != undefined && (list.first_page_uri != null || list.first_page_uri != "")) {
                ZOHO.CRM.CONNECTOR.invokeAPI("crm.set", { "apiname": "therealestate__Twilio_Account_SID", "value": SID }).then(function () {
                    ZOHO.CRM.CONNECTOR.invokeAPI("crm.set", { "apiname": "therealestate__Twilio_AuthToken", "value": Auth }).then(function () {
                        ZOHO.CRM.CONNECTOR.invokeAPI("crm.set", { "apiname": "therealestate__Twilio_Mobile_Number", "value": Num }).then(function (data) {
                            console.log(data);
                            var value = JSON.parse(data);
                            if (value['status_code'] == "200") {
                                console.log("success");
                                $('#btnTrigger').click();
                                document.getElementById('sucessAndFailureResponse').innerHTML = 'The data has been updated successfully.';
                                document.getElementById('updateDowngrade').innerHTML = 'Twilio Info';
                            }
                        });
                    });
                });
            }
            else {
                alert("Please check either your entered Twilio Account SID or AuthToken is incorrect");
            }

        });
    }
}

function accessZylkerApp(){
    var link = document.getElementById("accessZylkerApp");
    var address = "https://therealestate-710385233.development.catalystserverless.com/app/ZylerApp/index.html";
    link.href = address;
}
