var defaultProperties = [];
var Locality;
var Min_Buy_Budget;
var Max_Buy_Budget;
var Bedrooms;
var Bathrooms;
var Property_Interested_In;
var Size;
var Lead_Source;
var Deal_Name;
var Street;
var city;
var state;
var rate_per_sqft;
var listJsonValue;
var pageloadInfo = {};
var duplicateData = [];
var input;
var URLs = 'https://therealestate.zohoplatform.com';
var savedProperty = [];
var ownerId;
var fileArr;
var transacId;
var createContactAndPropArr = [];
var propLen;
// const promise1 = [];
// const promise2 = [];
function getCurrentPageInfo() {
    console.log(pageloadInfo);
    var getId = pageloadInfo.pageLoadData['EntityId'][0];
    ZOHO.CRM.API.getRecord({ Entity: pageloadInfo.pageLoadData.Entity, RecordID: getId })
        .then(function (datas) {
            console.log(datas);
            var data = datas.data[0];
            Min_Buy_Budget = data["Minimum_Budget"];
            Max_Buy_Budget = data["Maximum_Budget"];
            Bedrooms = data["Number_of_Bedrooms"];
            Bathrooms = data["Number_of_Bathrooms"];
            Locality = data["Locality"];
            city = data["Mailing_City"];

            Property_Interested_In = data["Property_Type"];
            Size = data["Plot_Area_in_SqFt"];
            rate_per_sqft = data["Rate_per_Unit"];
            Lead_Source = data["Lead_Source"];
            Deal_Name = "Buyer transaction for " + data["First_Name"];
            Street = data["Mailing_Street"];
            state = data["	Mailing_State"];
        })
}

function fetchJson() {
    var list = document.getElementById('listCheckBox');
    document.getElementById('noPropertyMatch').style.display = "none";

    fetch("https://therealestate-710385233.development.catalystserverless.com/app/buyerSelection.json")
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
            listJsonValue = data;
            var checkbox = "";
            for (var i = 0; i < data.length; i++) {
                checkbox = checkbox + `
            <div class="col-4 col-md-4">
            <div class="form-group form-check" ><input type='checkbox' class='form-check-input' id=${data[i].apiName} value=${data[i].apiName} name=${data[i]['name']} onChange="insertIfChecked('${data[i].apiName}')">
                            <label class="'form-check-label'" for=${data[i].apiName}>${data[i]['name']}</label> </div>     
                            </div>
                        ` ;
            }
            list.innerHTML = checkbox;
            getCurrentPageInfo();
            setTimeout(() => {

                getInfoFromProperty();
            }, 2000);
        })

    fetch("https://therealestate-710385233.development.catalystserverless.com/server/therealestate/getImageFiles").then(res => {
        return res.json();
    }).then(response => {
        console.log(response.length);
        fileArr = [];
        fileArr = response;
        console.log(fileArr);
    });

}

function gowtham() {
    console.log("save");
    savedProperty = [];
    for (var i = 0; i < defaultProperties.length; i++) {
        console.log(document.getElementById(i).checked);
        var check = document.getElementById(i).checked;
        if (check) {
            console.log(defaultProperties[i]);
            var property = defaultProperties[i];
            if (property['id'] == undefined) {
                createContactAndPropArr.push(property);
            } else {
                savedProperty.push(property['id']);
            }
        }
    }
}

