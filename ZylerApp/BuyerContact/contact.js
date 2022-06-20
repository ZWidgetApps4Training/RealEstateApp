var firstName;
var lastname;
var email;
var secEmail;
var mobile;
var phone;
var address1;
var address2;
var city;
var State;
var Country;
var zipCode;
var type;
var bedrooms;
var bathrooms;
var locality;
var minimum;
var maxBudget;
var areaSqft;
var preferedTime;
var ids;


function submit() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });


    firstName = document.querySelector("#firstName");
    lastname = document.querySelector("#lastname");
    email = document.querySelector("#email");
    secEmail = document.querySelector("#secEmail");
    mobile = document.querySelector("#mobile");
    phone = document.querySelector("#phone");
    address1 = document.querySelector("#address1");
    address2 = document.querySelector("#address2");
    city = document.querySelector("#city");
    State = document.querySelector("#State");
    Country = document.querySelector("#Country");
    zipCode = document.querySelector("#zipCode");
    type = document.querySelector("#type");
    bedrooms = document.querySelector("#bedrooms");
    bathrooms = document.querySelector("#bathrooms");
    locality = document.querySelector("#locality");
    minimum = document.querySelector("#minimum");
    maxBudget = document.querySelector("#maxBudget");
    areaSqft = document.querySelector("#areaSqft");
    preferedTime = document.querySelector("#datetimepicker1");

    let firstNameValid = inputfileds(firstName, 'First Name');
    let lastNameValid = inputfileds(lastname, 'Last Name');
    let emailValid = inputfileds(email, 'Email') && isEmailValid(email.value.trim());
    let mobileValid = MobileNumberLen(mobile);
    let cityValid = inputfileds(city, 'City');
    let zipcodeValid = inputfileds(zipCode, 'Zip code');
    let stateValid = inputfileds(State, 'State');
    let countryValid = inputfileds(Country, 'Country');
    let localityValid = inputfileds(locality, 'Locality');
    let address1Valid = inputfileds(address1, 'Address 1');
    let typeValid = inputfileds(type, 'Property Type');
    let bedroomsValid = inputfileds(bedrooms, 'No of Bedrooms');
    let bathroomsValid = inputfileds(bathrooms, 'No of Bathrooms');
    let prefered = inputfileds(preferedTime, 'Prefered Time to Contact');
    console.log(preferedTime.value.trim());
    var dateFormat = preferedTime.value + " UTC";
    console.log(dateFormat);
    var dt = new Date(dateFormat);
    var newDt = (dt.toISOString()).split(".")[0];
    var updatedDt = newDt+"+05:30";
    console.log(updatedDt);

    console.log(dt.toISOString());


    let validatingForm = firstNameValid && lastNameValid && emailValid && mobileValid && cityValid && zipcodeValid && stateValid && countryValid && localityValid && address1Valid && typeValid && bedroomsValid && bathroomsValid && prefered;
    if (validatingForm) {
        ids = '';
        onLoader();
        disableEntireForms();
        blurBackground();
        disableButtons();
        console.log("success");
        let contactReq = {
            "First_Name": firstName.value.trim(),
            "Last_Name": lastname.value.trim(),
            "Email": email.value.trim(),
            "Secondary_Email": secEmail.value.trim(),
            "Mobile": "+91" + mobile.value.trim(),
            "Phone": phone.value.trim(),
            "Mailing_Street": address1.value.trim() + ", " + address2.value.trim(),
            "Mailing_Zip": zipCode.value.trim(),
            "Mailing_State": State.value.trim(),
            "Mailing_Country": Country.value.trim(),
            "Mailing_City": city.value.trim(),
            "Property_Type": type.value.trim(),
            "Number_of_Bedrooms": parseInt(bedrooms.value),
            "Number_of_Bathrooms": parseInt(bathrooms.value),
            "Minimum_Budget": minimum.value.trim(),
            "Maximum_Budget": maxBudget.value.trim(),
            "Property_For": 'Buy',
            "Plot_Area_in_SqFt": areaSqft.value,
            "Contact_Type": "Buyer",
            "Locality": locality.value.trim(),
            "Preferred_Time_to_Contact": updatedDt
        }
        var data = {
            "data": [contactReq],
            "trigger": ["workflow", "blueprint"]
        }
        console.log(JSON.stringify(data));
        fetch("https://therealestate-710385233.development.catalystserverless.com/server/therealestate/insertRecordToContact", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            console.log(res, 'res');
            return res.json();
        }).then(response => {
            console.log(response['data'][0]);
            if (response['data'][0]['code'] == 'SUCCESS') {
            ids = response['data'][0]['details']['id'];
            console.log(ids);
                offLoader();
                enableButtons();
                enableEntireForms();
                removeblurBackground();
                $('#btnTrigger').click();
                document.getElementById('updateDowngrade').innerHTML = 'Buyer Contact Details';
                document.getElementById('sucessAndFailureResponse').innerHTML = 'Thanks for submitting your details, We saved your searches against your contact, our RealEstate Agent will get in touch with you soon! Click <a id="idClick" href="" onclick="here()" target="_blank">here</a> to navigate to buyer Module.';
            }
        })
    } else {
        console.log("failure");
    }
}

