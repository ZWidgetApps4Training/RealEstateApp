var pageloadInfo = {};
var CurrentDealId;
var entity;
var URLs = 'https://therealestate.zohoplatform.com';
var latitude;
var longitude;
var bedrooms;
var bathrooms;
var currentPropertyName;
function getZillowPropertyDetails() {
    console.log(pageloadInfo);
    CurrentDealId = pageloadInfo.pageLoadData.EntityId;
    entity = pageloadInfo.pageLoadData.Entity;

    ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: CurrentDealId })
        .then(function (datas) {
            console.log(datas);
            var data = datas.data[0];
            latitude = data['Latitude'];
            longitude = data['Longitude'];
            bedrooms = data['Number_of_Bedrooms'];
            bathrooms = data['Number_of_Bathrooms'];
            setPropertyInfoData(data);
            initMap();
            factsFeatures();
            getSimilarProperties();
        });

}

function here() {
    console.log(currentPropertyName);
    var link = document.getElementById("viewProperty");
    var address = "https://therealestate-710385233.development.catalystserverless.com/app/ZylerApp/Buyer/buyer.html?isRedirectFromCrm=true&PropName=" + currentPropertyName;
    link.href = address;
}

function factsFeatures() {
    var row = `
        <div style="height: 600px;overflow-y: auto;">
        <h2> Facts and features </h2>
        <h3>Interior details</h3>
        <div class="row">
            <div class="col-6 col-md-6">
                <h5>Bedrooms and bathrooms</h5>
                <ul>
                    <li>Bedrooms: ${bedrooms}</li>
                    <li>Bathrooms: ${bathrooms}</li>
                    <li>Full bathrooms: 1</li>
                    <li>3/4 bathrooms: 2</li>
                    <li>1/2 bathrooms: 1</li>
                </ul>
            </div>
            <div class="col-6 col-md-6">
                <h5>Appliances</h5>
                <ul>
                    <li>Appliances included: Electric Cooktop, Dishwasher, Dryer, Double Oven</li>
                    <li>Laundry features: Laundry Hook-ups, In Basement</li>
                </ul>
            </div>
        </div>

        <div class="row">
            <div class="col-6 col-md-6">
                <h5>Basement</h5>
                <ul>
                    <li>Basement: Concrete Floor,Full,Storage Space,Sump Pump,Exterior Entry,Walk-Up Access</li>
                </ul>
                <h5>Flooring</h5>
                <ul>
                    <li>Flooring: Hardwood, Tile</li>
                </ul>
            </div>
            <div class="col-6 col-md-6">
                <h5>Interior Features</h5>
                <ul>
                    <li>Window features: Blinds, Drapes, Window Treatments</li>
                    <li>Interior features: Attic, Kitchen/Dining, Natural Woodwork, Storage, Walk-In Closet(s), Programmable Thermostat</li>
                </ul>
            </div>
        </div>

        <div class="row">
            <div class="col-6 col-md-6">
                <h5>Heating</h5>
                <ul>
                    <li>Heating features: Zoned, Steam, Natural Gas</li>
                </ul>
                <h5>Cooling</h5>
                <ul>
                    <li>Cooling features: None</li>
                </ul>
            </div>
            <div class="col-6 col-md-6">
                <h5>Other interior features</h5>
                <ul>
                    <li>Total structure area: 4,236</li>
                    <li>Total interior livable area: 3,096 sqft</li>
                    <li>Finished area above ground: 3,096</li>
                    <li>Total number of fireplaces: 1</li>
                    <li>Fireplace features: Wood Burning, Fireplaces - 1</li>
                </ul>
            </div>
        </div>

        <h3>Property details</h3>

        <div class="row">
            <div class="col-6 col-md-6">
                <h5>Parking</h5>
                <ul>
                    <li>Parking features: Paved, Driveway, Garage, Auto Open, Detached</li>
                    <li>Garage spaces: 2</li>
                    <li>Has uncovered spaces: Yes</li>
                </ul>
            </div>
            <div class="col-6 col-md-6">
                <h5>Lot</h5>
                <ul>
                    <li>Lot size: 1.06 Acres</li>
                    <li>Lot features: Curbing, Landscaped, Sidewalks, Street Lights, Trail/Near Trail</li>
                </ul>
            </div>
        </div>

        <div class="row">
        <div class="col-6 col-md-6">
            <h5>Accessibility</h5>
            <ul>
                <li>Accessibility features: 1st Floor Hrd Surfce Flr, Access Common Use Areas, Access Parking, Hard Surface Flooring, Kitchen w/5 Ft. Diameter, Paved Parking</li>
            </ul>
        </div>
        <div class="col-6 col-md-6">
            <h5>Other property information</h5>
            <ul>
                <li>Parcel number: MNCHM0354B000L0008</li>
                <li>Zoning description: R-1B</li>
                <li>Other equipment: Deduct Meter, Irrigation Meter, Irrigation Equipment</li>
            </ul>
        </div>
    </div>
          

    <div class="row">
    <div class="col-6 col-md-6">
        <h5>Property</h5>
        <ul>
            <li>Levels: 2.5</li>
            <li>Stories: 2</li>
            <li>Private pool: Yes</li>
            <li>Pool features: In Ground</li>
            <li>Exterior features: Garden Space</li>
            <li>Patio and porch details: Patio, Porch - Screened</li>

        </ul>
    </div>
    <div class="col-6 col-md-6">
    </div>
</div>
</div>
        `
    document.getElementById('fatcsFeatures').innerHTML = row;
}