function save() {
    const promise1 = [];
    onLoader();
    promise1.push(gowtham());
    Promise.all(promise1).then(async () => {
        if (createContactAndPropArr.length > 0) {
            for (var j = 0; j < createContactAndPropArr.length; j++) {
                await createContactAndProperties(createContactAndPropArr[j]);
            }
        }
        console.log("hi gowty");

        onLoader();
        console.log("hi jenny");

        console.log(savedProperty);
        var subFormArray = [];
        var promiseData = [];
        savedProperty.forEach(elements => {
            promiseData.push(ZOHO.CRM.API.getRecord({ Entity: "Products", RecordID: elements })
                .then(function (datas) {
                    console.log(datas);
                    var data = datas.data[0];
                    var subFormData = {
                        Properties: data['id'],
                        Property_Status: data['Property_Status'],
                        Property_Type: data['Property_Type'],
                        Rate_Per_Sqft: data['Rate_Per_Sqft'],
                        Total_Area_Land_in_Sqft: data['Land_Plot_Size_in_Sqft'],
                        Total_Cost_Estimate: data['Total_Cost_Estimate_including_tax_and_registration']
                    }
                    subFormArray.push(subFormData);
                }))
        })


        Promise.all(promiseData).then(() => {
            var transactionRequest = {};
            transactionRequest = {
                Deal_Name: Deal_Name,
                Closing_Date: "2022-05-24",
                Stage: "Needs Analysis",
                Contact_Name: pageloadInfo.pageLoadData['EntityId'][0],
                Transaction_For: "Buying",
                Locality: Locality,
                Property_Interested_In: Property_Interested_In,
                Number_of_Bedrooms: Bedrooms,
                Number_of_Bathrooms: Bathrooms,
                Currency: 'USD',
                "Saved_Properties_Searches": subFormArray
            }
            console.log("transactionRequest", JSON.stringify(transactionRequest));
            ZOHO.CRM.API.insertRecord({ Entity: "Deals", APIData: transactionRequest, Trigger: ["workflow", "blueprint"] }).then(function (data) {
                console.log(data.data);
                var transactionId = data.data[0]['details']['id'];
                transacId = transactionId;
                var promises = [];
                // use promise all tomm 
                savedProperty.forEach(element => {
                    promises.push(ZOHO.CRM.API.updateRelatedRecords({ Entity: "Deals", RecordID: transactionId, RelatedList: "Products", RelatedRecordID: element, APIData: {} })
                        .then(function (data) {
                            console.log(data);
                        })
                    );
                });

                Promise.all(promises).then(() => {
                    offLoader();
                    console.log("last");

                    document.getElementById('container').style.opacity = "0.5";
                    $('#btnTrigger').click();
                    document.getElementById('sucessAndFailureResponse').innerHTML = 'Transaction has been created and selected properties are associated against the transaction record. Click <a id="idClick" href="" onclick="here()" target="_blank">here</a> to view transaction details. ' + transactionId;
                    document.getElementById('updateDowngrade').innerHTML = 'Find Seller';
                })
            });
        })

    })
}

function openAlert(msgTobeDisplayed) {
    $(".notify").toggleClass("actives");
    document.getElementById('notifyType').innerHTML = msgTobeDisplayed;
}

function closeAlert() {
    $(".notify").removeClass("actives");
}


