var getAllProperties = [];
var SpecificProduct;
var imgArr = [];
var Latitude;
var Longitude;
var bedrooms;
var bathrooms;
const rowPerPage = 8;
function getPropertyDetails() {

    onLoader();
    fetch("https://therealestate-710385233.development.catalystserverless.com/server/therealestate/getlistOfProperties").then(data => {
        return data.json();
    }).then(data => {
        console.log(data);
        getAllProperties = data;

        var url = document.location.href,
            params = url.split('?')[1].split('&'),
            data = {}, tmp;
        for (var i = 0, l = params.length; i < l; i++) {
            tmp = params[i].split('=');
            data[tmp[0]] = tmp[1];
        }

        var redirectFromCrm = data.isRedirectFromCrm;
        var propName = data.PropName;
        console.log(decodeURI(propName));
        if (redirectFromCrm == "true") {
            specificProperty(decodeURI(propName));
        } else {
            enableSearchDiv();
            const propertiesLength = getAllProperties.length;
            const pageCount = Math.ceil(propertiesLength / rowPerPage);
            const numbers = $('#numbers');
            for (var i = 0; i < pageCount; i++) {
                numbers.append('<li><a onclick="numberClick(this)">' + (i + 1) + '</a></li>');
            }
            $('#numbers li:first-child a').addClass('active');
            display(1);
        }
    })
}

function numberClick(data) {
    var $this = $(data);
    $('#numbers li a').removeClass('active');
    $this.addClass('active');
    display($this.text());

}

function display(index) {
    var start = (index - 1) * rowPerPage;
    var end = start + rowPerPage;
    var val = getAllProperties.slice(start, end);
    offLoader();
    dynamicData(val);
}

function enableSearchDiv() {
    document.getElementById('searchDiv').style.display = "block";
    document.getElementById('specificDiv').style.display = "none";
}

function enableSpecificDiv() {
    document.getElementById('searchDiv').style.display = "none";
    document.getElementById('specificDiv').style.display = "block";
}

function dynamicData(propertiesArr) {
    var row = "";
    for (var i = 0; i < propertiesArr.length; i++) {
        var address = propertiesArr[i]['Address_Line_1'] + " " + propertiesArr[i]['Address_Line_2'] + " " + (propertiesArr[i]['Address_Line_3'] == null ? '' : propertiesArr[i]['Address_Line_3']) + " " + propertiesArr[i]['Locality'];
        var prodActive = propertiesArr[i]['Property_Status'];
        var features = (propertiesArr[i]['Number_of_Bedrooms'] == null ? '' : propertiesArr[i]['Number_of_Bedrooms']) + "bd " + (propertiesArr[i]['Number_of_Bathrooms'] == null ? "" : propertiesArr[i]['Number_of_Bathrooms']) + "ba " + prodActive;
        row = row + `
        <div class="col-md-3">
                <div class="card h-95" style="width: 18rem;margin-bottom: 25px;margin-top:30px;box-shadow: 2px 6px 8px 0 rgba(22, 22, 26, 0.18);">
                    <img class="card-img-top imgSize" src="${propertiesArr[i]['imgUrl']}" alt="Card image cap">
                    <div class="card-body" style="min-height: 270px;">
                      <h5 class="card-title">${propertiesArr[i]['Product_Name']}</h5>
                      <h5 class="card-title">$${propertiesArr[i]['Total_Cost_Estimate_including_tax_and_registration']}</h5>
                      <p class="card-text">${address}</p>
                      <p class="card-text">${features}</p>
                      <a  class="btn btn-primary designBtn"  onclick="specificProperty('${(propertiesArr[i]['Product_Name'])}')">More Details</a>
                    </div>
                  </div>
            </div> 
        `
    }
    document.getElementById('cardsArr').innerHTML = row;
}

