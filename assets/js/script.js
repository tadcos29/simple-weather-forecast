$(function () {

const weatherAPIKey='e8cc868ce9babe028d23c742ce866cec';
let submitBtnEl = document.querySelector("#submitBtn");
let cityTextEl = document.querySelector("#city-text-field");
let cityListEl = document.querySelector("#city-list-proper");
let pastRecord = [];



function FetchData(url) {

    fetch(url).then(function (response) {
        if (response.ok) {
            console.log ('Current Weather')
            console.log(response);
            response.json().then(function (data) {
            console.log(data);
            if (!pastRecord.includes(data.name)) {
            pastRecord.push(data.name);
            WriteCityList(pastRecord);
            UpdateRecords();
        }
            DrawPresent(data);
            FetchForecast(data);
            });
        } else {
          alert('An error has occurred: '+response.statusText);
          return;
        }
      });

}

function FetchForecast(cityData) {
    let objFuture=[];
    let lat=cityData.coord.lat;
    let lon=cityData.coord.lon; //refactor later
    fetch('https://api.openweathermap.org/data/2.5/forecast?lat='+lat+'&lon='+lon+'&units=metric&appid='+weatherAPIKey).then(function (response) {
        if (response.ok) {
            console.log('Future forecast')
            console.log(`lat is ${lat} and lon is ${lon}`)
            
            response.json().then(function (data) {
                console.log(data.list);
                console.log('data-in')
                //What is the latest available daytime hour on the fifth day?
                let hourPick=dayjs.unix((data.list[data.list.length-1].dt)).format('HH');
                // Try to get the 1pm daytime forecast for each day,
                // otherwise settle for the latest available hour before 1pm.
                console.log(hourPick);
                if (hourPick>13) {hourPick=hourPick-(Math.floor((hourPick % 13)/3)+1)*3}
                
                // Get all the 3-hourly forecasts in reverse order, starting from the
                // future-most one.
                for (x=data.list.length-1;x>=0;x--) {
                    let iterHour=dayjs.unix((data.list[x].dt)).format('HH')
                    // If the hour is the desired hour (1pm ideally, as above) then
                    // extract the forecast associated with it into the objFuture object.
                    console.log(`dataListX - ${data.list[x]}, iterHour - ${iterHour}`)
                    if (iterHour==hourPick) {objFuture.push(data.list[x])}

                  //  console.log(dayjs.unix((data.list[x].dt)).format('YYYY-ddd-MM-DD-HH'));
                    
                }
                //Reverse the five forecasts thus obtained into correct order.
                objFuture=objFuture.reverse();
                // Draw the forecasts to UI.
                console.log(`objFuture: ${objFuture}`)
                DrawForecast(objFuture);
            });
        } else {
          alert('An error has occurred: '+response.statusText);
          return;
        }
      });
    

}

function DrawPresent(cityData) {
    console.log("weather"+cityData.dt);
    let weatherIconURL='<img src="http://openweathermap.org/img/wn/'+cityData.weather[0].icon+'@2x.png">';
    // Generate html for the current weather container based on
    // cityData weather object passed to the function.
    $('#current-weather').html(
    `
    <h1 class="city-name-header" style="padding:1%">${cityData.name}</h1>
    <h2>${dayjs.unix(cityData.dt).format('dddd, DD MMMM, YYYY')}</h2> Last weather update: ${dayjs.unix(cityData.dt).format('HH:mm')}<br>
    ${weatherIconURL}<br>
    <h3>${Math.floor(cityData.main.temp)}°C</h3><br>
    <b>Wind: </b>${Math.floor(cityData.wind.speed*3.6)}km/s<br>
    <b>Humidity: </b>${cityData.main.humidity}%<br>
    `);

}

function DrawForecast(obj) {
    console.log(obj);
    for (x=0;x<5;x++) {
        let weatherIconURL='<img src="http://openweathermap.org/img/wn/'+obj[x].weather[0].icon+'@2x.png">';
        $('#fore-'+x).children(".weather-heather").html(dayjs.unix(obj[x].dt).format('dddd'));
        $('#fore-'+x).children(".card-body").html(`${dayjs.unix(obj[x].dt).format('DD MMMM')}<br>
        ${weatherIconURL}<br>
            
            <h4>${Math.floor(obj[x].main.temp)}°C</h4><br>
            <b>Wind: </b>${Math.floor(obj[x].wind.speed*3.6)} km/s<br>
            <b>Humidity: </b>${obj[x].main.humidity}%<br>   
    `);
    }





}

function ProcessCitySubmitResponse(event) {
  // Prevent default action
  event.preventDefault();
  if ($(event.target).attr('id')=='submitBtn') {
  
  FetchData('https://api.openweathermap.org/data/2.5/weather?q='+cityTextEl.value+'&units=metric&APPID=e8cc868ce9babe028d23c742ce866cec');
  
}
} 
function ProcessListClickResponse(event) {
    // Prevent default action
    event.preventDefault();
    console.log(event.target);
    //   Since event is delegated, check whether the event caller is actually one of the list items
    // with the past-record class.
    if ($(event.target).hasClass('past-record')) {
   
    console.log("PAST RECORD"+event.target.innerHTML);
    console.log("I got "+event.target.innerHTML);
    FetchData('https://api.openweathermap.org/data/2.5/weather?q='+event.target.innerHTML+'&units=metric&APPID=e8cc868ce9babe028d23c742ce866cec');
  
  } 

}

function UpdateRecords() {
    cityListEl.innerHTML='';
    if (pastRecord.length===0) {
        $('.forecast-cards').hide();
        $('.card').hide();
        $('.intervening').hide();
    } else {
        $('.forecast-cards').show();
        $('.card').show();
        $('.intervening').show();

    }
    for (x=0;x<pastRecord.length;x++) {
        $("<li>"+pastRecord[x]+"</li>").appendTo(cityListEl);
        
    }
    $(cityListEl).children("li").addClass("list-group-item past-record bg-dark text-white m-1");

}
// Local storage functions.
    
function WriteCityList(objList) {
    localStorage.setItem("tadcos29-weather-list", JSON.stringify(objList));
  }

function RetrieveCityList() {
    let objTemp={};
    objTemp=JSON.parse(localStorage.getItem("tadcos29-weather-list"));
    //If there are scores in local storage, retrieve them, otherwise return empty array.
if (objTemp) {return objTemp;} else {return []}
}



// Code executes here.
pastRecord=RetrieveCityList();
UpdateRecords();
$('#submitBtn').click(ProcessCitySubmitResponse);
$('#city-list-proper').click(ProcessListClickResponse);


})