async function createContactAndProperties(property) {
    // create a contact if the propery is not present inside the propoerty module and then create a property
    // var street = property['Address_Line_1'] + " " + property['Address_Line_2'] + " " + property['Address_Line_3'];
    // var contacts = {
    //     "Lead_Source": "Partner",
    //     "Last_Name": JSON.parse(property['Owner'])['name'],
    //     "Email": JSON.parse(property['Owner'])['email'],
    //     "Contact_Type": "Seller",
    //     "Preferred_Time_to_Contact": "2022-06-24T03:24:39+05:30",
    //     "Seller_Contact_Type": "Individual Owner",
    //     "Property_For": "Sell",
    //     "Property_Type": property['Property_Type'],
    //     "Number_of_Bedrooms": property['Number_of_Bedrooms'],
    //     "Number_of_Bathrooms": property['Number_of_Bathrooms'],
    //     "Locality": property['Locality'],
    //     "Rate_per_Unit": property['Rate_Per_Sqft'],
    //     "Floor_Number": property['Number_of_Floors'],
    //     "Plot_Area_in_SqFt": property['Land_Plot_Size_in_Sqft'],
    //     "Mailing_Street": street,
    //     "Mailing_State": property['State'],
    //     "Mailing_Country": property['Country'],
    //     "Mailing_City": property['City'],
    //     "Mailing_Zip": property['Zip'],
    //     "Other_City": property['City'],
    //     "Other_Country": property['Country'],
    //     "Other_State": property['State'],
    //     "Other_Street": street,
    //     "Other_Zip": property['Zip']
    // }
    // await ZOHO.CRM.API.insertRecord({ Entity: "Contacts", APIData: contacts, Trigger: ["workflow"] }).then(async function (data) {
    //     console.log(data.data);
    //     if (data.data[0]['code'] == 'SUCCESS') {
    var productRequest = {
        Seller_Name: "4507311000000140793",
        Product_Name: property['Product_Name'],
        Property_Type: property['Property_Type'],
        Product_Active: property['Product_Active'],
        Property_For: property['Property_For'],
        Address_Line_1: property['Address_Line_1'],
        Address_Line_2: property['Address_Line_2'],
        Address_Line_3: property['Address_Line_3'],
        Property_Status: "Open For Sales",
        City: property['City'],
        Locality: property['Locality'],
        Country: property['Country'],
        State: property['State'],
        Zip: property['Zip'],
        Number_of_Bathrooms: property['Number_of_Bathrooms'],
        Number_of_Bedrooms: property['Number_of_Bedrooms'],
        Year_Built: property['Year_Built'],
        Property_Condition: property['Property_Condition'],
        Rate_Per_Sqft: property['Rate_Per_Sqft'],
        Number_of_Floors: property['Number_of_Floors'],
        Land_Plot_Size_in_Sqft: property['Land_Plot_Size_in_Sqft'],
        Latitude: property['Latitude'],
        Longitude: property['Longitude'],
    }
    await ZOHO.CRM.API.insertRecord({ Entity: "Products", APIData: productRequest, Trigger: ["workflow"] }).then(async function (data) {
        console.log(data);
        if (data.data[0]['code'] == 'SUCCESS') {

            var config = {
                Entity: "Products",
                APIData: {
                    "id": data.data[0]['details']['id'],
                    Product_Code: "Zylker_" + data.data[0]['details']['id']
                },
                Trigger: ["workflow"]
            }
            await ZOHO.CRM.API.updateRecord(config)
                .then(function (data) {
                    console.log(data)
                })
            savedProperty.push(data.data[0]['details']['id']);

            var imgId = property['imageFolderId'];
            fetch("https://therealestate-710385233.development.catalystserverless.com/server/therealestate/getImagesUsingFolderId/" + imgId).then(data => {
                return data.json();
            }).then(res => {
                fileArr = [];
                fileArr = res;
                for (var i = 0; i < fileArr.length; i++) {
                    var filename;
                    var blob = new Blob([new Uint8Array(fileArr[i]['data'])]);
                    console.log(blob);
                    filename = "File_" + i + ".jpeg";
                    ZOHO.CRM.API.attachFile({
                        Entity: "Products",
                        RecordID: data.data[0]['details']['id'],
                        File: {
                            Name: filename,
                            Content: blob
                        }
                    }).then(function (result) {
                        console.log("Gowtham!");
                        console.log(result);
                    });
                }
            });
        }
        console.log(savedProperty);
    });
    // }
    // });
}

function saveBtn() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
    var flag = 0;
    for (var i = 0; i < defaultProperties.length; i++) {
        console.log(document.getElementById(i).checked);
        var check = document.getElementById(i).checked;
        if (check) { } else {
            flag++;
        }
    }
    if (flag == defaultProperties.length) {
        openAlert("Select atleast one property to save."); console.log("select any one");
        setTimeout(() => {
            closeAlert();
        }, 2000);
    } else {
        save();
    }
}