function searchVal() {
    var newPropertyArr = [];
    var userInput = document.getElementById('searchinput').value;
    getAllProperties.forEach(element => {
        if ((element['Locality'].toLowerCase()).includes(userInput.toLowerCase()) || (element['State'].toLowerCase()).includes(userInput.toLowerCase()) || (element['City'].toLowerCase()).includes(userInput.toLowerCase())) {
            newPropertyArr.push(element);
        }
    });
    console.log(newPropertyArr);
    dynamicData(newPropertyArr);
}

function specificProperty(propertyName) {
    onLoader();
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
    console.log(propertyName);
    getAllProperties.forEach(element => {
        console.log(element['Product_Name']);
        if (element['Product_Name'] == propertyName) {
            SpecificProduct = element;
        }
    });
    Latitude = parseFloat(SpecificProduct['Latitude']);
    Longitude = parseFloat(SpecificProduct['Longitude']);
    fetch("https://therealestate-710385233.development.catalystserverless.com/server/therealestate/getImagesUsingFolderIdIndex/" + SpecificProduct['imageFolderId']+"/0").then(data => {
        return data.json();
    }).then(res => {
        enableSpecificDiv();
        var fileArr = [];
        fileArr = res;
        imgArr = [];
        for (var i = 0; i < fileArr.length; i++) {
            var blob = new Blob([new Uint8Array(fileArr[i]['data'])]);
            var objectURL = URL.createObjectURL(blob);
            console.log(objectURL);
            imgArr.push(objectURL);
        }
        console.log(JSON.stringify(imgArr));
    }).then(response => {
        getremainingImgs();
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
            <img class="d-block imgStyles"  src="${imgArr[i]}" alt="First slide">
          </div>`
        }
        newImg = newImg + imgs;
        newImg = newImg + `</div>
        <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
      </div>
        `
        document.getElementById('carasolImgs').innerHTML = newImg;
        $('.carousel').carousel({
            interval: 5000
        });
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        var address = SpecificProduct['Address_Line_1'] + " " + SpecificProduct['Address_Line_2'] + " " + SpecificProduct['Address_Line_3'] + " " + SpecificProduct['Locality'];
        document.getElementById('propertyName').innerHTML = " " + SpecificProduct['Product_Name'];
        document.getElementById('propertyAmt').innerHTML = "$ " + SpecificProduct['Total_Cost_Estimate_including_tax_and_registration'];
        document.getElementById('bedrooms').innerHTML = " " + SpecificProduct['Number_of_Bedrooms'];
        document.getElementById('bathrooms').innerHTML = " " + SpecificProduct['Number_of_Bathrooms'];
        document.getElementById('propertyStatus').innerHTML = " " + SpecificProduct['Property_Status'];
        document.getElementById('sqrFt').innerHTML = " " + SpecificProduct['Land_Plot_Size_in_Sqft'];
        document.getElementById('address').innerHTML = " " + address;
        bedrooms = SpecificProduct['Number_of_Bedrooms'];
        bathrooms = SpecificProduct['Number_of_Bathrooms'];
        clicking('Overview');
    })

}

async function getremainingImgs(){
    for(var i=1;i<5;i++){
     await fetch("https://therealestate-710385233.development.catalystserverless.com/server/therealestate/getImagesUsingFolderIdIndex/" + SpecificProduct['imageFolderId']+"/"+i).then(data => {
            return data.json();
        }).then(res => {
            enableSpecificDiv();
            var fileArr = [];
            fileArr = res;
            // imgArr = [];
            for (var i = 0; i < fileArr.length; i++) {
                var blob = new Blob([new Uint8Array(fileArr[i]['data'])]);
                var objectURL = URL.createObjectURL(blob);
                imgArr.push(objectURL);
            }
        })
    }

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
            <img class="d-block imgStyles"  src="${imgArr[i]}" alt="First slide">
          </div>`
        }
        newImg = newImg + imgs;
        newImg = newImg + `</div>
        <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
      </div>
        `
        document.getElementById('carasolImgs').innerHTML = newImg;
        $('.carousel').carousel({
            interval: 2000
        });
        // window.scroll({
        //     top: 0,
        //     left: 0,
        //     behavior: 'smooth'
        // });
        var address = SpecificProduct['Address_Line_1'] + " " + SpecificProduct['Address_Line_2'] + " " + SpecificProduct['Address_Line_3'] + " " + SpecificProduct['Locality'];
        document.getElementById('propertyName').innerHTML = " " + SpecificProduct['Product_Name'];
        document.getElementById('propertyAmt').innerHTML = "$ " + SpecificProduct['Total_Cost_Estimate_including_tax_and_registration'];
        document.getElementById('bedrooms').innerHTML = " " + SpecificProduct['Number_of_Bedrooms'];
        document.getElementById('bathrooms').innerHTML = " " + SpecificProduct['Number_of_Bathrooms'];
        document.getElementById('propertyStatus').innerHTML = " " + SpecificProduct['Property_Status'];
        document.getElementById('sqrFt').innerHTML = " " + SpecificProduct['Land_Plot_Size_in_Sqft'];
        document.getElementById('address').innerHTML = " " + address;
        bedrooms = SpecificProduct['Number_of_Bedrooms'];
        bathrooms = SpecificProduct['Number_of_Bathrooms'];
        clicking('Overview');
}

function onLoader() {
    document.getElementById('loadings').style.display = 'block';
    document.getElementById('containers').style.opacity = "0.5";
}


function offLoader() {
    document.getElementById('loadings').style.display = 'none';
    document.getElementById('containers').style.opacity = "1";

}

function buyerContactPage() {
    onLoader();
    window.location.href = 'https://therealestate-710385233.development.catalystserverless.com/app/ZylerApp/BuyerContact/contact.html';
}

setTimeout(() => {
    var wage = document.getElementById("searchinput");
    wage.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) {
            onLoader();
            setTimeout(() => {
                searchVal();
                offLoader();
            }, 2000);
        }
    });
}, 2000);