function getSimilarProperties() {
    var propertyArr = [];
    ZOHO.CRM.API.getAllRecords({ Entity: "Products", sort_order: "asc" })
        .then(function (data) {
            console.log(data.data);
            for (var i = 0; i < data.data.length; i++) {
                if (data.data[i]['Property_Status'] == 'Open For Sales' || data.data[i]['Property_Status'] == 'Open For Rent') {
                    propertyArr.push(data.data[i]);
                }
            }
            console.log(propertyArr);
            carouselCard(propertyArr);
        })
}

function carouselCard(arr) {

    var newImg = `
    <div id="myCarousels" class="carousel slide" data-ride="carousel">
    <ol class="carousel-indicators">`
    var indicator = "";
    for (var i = 0; i < arr.length; i++) {
        indicator = indicator + `<li data-target="#myCarousels" data-slide-to="${i}" class="${i == 0 ? "active" : ""}"></li>`
    }
    newImg = newImg + indicator + `</ol>
    <div class="carousel-inner">
    `
    var imgs = ""; var row = "";
    for (var i = 0; i < arr.length; i++) {
        row = row + ` <div  class="${i == 0 ? "active item" : "item"}"> `

        var address = arr[i]['Address_Line_1'] + " " + arr[i]['Address_Line_2']+ ", " + arr[i]['Locality'];
        var prodActive = arr[i]['Product_Active'] == true ? 'Active' : 'Sold Out';
        var features = (arr[i]['Number_of_Bedrooms'] == null ? '' : arr[i]['Number_of_Bedrooms']) + "bd " + (arr[i]['Number_of_Bathrooms'] == null ? "" : arr[i]['Number_of_Bathrooms']) + "ba " + prodActive;
        row = row + `
            <div class="cards-wrapper">
                <div class="card h-95" style="width: 30rem;margin-bottom: 25px;margin-top:30px;box-shadow: 2px 6px 8px 0 rgba(22, 22, 26, 0.18);">
                    <img class="card-img-top imgSizes" src="${arr[i]['Property_Images'] == null ? 'https://wallpaperaccess.com/full/1142283.jpg' : URLs + arr[i]['Property_Images'][0]['preview_Url']}" alt="Card image cap">
                    <div class="card-body" style="min-height: 270px;">
                      <h5 class="card-title" style="padding: 10px;color: #337ab7;margin-top: 0px;margin-bottom: 0px;text-align: center;">${arr[i]['Product_Name']}</h5>
                      <h5 class="card-title" style="padding: 10px;color: #337ab7;margin-top: 0px;margin-bottom: 0px;text-align: center;">$${arr[i]['Total_Cost_Estimate_including_tax_and_registration']}</h5>
                      <p class="card-text" style="padding: 10px;font-weight: 700;margin-bottom: 0px;text-align: center;">${address}</p>
                      <p class="card-text" style="padding: 10px;font-weight: 700;text-align: center;">${features}</p>
                      <div style="justify-content:center;align-items:center;display:flex;">
                      <a  class="btn btn-primary designBtn"  onclick="specificProperty('${(arr[i]['Product_Name'])}')">More Details</a>
                              </div>
                    </div>
                  </div>
        </div>
        </div>`
    }

    newImg = newImg + row;
    newImg = newImg + `</div>
    <a class="left carousel-control" href="#myCarousels" data-slide="prev">
    <span class="glyphicon glyphicon-chevron-left"></span>
    <span class="sr-only">Previous</span>
  </a>
  <a class="right carousel-control" href="#myCarousels" data-slide="next">
    <span class="glyphicon glyphicon-chevron-right"></span>
    <span class="sr-only">Next</span>
  </a>
  </div>
    `
    document.getElementById('similarProp').innerHTML = newImg;
    $('.carousel').carousel({
        interval: 2000
    });
}