function here() {
    console.log(transacId);
    var link = document.getElementById("idClick");
    var address = "https://therealestate.zohoplatform.com/crm/tab/Potentials/" + transacId;
    link.href = address;
}

function okay() {
    document.getElementById('container').style.opacity = "1";

    ZOHO.CRM.UI.Popup.closeReload()
        .then(function (data) {
            console.log(data);
        })
}

function search() {
    var arr = [];
    onLoader();
    for (var i = 0; i < listJsonValue.length; i++) {
        var ifTrue = document.getElementById(listJsonValue[i]['apiName']).checked;
        if (ifTrue) {
            arr.push({
                name: listJsonValue[i]['name'],
                apiName: listJsonValue[i]['apiName'],
                value: eval(listJsonValue[i]['variableName'])
            })
        }
    }
    var queryString = "";
    for (var i = 0; i < arr.length; i++) {
        queryString = queryString + '(';
    }

    for (var i = 0; i < arr.length; i++) {
        if (arr.length == 1) {
            queryString = queryString + arr[i]['apiName'] + ":equals:" + arr[i]['value'] + ")";
        } else {
            if (i == 0) {
                queryString = queryString + arr[i]['apiName'] + ":equals:" + arr[i]['value'] + ")and(";
            } else if (i != arr.length - 1) {
                queryString = queryString + arr[i]['apiName'] + ":equals:" + arr[i]['value'] + "))and(";
            } else {
                queryString = queryString + arr[i]['apiName'] + ":equals:" + arr[i]['value'] + "))";
            }
        }
    }
    console.log(queryString);
    defaultProperties = [];
    ZOHO.CRM.API.searchRecord({ Entity: "Products", Type: "criteria", Query: queryString })
        .then(function (data) {
            //offLoader();
            console.log(data.data);
            var newArr = [];
            newArr = data.data;
            if (newArr == undefined) {
                document.getElementById('noPropertyMatch').style.display = "block";
                offLoader();
            } else if (newArr.length > 0) {
                newArr.forEach(element => {
                    if ((element['Property_Status'] == 'Open For Sales' || element['Open For Sales'] == 'Open For Rent')) {
                        defaultProperties.push(element);
                    }
                });
                if (defaultProperties.length == 0) {
                    document.getElementById('noPropertyMatch').style.display = "block";
                    offLoader();
                } else {
                    propLen = defaultProperties.length;
                    dynamicTable(defaultProperties,'search');
                    document.getElementById('noPropertyMatch').style.display = "none";
                }
            }
        })
}

function tryInZillow() {
    onLoader();
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
    fetch("https://therealestate-710385233.development.catalystserverless.com/server/therealestate/getlistOfProperties").then(response => {
        return response.json();
    }).then(data1 => {
        document.getElementById('zylkerBtn').disabled = true;
        document.getElementById('zylkerBtn').style.opacity = "0.5";

        document.getElementById('searchProp').disabled = true;
        document.getElementById('searchProp').style.opacity = "0.5";
        console.log(defaultProperties);
        console.log(Bathrooms);
        console.log(Bedrooms);
        console.log(city);
        console.log(Locality);
        var zillowProperties = data1;

        var arr = [];
        for (var i = 0; i < listJsonValue.length; i++) {
            var ifTrue = document.getElementById(listJsonValue[i]['apiName']).checked;
            if (ifTrue) {
                arr.push({
                    name: listJsonValue[i]['name'],
                    apiName: listJsonValue[i]['apiName'],
                    value: eval(listJsonValue[i]['variableName'])
                })
            }
        }
        console.log(arr);
        console.log(zillowProperties);

        zillowProperties.forEach(element => {
            var bool = true;
            for (var i = 0; i < arr.length; i++) {
                console.log(arr[i]['apiName'] + "----" + element[arr[i]['apiName']] + "----" + arr[i]['value']);
                if (element[arr[i]['apiName']] == arr[i]['value']) {
                    bool = bool && true;
                } else {
                    bool = bool && false;
                }
            }
            console.log(bool);
            if (bool) {
                defaultProperties.push(element);
            }
        });
        if (defaultProperties != undefined) {
            dynamicTable(defaultProperties,'zylker');
        } else {
            document.getElementById('noPropertyMatch').style.display = "none";
        }
    });
}