function disableButtons() {
    document.getElementById('cancelBtn').disabled = "false";
    document.getElementById('submitBtn').disabled = "false";
}

function here() {
    console.log(ids);
    var link = document.getElementById("idClick");
    var address = "https://therealestate.zohoplatform.com/crm/tab/Contacts/" + ids;
    link.href = address;
}

function okay() {
    window.location.href = 'https://therealestate-710385233.development.catalystserverless.com/app/ZylerApp/Buyer/buyer.html?isRedirectFromCrm=false&PropName=';
}

function enableButtons() {
    document.getElementById('cancelBtn').disabled = "true";
    document.getElementById('submitBtn').disabled = "true";
}

function disableEntireForms() {
    document.querySelector("#firstName").disabled = true;
    document.querySelector("#lastname").disabled = true;
    document.querySelector("#email").disabled = true;
    document.querySelector("#secEmail").disabled = true;
    document.querySelector("#mobile").disabled = true;
    document.querySelector("#phone").disabled = true;
    document.querySelector("#address1").disabled = true;
    document.querySelector("#address2").disabled = true;
    document.querySelector("#city").disabled = true;
    document.querySelector("#State").disabled = true;
    document.querySelector("#Country").disabled = true;
    document.querySelector("#zipCode").disabled = true;
    document.querySelector("#type").disabled = true;
    document.querySelector("#bedrooms").disabled = true;
    document.querySelector("#bathrooms").disabled = true;
    document.querySelector("#locality").disabled = true;
    document.querySelector("#minimum").disabled = true;
    document.querySelector("#maxBudget").disabled = true;
    document.querySelector("#areaSqft").disabled = true;
}

function enableEntireForms() {
    document.querySelector("#firstName").disabled = false;
    document.querySelector("#lastname").disabled = false;
    document.querySelector("#email").disabled = false;
    document.querySelector("#secEmail").disabled = false;
    document.querySelector("#mobile").disabled = false;
    document.querySelector("#phone").disabled = false;
    document.querySelector("#address1").disabled = false;
    document.querySelector("#address2").disabled = false;
    document.querySelector("#city").disabled = false;
    document.querySelector("#State").disabled = false;
    document.querySelector("#Country").disabled = false;
    document.querySelector("#zipCode").disabled = false;
    document.querySelector("#type").disabled = false;
    document.querySelector("#bedrooms").disabled = false;
    document.querySelector("#bathrooms").disabled = false;
    document.querySelector("#locality").disabled = false;
    document.querySelector("#minimum").disabled = false;
    document.querySelector("#maxBudget").disabled = false;
    document.querySelector("#areaSqft").disabled = false;
}

function blurBackground() {
    document.getElementById('containers').style.opacity = "0.4";
}

function removeblurBackground() {
    document.getElementById('containers').style.opacity = "1";
}


function onLoader() {
    document.getElementById('loadings').style.display = 'block';
}


function offLoader() {
    document.getElementById('loadings').style.display = 'none';
}


const inputfileds = (formFields, name) => {
    let valid = false;
    const username = formFields.value.trim();
    console.log(username);
    if (!isRequired(username)) {
        showError(formFields, name + ' cannot be blank.');
    } else {
        showSuccess(formFields);
        valid = true;
    }
    return valid;
};


const isEmailValid = (emailVal) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!re.test(emailVal)) {
        showError(email, 'Please enter a valid Email ID.');
    }
    return re.test(emailVal);
};

const isRequired = value => value === '' ? false : true;

const MobileNumberLen = (mobile) => {
    let valid = false;
    if (mobile.value.trim().length < 10) {
        showError(mobile, 'Mobile number should contains 10 digits.');
    } else if (mobile.value.trim().length > 10) {
        showError(mobile, 'Mobile number should not exceed more than 10 digits.');
    } else if (mobile.value.trim().length == 10) {
        showSuccess(mobile);
        valid = true;
    }
    return valid;
}



const showError = (input, message) => {
    const formField = input.parentElement;
    console.log(formField);
    formField.classList.remove('success');
    formField.classList.add('error');
    const error = formField.querySelector('small');
    error.textContent = message;
};

const checkEmail = () => {
    let valid = false;
    const email = email.value.trim();
    if (!isRequired(email)) {
        showError(email, 'Email cannot be blank.');
    } else if (!isEmailValid(email)) {
        showError(email, 'Email is not valid.')
    } else {
        showSuccess(email);
        valid = true;
    }
    return valid;
};

const showSuccess = (input) => {
    const formField = input.parentElement;
    formField.classList.remove('error');
    formField.classList.add('success');
    const error = formField.querySelector('small');
    error.textContent = '';
}