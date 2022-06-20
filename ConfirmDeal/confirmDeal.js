var pageloadInfo = {};
var URLs = 'https://therealestate.zohoplatform.com';
var relatedProperties;
var CurrentDealId;
var entity;
var selectedProperty;
var getAttachments;
var propertyIdVal;
var currentRecords;

async function getRelatedPropertyDetails() {
    console.log(pageloadInfo.pageLoadData);
    disableAll();
    onLoader();
    CurrentDealId = pageloadInfo.pageLoadData.EntityId[0];
    entity = pageloadInfo.pageLoadData.Entity;
  await  ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: CurrentDealId })
        .then(function (data) {
            console.log(data);
            currentRecords = data.data[0];
        });

   ZOHO.CRM.API.getRelatedRecords({ Entity: entity, RecordID: CurrentDealId, RelatedList: "Products", page: 1, per_page: 200 })
        .then(function (data) {
            console.log(data.data);
            relatedProperties = data.data;
            if (relatedProperties != undefined) {
                var count = 0; var propArr = [];
                relatedProperties.forEach(element => {
                    if (element['Property_Status'] == 'Sold Out') {
                        count++;
                        propArr.push(element['id']);
                    }
                });
                console.log(count);
                if (count == 0) {
                    enableHome();
                    dynamicTable(relatedProperties);
                } else if (count > 0) {
                    console.log("adasd");
                    document.getElementById('homepropertyId').innerHTML = propArr.join();
                    ZOHO.CRM.API.getRecord({ Entity: "Products", RecordID: propArr.join() })
                        .then(function (data) {
                            console.log(data);
                            selectedProperty = data.data[0];

                            ZOHO.CRM.API.getRelatedRecords({ Entity: "Products", RecordID: selectedProperty['id'], RelatedList: "Attachments", page: 1, per_page: 200 })
                                .then(function (data) {
                                    console.log(data);
                                    getAttachments = data.data;
                                    enableSuccessInfo();
                                    successDisplay();
                                });
                        })
                }
            } else if (relatedProperties == undefined) {

                if (currentRecords['Saved_Properties_Searches'].length == 0) {
                    offLoader();
                    enableNoProperty();
                } else {
                    var promis = []; relatedProperties = [];
                    for (var i = 0; i < currentRecords['Saved_Properties_Searches'].length; i++) {
                        if(currentRecords['Saved_Properties_Searches'][i]['Properties'] != null){
                            const id = currentRecords['Saved_Properties_Searches'][i]['Properties']['id'];
                            promis.push(ZOHO.CRM.API.getRecord({ Entity: "Products", RecordID: id })
                                .then(function (data) {
                                    console.log(data.data[0]);
                                    relatedProperties.push(data.data[0]);
                                }));
                        }
                    }

                    Promise.all(promis).then(Data => {
                        if(relatedProperties.length == 0){
                            offLoader();
                            enableNoProperty();
                        }else {
                            enableHome();
                            dynamicTable(relatedProperties);
                        }
                        
                    })

                }
            }
        })
}

function enableHome() {
    document.getElementById('home').style.display = "block";
    document.getElementById('propertyInfo').style.display = "none";
    document.getElementById('successInfo').style.display = "none";
    document.getElementById('homeEsign').style.display = "none";
    document.getElementById('noProperty').style.display = "none";

}

function enableNoProperty() {
    document.getElementById('home').style.display = "none";
    document.getElementById('propertyInfo').style.display = "none";
    document.getElementById('successInfo').style.display = "none";
    document.getElementById('homeEsign').style.display = "none";
    document.getElementById('noProperty').style.display = "block";

}

function enablePropertyInfo() {
    document.getElementById('home').style.display = "none";
    document.getElementById('propertyInfo').style.display = "block";
    document.getElementById('successInfo').style.display = "none";
    document.getElementById('homeEsign').style.display = "none";
    document.getElementById('noProperty').style.display = "none";

}