function insertIfChecked(id) {
    console.log(document.getElementById(id).checked);
    document.getElementById('zylkerBtn').disabled = false;
    document.getElementById('zylkerBtn').style.opacity = "1";

    document.getElementById('searchProp').disabled = false;
    document.getElementById('searchProp').style.opacity = "1";
}



function getInfoFromProperty() {
    document.getElementById('Locality').checked = true;
    document.getElementById('City').checked = true;
    document.getElementById('Number_of_Bedrooms').checked = true;
    document.getElementById('Number_of_Bathrooms').checked = true;
    search();
}

function onLoader() {
    document.getElementById('loadings').style.display = 'block';
    document.getElementById('container').style.opacity = '0.2';

}

function offLoader() {
    document.getElementById('loadings').style.display = 'none';
    document.getElementById('container').style.opacity = '1';
}

async function dynamicTable(defaultProperties,module) {
    var downhead = document.getElementById('propertiesHead');
    var row = `<tr> <th></th>
       <th>Property Name</th>
       <th>Property Img</th>
       <th>No of Bedrooms</th>
       <th>No of Bathrooms</th>
       <th>Rate per sqft</th>
       <th>Property Status</th>
        </tr>`
    downhead.innerHTML = row;

    var downtable = document.getElementById('propertiesBody');
    var body = '';
    var imgUrls = '';
    if (defaultProperties != undefined) {
        for (var i = 0; i < defaultProperties.length; i++) {
            if (defaultProperties[i]['id'] != undefined) {
                imgUrls = await getSpecificAttachmentImage(defaultProperties[i]['id'], i);
            }
            body = body + `<tr id=${"tr"+i}> 
           <td><input type='checkbox' class='form-check-input' style="margin-top: 1.7rem;" id=${i}></td> 
           <td ><a style="cursor: pointer;color: #007bff !important;" onclick="getSpecificDetailInfo(${i});"> ${defaultProperties[i]['Product_Name'] != null ? defaultProperties[i]['Product_Name'] : defaultProperties[i]['Product_Name']} </a> </td>
           <td>
                 <div class="image-cropper">
                      <img src="${defaultProperties[i]['Property_Images'] != null ? URLs + defaultProperties[i]['Property_Images'][0]['preview_Url'] : defaultProperties[i]['imgUrl'] == undefined ? imgUrls : defaultProperties[i]['imgUrl']}" class='rounded' />
                 </div>
           </td>
           <td>${defaultProperties[i]['Number_of_Bedrooms'] == null ? 'NA' : defaultProperties[i]['Number_of_Bedrooms']}</td>
           <td>${defaultProperties[i]['Number_of_Bathrooms'] == null ? 'NA' : defaultProperties[i]['Number_of_Bathrooms']}</td>
           <td>${defaultProperties[i]['Rate_Per_Sqft']}</td>
           <td>${defaultProperties[i]['Property_Status']}</td>
           </tr>`
        }
        offLoader();
        downtable.innerHTML = body;
        console.log("before len "+propLen);
        var newDefProp = defaultProperties.length;
        console.log("after len "+newDefProp);
        if(module == 'zylker'){
            for (var i = propLen; i < newDefProp; i++) {
                var ids =  "tr"+i;
                document.getElementById(ids).style.backgroundColor = "rgb(214, 234, 248)";
            }
        }
    }

}

function closing() {
    document.getElementById('container').style.opacity = "1";
}

