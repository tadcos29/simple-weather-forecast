$(function () {

const weatherAPIKey='e8cc868ce9babe028d23c742ce866cec';
let submitBtnEl = document.querySelector("#submitBtn");
let cityTextEl = document.querySelector("#city-text-field");
let cityListEl = document.querySelector("#city-list-proper");
let pastRecord = [];



function FetchData(url) {

    fetch(url).then(function (response) {
        if (response.ok) {
            console.log(response);
            response.json().then(function (data) {
            console.log(data);
            if (!pastRecord.includes(data.name)) {
            pastRecord.push(data.name);
            console.log(data.name+"moved into"+pastRecord);
            UpdateRecords();
        }
            DrawPresent(data);
            FetchForecast(data);
            });
        } else {
          alert('Something went wrong? :'+response.statusText);
          return;
        }
      });

}


function FetchForecast(cityData) {
    console.log(cityData);
    let objFuture=[];
    let lat=cityData.coord.lat;
    let lon=cityData.coord.lon; //refactor later
    fetch('https://api.openweathermap.org/data/2.5/forecast?lat='+lat+'&lon='+lon+'&units=metric&appid='+weatherAPIKey).then(function (response) {
        if (response.ok) {
            console.log(response);
            response.json().then(function (data) {
                //What is the latest available daytime hour on the fifth day?
                let hourPick=dayjs.unix((data.list[data.list.length-1].dt)).format('HH');
                console.log(hourPick);
                // Try to get the 1pm daytime forecast for each day,
                // otherwise settle for the latest available hour before 1pm.
                if (hourPick>13) {hourPick=13}
                // Get all the 3-hourly forecasts in reverse order, starting from the
                // future-most one.
                for (x=data.list.length-1;x>=0;x--) {
                    // console.log(data.list[x].dt);
                    let iterHour=dayjs.unix((data.list[x].dt)).format('HH')
                    // If the hour is the desired hour (1pm ideally, as above) then
                    // extract the forecast associated with it into the objFuture object.
                    if (iterHour==hourPick) {objFuture.push(data.list[x])}

                    // console.log(dayjs.unix((data.list[x].dt)).format('YYYY-ddd-MM-DD-HH'));
                    
                }
                console.log("And now, hopefully, the one-o-clocks");
                console.log(dayjs.unix(objFuture[0].dt).format('YYYY-ddd-MM-DD-HH'));
                //Reverse the five forecasts thus obtained into correct order.
                objFuture=objFuture.reverse();
                // Draw the forecasts to UI.
                DrawForecast(objFuture);
            });
        } else {
          alert('Something went wrong? :'+response.statusText);
          return;
        }
      });
    

}

function DrawPresent(cityData) {
    console.log("weather"+cityData.dt);
    let weatherIconURL='<img src="http://openweathermap.org/img/wn/'+cityData.weather[0].icon+'@2x.png">';
$('#current-weather').html(
    `
    <h2>${cityData.name}(${dayjs.unix(cityData.dt).format('YYYY/MM/DD')})</h2><br>
    <h3>${Math.floor(cityData.main.temp)}</h3><br>${weatherIconURL}<br>${cityData.wind.speed}m/s<br>
    ${cityData.main.humidity}%<br>
    `
    );

}

function DrawForecast(obj) {
    console.log(obj);
    for (x=0;x<5;x++) {
        $('#fore-'+x).html(
            
            "<h3>"+dayjs.unix(obj[x].dt).format('dddd')+"</h3><br>("+dayjs.unix(obj[x].dt).format('YYYY/MM/DD')+")<br>"
    +"<h4>"+Math.floor(obj[x].main.temp)+"</h4>"
            
            );
        console.log("For assurance's sake, drawforecast: "+$('#fore-'+x)+" "+obj[x].dt);
    }





}


// let submitBtnEl=document.querySelector("#submitBtn");

// submitBtnEl.addEventListener("click", {
//     event.preventDefault();
//     // console.log("this is"+$(this));
//     // console.log($("#city-text-field"));
//     // console.log("I got "+$("#city-text-field").value);
//   //  FetchData('https://api.openweathermap.org/data/2.5/weather?q='+$(".city-text-field").val()+'&APPID=e8cc868ce9babe028d23c742ce866cec');
// }


function ProcessResponse(event) {
  // Prevent default action
  event.preventDefault();
  if (event.target=$("#submitBtn")) {
  console.log(event);
  console.log("this is"+$(this));
  console.log(cityTextEl);
  console.log("I got "+cityTextEl.value);
  FetchData('https://api.openweathermap.org/data/2.5/weather?q='+cityTextEl.value+'&units=metric&APPID=e8cc868ce9babe028d23c742ce866cec');
  }
} 
function ProcessListResponse(event) {
    // Prevent default action
    event.preventDefault();
    if (event.target=$(".past-record")) {
    console.log(event.target);
    console.log("PAST RECORD"+event.target.innerHTML);
    console.log("I got "+event.target.innerHTML);
    FetchData('https://api.openweathermap.org/data/2.5/weather?q='+event.target.innerHTML+'&units=metric&APPID=e8cc868ce9babe028d23c742ce866cec');
  
  } 

}

function UpdateRecords() {
    cityListEl.innerHTML='';
    for (x=0;x<pastRecord.length;x++) {
        $("<li>"+pastRecord[x]+"</li>").appendTo(cityListEl);
        
    }
    $(cityListEl).children("li").addClass("list-group-item past-record");
}

submitBtnEl.addEventListener("click", ProcessResponse);
cityListEl.addEventListener("click", ProcessListResponse);


})

