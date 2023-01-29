$(function () {

const weatherAPIKey='e8cc868ce9babe028d23c742ce866cec';





function FetchData(url) {

    fetch(url).then(function (response) {
        if (response.ok) {
            console.log(response);
            response.json().then(function (data) {
              console.log(data);
            });
        } else {
          alert('Something went wrong? :'+response.statusText);
          return;
        }
      });

}



FetchData('https://api.openweathermap.org/data/2.5/weather?q=Paris&APPID=e8cc868ce9babe028d23c742ce866cec');



})