function enableSuccessInfo() {
    document.getElementById('home').style.display = "none";
    document.getElementById('propertyInfo').style.display = "none";
    document.getElementById('successInfo').style.display = "block";
    document.getElementById('homeEsign').style.display = "none";
    document.getElementById('noProperty').style.display = "none";

}

function disableAll() {
    document.getElementById('home').style.display = "none";
    document.getElementById('propertyInfo').style.display = "none";
    document.getElementById('successInfo').style.display = "none";
    document.getElementById('homeEsign').style.display = "none";
    document.getElementById('noProperty').style.display = "none";

}

function enableHomeEsign() {
    document.getElementById('home').style.display = "none";
    document.getElementById('propertyInfo').style.display = "none";
    document.getElementById('successInfo').style.display = "none";
    document.getElementById('homeEsign').style.display = "block";
    document.getElementById('noProperty').style.display = "none";

}

function here() {
    var propertyId = document.getElementById('propertyId').textContent;
    propertyIdVal = propertyId;
    var link = document.getElementById("idClick");
    var address = "https://therealestate.zohoplatform.com/crm/tab/Products/" + propertyIdVal;
    link.href = address;
}

async function dynamicTable(defaultProperties) {
    var downhead = document.getElementById('propertiesHead');
    var row = `<tr> <th></th>
       <th>Property Name</th>
       <th>Property Img</th>
       <th>No of Bedrooms</th>
       <th>No of Bathrooms</th>
       <th>Rate per Sqft</th>
       <th>Property Status</th>
        </tr>`
    downhead.innerHTML = row;

    var downtable = document.getElementById('propertiesBody');
    var body = '';
    var imgUrls = '';
    if (defaultProperties != undefined) {
        for (var i = 0; i < defaultProperties.length; i++) {
            imgUrls = await getSpecificAttachmentImage(defaultProperties[i]['id'], i);
            body = body + `<tr> 
           <td><input type='checkbox' class='form-check-input' style="margin-top: 1.7rem;" id=${i}></td> 
           <td>${defaultProperties[i]['Product_Name']}</td>
           <td>
                 <div class="image-cropper">
                      <img src="${defaultProperties[i]['Property_Images'] != null ? URLs + defaultProperties[i]['Property_Images'][0]['preview_Url'] : imgUrls}" class='rounded' />
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
    }
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

function closeWidget() {
    ZOHO.CRM.UI.Popup.closeReload()
        .then(function (data) {
            console.log(data);
        })
}

function propertyDetails() {
    $('.carousel').carousel({
        interval: 2000
    });
    var count = 0;
    selectedProperty = {};
    for (var i = 0; i < relatedProperties.length; i++) {
        console.log(document.getElementById(i).checked);
        var val = document.getElementById(i).checked;
        if (val) {
            count++;
            selectedProperty = relatedProperties[i];
        }
    }
    if (count == 1) {
        console.log(selectedProperty);
        ZOHO.CRM.API.getRelatedRecords({ Entity: "Products", RecordID: selectedProperty['id'], RelatedList: "Attachments", page: 1, per_page: 200 })
            .then(function (data) {
                console.log(data);
                getAttachments = data.data;
                enablePropertyInfo();

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
                <tr> <td>Property Type</td> <td>${selectedProperty['Property_Type'] != null ? selectedProperty['Property_Type'] : 'NA'}</td> </tr>
                <tr> <td>No of Bedrooms</td> <td>${selectedProperty['Number_of_Bedrooms'] != null ? selectedProperty['Number_of_Bedrooms'] : 'NA'}</td> </tr>
                <tr> <td>No of Bathrooms</td> <td>${selectedProperty['Number_of_Bathrooms'] != null ? selectedProperty['Number_of_Bathrooms'] : 'NA'}</td> </tr>
                <tr> <td>Property Status</td> <td>${selectedProperty['Property_Status']}</td> </tr>
                <tr> <td>Locality</td> <td>${selectedProperty['Locality']}</td> </tr>
                <tr> <td>Rate Per Sqft</td> <td>${selectedProperty['Rate_Per_Sqft']}</td> </tr>
                <tr> <td>Total Estimated Cost</td> <td>$ ${numberWithCommas(selectedProperty['Total_Cost_Estimate_including_tax_and_registration'])}</td> </tr>
                <tr> <td>Seller Name</td> <td>${selectedProperty['Seller_Name']['name']}</td> </tr>

                `
                    downtable.innerHTML = body;
                }
                $('.carousel').carousel();
            })
    } else if (count == 0) {
        openAlert("Select atleast one property."); console.log("select any one");
        setTimeout(() => {
            closeAlert();
        }, 2000);
    } else {
        openAlert('Select any one property at a time.'); console.log("multiple");
        setTimeout(() => {
            closeAlert();
        }, 2000);
    }
}