function clicking(moduleName) {
    console.log(moduleName);
    if (moduleName == 'Overview') {
        var row = `
         <h2> Overview </h2>
         <p style="color: darkslategray;font-weight: 500;">
         Location!! Desired neighborhood with great commuter access. This lovely Colonial checks the boxes with ${SpecificProduct['Number_of_Bedrooms']} bedrooms, ${SpecificProduct['Number_of_Bathrooms']} bathrooms and a 2 car garage! Town water and sewer, central A/C, gas fireplace, irrigation system and a partially fenced back yard provides you with the whole package! Come make this house your home! Showings begin Saturday 5/28 before the open house which will be 12-4. </p>
        
         <span style="display:flex;">
           <p style="border-right: 2px solid gray;margin-right: 5px;padding-right: 10px;color: darkslategray;font-weight: 500;">Time on Zylker <b> 22 hours </b> </p> <p style="border-right: 2px solid gray;margin-right: 5px;padding-right: 10px;color: darkslategray;font-weight: 500;">Views <b> 843</b> </p> <p style="margin-right: 5px;padding-right: 10px;color: darkslategray;font-weight: 500;">Saves <b> 41 </b> </p> </span>
         <h2>Open House</h2>
         <p><b>Sat, May 28</b></p>
        
         <p style="color: darkslategray;font-weight: 500;">Listed by:</p>
         <p style="color: darkslategray;font-weight: 500;">Nicholas Murphy 603-571-9045</p>
         <p style="color: darkslategray;font-weight: 500;">Keller Williams Gateway Realty/Salem</p>
        
         <p style="color: darkslategray;font-weight: 500;">Source: NEREN, MLS#: 4912242 </p>
        
         <p style="color: darkslategray;font-weight: 500;">Zylker checked: May 28, 2022 at 04:41am</p>
         <p style="color: darkslategray;font-weight: 500;">Data updated: May 27, 2022 at 07:11am</p>
           `
        document.getElementById('commonDiv').innerHTML = row;
    } else if (moduleName == 'FactsFeature') {
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
        document.getElementById('commonDiv').innerHTML = row;
    } else if (moduleName == 'Estimate') {
        var row = `
           <img src="../images/estimate-removebg-preview.PNG" alt="map" style="width:100%;height:400px;">
        `
        document.getElementById('commonDiv').innerHTML = row;
    } else if (moduleName == 'SimilarHomes') {
        $('.carousel').carousel({
            interval: 5000
        });
        var newImg = `
        <div id="carouselExampleIndicatorss" class="carousel slide" data-ride="carousel">
        <ol class="carousel-indicators">`
        var indicator = "";
        for (var i = 0; i < getAllProperties.length; i++) {
            indicator = indicator + `<li data-target="#carouselExampleIndicatorss" data-slide-to="${i}" class="${i == 0 ? "active" : ""}"></li>`
        }
        newImg = newImg + indicator + `</ol>
        <div class="carousel-inner">
        `
        var imgs = ""; var row = "";
        for (var i = 0; i < getAllProperties.length; i++) {
            row = row + ` <div  class="${i == 0 ? "active carousel-item" : "carousel-item"}"> `

            var address = getAllProperties[i]['Address_Line_1'] + " " + getAllProperties[i]['Address_Line_2'] + " " + getAllProperties[i]['Address_Line_3'] + " " + getAllProperties[i]['Locality'];
            var prodActive = getAllProperties[i]['Product_Active'] == true ? 'Active' : 'Sold Out';
            var features = (getAllProperties[i]['Number_of_Bedrooms'] == null ? '' : getAllProperties[i]['Number_of_Bedrooms']) + "bd " + (getAllProperties[i]['Number_of_Bathrooms'] == null ? "" : getAllProperties[i]['Number_of_Bathrooms']) + "ba " + prodActive;
            row = row + `
                <div class="cards-wrapper">
                    <div class="card h-95" style="width: 18rem;margin-bottom: 25px;margin-top:30px;box-shadow: 2px 6px 8px 0 rgba(22, 22, 26, 0.18);">
                        <img class="card-img-top imgSizes" src="${getAllProperties[i]['imgUrl']}" alt="Card image cap">
                        <div class="card-body" style="min-height: 270px;">
                          <h5 class="card-title">${getAllProperties[i]['Product_Name']}</h5>
                          <h5 class="card-title">$${getAllProperties[i]['Total_Cost_Estimate_including_tax_and_registration']}</h5>
                          <p class="card-text">${address}</p>
                          <p class="card-text">${features}</p>
                          <a  class="btn btn-primary designBtn"  onclick="specificProperty('${(getAllProperties[i]['Product_Name'])}')">More Details</a>
                        </div>
                      </div>
                
            </div>
            </div>`

        }

        newImg = newImg + row;
        newImg = newImg + `</div>
        <a class="carousel-control-prev" href="#carouselExampleIndicatorss" role="button" data-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#carouselExampleIndicatorss" role="button" data-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="sr-only">Next</span>
        </a>
      </div>
        `
        $('.carousel').carousel({
            interval: 5000
        });
        document.getElementById('commonDiv').innerHTML = newImg;

    } else if (moduleName == 'Map') {
        var row = `<div id="map"></div>`;
        document.getElementById('commonDiv').innerHTML = row;
        initMap();
    }
}


function initMap() {
    console.log(Latitude);
    console.log(Longitude);
    var options = {
        zoom: 10,
        center: { lat: parseFloat(Latitude), lng: parseFloat(Longitude) }
    }
    var map = new google.maps.Map(document.getElementById('map'), options);
    var marker = new google.maps.Marker({
        position: { lat: parseFloat(Latitude), lng: parseFloat(Longitude) },
        map: map
    });
}