function getSpecificDetailInfo(index) {
    $('#propertyInfoTrigger').click();
    $('.carousel').carousel({
        interval: 2000
    });
    onLoader();
    document.getElementById('container').style.opacity = "0.5";
    document.getElementById('PropertyInfoHeading').innerHTML = 'Property Details';
    var selectedProperty = defaultProperties[index];
    if (selectedProperty['id'] == undefined) {
        fetch("https://therealestate-710385233.development.catalystserverless.com/server/therealestate/getImagesUsingFolderId/" + selectedProperty['imageFolderId']).then(data => {
            return data.json();
        }).then(res => {
            var imgArr = [];
            var fileArr = [];
            fileArr = res;
            for (var i = 0; i < fileArr.length; i++) {
                var blob = new Blob([new Uint8Array(fileArr[i]['data'])]);
                var objectURL = URL.createObjectURL(blob);
                console.log(objectURL);
                imgArr.push(objectURL);
            }
            offLoader();
            var newImg = `
            <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
            <ol class="carousel-indicators">`
            var indicator = "";
            for (var i = 0; i < imgArr.length; i++) {
                indicator = indicator + `<li data-target="#carouselExampleIndicators" data-slide-to="${i}" class="${i == 0 ? "active" : ""}"></li>`
            }
            newImg = newImg + indicator + `</ol>
            <div class="carousel-inner">
            `
            var imgs = "";
            for (var i = 0; i < imgArr.length; i++) {
                imgs = imgs + ` <div  class="${i == 0 ? "active carousel-item" : "carousel-item"}">
                <img class="d-block imgStyle"  src="${imgArr[i]}" alt="First slide">
              </div>`
            }
            newImg = newImg + imgs;
            newImg = newImg + `</div>
            <a class="carousel-control-prev" style="filter: invert(100%);" href="#carouselExampleIndicators" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" style="filter: invert(100%);" href="#carouselExampleIndicators" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>
            `
            document.getElementById('propertyImg').innerHTML = newImg;


            var downhead = document.getElementById('selectedHead');
            var row = `<tr> 
       <th>Property Data</th>
       <th>Property Info</th>
        </tr>`
            downhead.innerHTML = row;
            var downtable = document.getElementById('selectedBody');
            var body = '';
            if (selectedProperty != undefined) {
                body = body + `
            <tr> <td>Property Name</td> <td>${selectedProperty['Product_Name'] != null ? selectedProperty['Product_Name'] : 'NA'}</td> </tr>
            <tr> <td>Seller Name</td> <td>${selectedProperty['Seller_Name'] != null ? selectedProperty['Seller_Name']['name'] : JSON.parse(selectedProperty['Owner'])['name']}</td> </tr>
            <tr> <td>Property Type</td> <td>${selectedProperty['Property_Type'] != null ? selectedProperty['Property_Type'] : 'NA'}</td> </tr>
            <tr> <td>No of Bedrooms</td> <td>${selectedProperty['Number_of_Bedrooms'] != null ? selectedProperty['Number_of_Bedrooms'] : 'NA'}</td> </tr>
            <tr> <td>No of Bathrooms</td> <td>${selectedProperty['Number_of_Bathrooms'] != null ? selectedProperty['Number_of_Bathrooms'] : 'NA'}</td> </tr>
            <tr> <td>Property Status</td> <td>${selectedProperty['Property_Status']}</td> </tr>
            <tr> <td>Locality</td> <td>${selectedProperty['Locality']}</td> </tr>
            <tr> <td>Rate Per Sqft</td> <td>${selectedProperty['Rate_Per_Sqft']}</td> </tr>
            <tr> <td>Total Estimate Cost</td> <td>$ ${numberWithCommas(selectedProperty['Total_Cost_Estimate_including_tax_and_registration'])}</td> </tr>
            `
                downtable.innerHTML = body;
            }
            $('.carousel').carousel({
                interval: 2000
            });
        })
    } else {

        ZOHO.CRM.API.getRelatedRecords({ Entity: "Products", RecordID: selectedProperty['id'], RelatedList: "Attachments", page: 1, per_page: 200 })
            .then(function (data) {
                console.log(data.data);
                console.log(index);
                offLoader();
                var getAttachments = data.data;
                var newImg = `
            <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
            <ol class="carousel-indicators">`
                var indicator = "";
                for (var i = 0; i < getAttachments.length; i++) {
                    indicator = indicator + `<li data-target="#carouselExampleIndicators" data-slide-to="${i}" class="${i == 0 ? "active" : ""}"></li>`
                }
                newImg = newImg + indicator + `</ol>
            <div class="carousel-inner">
            `
                var imgs = "";
                for (var i = 0; i < getAttachments.length; i++) {
                    imgs = imgs + ` <div  class="${i == 0 ? "active carousel-item" : "carousel-item"}">
                <img class="d-block imgStyle"  src="${URLs + getAttachments[i]['$previewUrl']}" alt="First slide">
              </div>`
                }
                newImg = newImg + imgs;
                newImg = newImg + `</div>
            <a class="carousel-control-prev" style="filter: invert(100%);" href="#carouselExampleIndicators" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" style="filter: invert(100%);" href="#carouselExampleIndicators" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>
            `
                document.getElementById('propertyImg').innerHTML = newImg;


                var downhead = document.getElementById('selectedHead');
                var row = `<tr> 
       <th>Property Data</th>
       <th>Property Info</th>
        </tr>`
                downhead.innerHTML = row;
                var downtable = document.getElementById('selectedBody');
                var body = '';
                if (selectedProperty != undefined) {
                    body = body + `
            <tr> <td>Property Name</td> <td>${selectedProperty['Product_Name'] != null ? selectedProperty['Product_Name'] : 'NA'}</td> </tr>
            <tr> <td>Seller Name</td> <td>${selectedProperty['Seller_Name'] != null ? selectedProperty['Seller_Name']['name'] : JSON.parse(selectedProperty['Owner'])['name']}</td> </tr>
            <tr> <td>Property Type</td> <td>${selectedProperty['Property_Type'] != null ? selectedProperty['Property_Type'] : 'NA'}</td> </tr>
            <tr> <td>No of Bedrooms</td> <td>${selectedProperty['Number_of_Bedrooms'] != null ? selectedProperty['Number_of_Bedrooms'] : 'NA'}</td> </tr>
            <tr> <td>No of Bathrooms</td> <td>${selectedProperty['Number_of_Bathrooms'] != null ? selectedProperty['Number_of_Bathrooms'] : 'NA'}</td> </tr>
            <tr> <td>Property Status</td> <td>${selectedProperty['Property_Status']}</td> </tr>
            <tr> <td>Locality</td> <td>${selectedProperty['Locality']}</td> </tr>
            <tr> <td>Rate Per Sqft</td> <td>${selectedProperty['Rate_Per_Sqft']}</td> </tr>
            <tr> <td>Total Estimate Cost</td> <td>$ ${numberWithCommas(selectedProperty['Total_Cost_Estimate_including_tax_and_registration'])}</td> </tr>
            `
                    downtable.innerHTML = body;
                }
                $('.carousel').carousel({
                    interval: 2000
                });
            })

    }


}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

async function getSpecificAttachmentImage(id, index) {
    var PreviewImgUrl;
    await ZOHO.CRM.API.getRelatedRecords({ Entity: "Products", RecordID: id, RelatedList: "Attachments", page: 1, per_page: 200 })
        .then(function (data) {
            console.log(data.data);
            var getAttachments = data.data;
            if (getAttachments.length > index) {
                PreviewImgUrl = URLs + getAttachments[index]['$previewUrl'];
            } else {
                PreviewImgUrl = URLs + getAttachments[0]['$previewUrl'];
            }

        });
    console.log(PreviewImgUrl);
    return PreviewImgUrl;
}