function setPropertyInfoData(SpecificProduct) {
    currentPropertyName = SpecificProduct['Product_Name'];
    var address = SpecificProduct['Address_Line_1'] + " " + SpecificProduct['Address_Line_2'] + " " + SpecificProduct['Locality'];
    document.getElementById('propertyName').innerHTML = " " + SpecificProduct['Product_Name'];
    document.getElementById('propertyAmt').innerHTML = "$ " + SpecificProduct['Total_Cost_Estimate_including_tax_and_registration'];
    document.getElementById('bedrooms').innerHTML = " " + SpecificProduct['Number_of_Bedrooms'];
    document.getElementById('bathrooms').innerHTML = " " + SpecificProduct['Number_of_Bathrooms'];
    document.getElementById('propertyStatus').innerHTML = " " + SpecificProduct['Property_Status'];
    document.getElementById('sqrFt').innerHTML = " " + SpecificProduct['Land_Plot_Size_in_Sqft'];
    document.getElementById('address').innerHTML = " " + address;

    ZOHO.CRM.API.getRelatedRecords({ Entity: "Products", RecordID: SpecificProduct['id'], RelatedList: "Attachments", page: 1, per_page: 200 })
        .then(function (data) {
            console.log(data);
            getAttachments = data.data;
            var newImg = `
<div  id="myCarousel" class="carousel slide" data-ride="carousel">
<ol class="carousel-indicators">`
            var indicator = "";
            for (var i = 0; i < getAttachments.length; i++) {
                indicator = indicator + `<li data-target="#myCarousel" data-slide-to="${i}" class="${i == 0 ? "active" : ""}"></li>`
            }
            newImg = newImg + indicator + `</ol>
<div class="carousel-inner">
`
            var imgs = "";
            for (var i = 0; i < getAttachments.length; i++) {
                imgs = imgs + ` <div  class="${i == 0 ? "active item" : "item"}">
    <img class="d-block imgStyle"  src="${URLs + getAttachments[i]['$previewUrl']}" alt="First slide">
  </div>`
            }
            newImg = newImg + imgs;
            newImg = newImg + `</div>
<a class="left carousel-control" href="#myCarousel" data-slide="prev">
  <span class="glyphicon glyphicon-chevron-left"></span>
  <span class="sr-only">Previous</span>
</a>
<a class="right carousel-control" href="#myCarousel" data-slide="next">
  <span class="glyphicon glyphicon-chevron-right"></span>
  <span class="sr-only">Next</span>
</a>
</div>
`
            document.getElementById('propertyImg').innerHTML = newImg;
        });
}

function map() {

}

function initMap() {
    console.log(latitude);
    console.log(longitude);
    var options = {
        zoom: 10,
        center: { lat: parseFloat(latitude), lng: parseFloat(longitude) }
    }
    var map = new google.maps.Map(document.getElementById('map'), options);
    var marker = new google.maps.Marker({
        position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        map: map
    });
}