function back() {
    enableHome();
}

function confirmDeal() {
    onLoader();
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });

    // var config = {
    //     Entity: entity,
    //     APIData: {
    //         "id": CurrentDealId,
    //         "Stage": "Closed Won"
    //     },
    //     Trigger: ["workflow"]
    // }
    // ZOHO.CRM.API.updateRecord(config)
    //     .then(function (data) {
    //         console.log(data.data);
    //         if (data.data[0]['code'] == 'SUCCESS') {
    var configs = {
        Entity: 'Products',
        APIData: {
            "id": selectedProperty['id'],
            "Product_Active": false,
            "Property_Status": "Sold Out"
        },
        Trigger: ["workflow"]
    }
    ZOHO.CRM.API.updateRecord(configs)
        .then(function (data) {
            console.log(data.data);
            if (data.data[0]['code'] == 'SUCCESS') {
                enableSuccessInfo();
                offLoader();
                successDisplay();
            }
        });
    // }
    // })
}

function successDisplay() {
    console.log("hi");
    offLoader();
    document.getElementById('propertyId').innerHTML = selectedProperty['id'];
    var successImg = document.getElementById('successImg');
    var imgs = `<img src="${URLs + getAttachments[0]['$previewUrl']}" alt="image" style="width: 100%;height: 320px;">`;
    successImg.innerHTML = imgs;

    var downtable = document.getElementById('successBody');
    var body = '';

    if (selectedProperty != undefined) {

        body = body + `
     <tr> <td>Property Type</td> <td>${selectedProperty['Property_Type'] != null ? selectedProperty['Property_Type'] : 'NA'}</td> </tr>
     <tr> <td>Property Name</td> <td>${selectedProperty['Product_Name'] != null ? selectedProperty['Product_Name'] : 'NA'}</td> </tr>
     <tr> <td>Property Status</td> <td>Sold Out</td> </tr>
     <tr> <td>Property Id</td> <td>${selectedProperty['id']}</td> </tr>
     <tr> <td>Seller Name</td> <td>${selectedProperty['Seller_Name']['name']}</td> </tr>
     <tr> <td>Rate per Sqft</td> <td>${selectedProperty['Rate_Per_Sqft']}</td> </tr>
     <tr> <td>Estimated Cost</td> <td>$ ${numberWithCommas(selectedProperty['Total_Cost_Estimate_including_tax_and_registration'])}</td> </tr>

     `
        downtable.innerHTML = body;
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function onLoader() {
    document.getElementById('loadings').style.display = 'block';
    document.getElementById('home').style.display = '0.4';
    document.getElementById('propertyInfo').style.display = '0.4';

}


function offLoader() {
    document.getElementById('loadings').style.display = 'none';
    document.getElementById('home').style.display = '1';
    document.getElementById('propertyInfo').style.display = '1';

}

function openAlert(msgTobeDisplayed) {
    $(".notify").toggleClass("actives");
    document.getElementById('notifyType').innerHTML = msgTobeDisplayed;
}

function later() {
    ZOHO.CRM.UI.Popup.closeReload()
        .then(function (data) {
            console.log(data);
        })
}

function Esign() {
    window.location.href = "https://therealestate-710385233.development.catalystserverless.com/app/Realestate-ESign-MultiDoc/RealestateEsign/v5/html/main.html";
}

function closeAlert() {
    $(".notify").removeClass("actives");
}