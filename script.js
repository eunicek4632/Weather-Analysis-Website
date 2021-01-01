//1ZAR25ecRJ7pghoENmV77c9v48cvrrkq
/*Procedure
1. setup pressure array
2. Calculate height
3. 
*/
//Windy
/*
const options = {
    // Required: API key
    key: 'FYcKdlUuTs4tlxH84xUhR6PQuNdp310r', // REPLACE WITH YOUR KEY !!!

    // Put additional console output
    verbose: true,

    // Optional: Initial state of the map
    lat: 22.347536,
    lon: 114.142456,
    zoom: 5,
};
*/
// Sending and receiving data in JSON format using POST method
const url = "https://api.windy.com/api/point-forecast/v2";
const R = 287;
const g = 9.807;
var json;
var avg_temp_arr = new Array();
var height = new Array();
var temp = new Array();
var pressure = new Array(1006, 1000, 950, 900, 850, 800, 700, 600, 500);
var dew_pt = new Array();

var xhr = new XMLHttpRequest();
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-Type", "application/json");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        json = JSON.parse(xhr.responseText);
        drop_data();
        pressure[0] = (json['pressure-surface'][0] / 100);
        data_org();
        calc_height();
        graph();
    }
};
var data = JSON.stringify({"lat": 42, "lon": 12, "model": "gfs", "parameters": ["temp", "dewpoint", "pressure"], "levels": ["surface", "1000h", "950h", "900h", "850h", "800h", "700h", "600h", "500h"], "key": "1ZAR25ecRJ7pghoENmV77c9v48cvrrkq"});
xhr.send(data);


/*
windyInit(options, windyAPI => {
    // windyAPI is ready, and contain 'map', 'store',
    // 'picker' and other usefull stuff
    const { map, store, broadcast, picker, utils } = windyAPI;

    const levels = store.getAllowed('availLevels');
    console.log("Levels");
    console.log(levels);
    
    L.popup()
        .setLatLng([22.347536, 114.142456])
        .setContent('Hong Kong is here')
        .openOn(map);
});
*/
//only keep necessary data for processing
function drop_data(){
    for(var k in json){
        if(k == "warning"){
            break;
        }
        while(json[k].length > 1){
            json[k].pop();
        }
        //console.log(json[k]);
    }
}

//calculate average temperature, for calculating height
function data_org(){
    //i keeps track of the elements to take from json and the number of elements to take average from
    var i = 0;
    var avg = 0;
    for(var k in json) {
        if(k == "ts" || k == "units"){
            continue;
        }
        if(i < 9){
            //calculate average temperature
            temp.push(json[k][0]);
            avg = (avg * i + json[k][0]) / (i + 1);
            avg_temp_arr.push(avg);

        }
        if(i >= 9){
            //add dew point temperature of each pressure level to the array 
            dew_pt.push(json[k][0]);
        }
        i++;
    }
    // console.log("Temperature");
    // console.log(avg_temp_arr);
    // console.log("Dew Point");
    // console.log(dew_pt);
}

//calculate height from pressure and temperature
function calc_height(){
    //  Z = RT/g ln(ps / p)     R = 287     g = 9.807
    height.push(0);
    for(var i = 1; i < 9; i++){
        var z = (R * avg_temp_arr[i] / g) * Math.log(pressure[0] / pressure[i]);
        height.push(z);
    }
    // console.log("Height");
    // console.log(height);
}

//Plotly
function graph(){

    var lineDiv = document.getElementById('tester');

    var traceA = {
        x: temp, 
        y: height,  
        type: 'scatter',
        line: {
            color: 'rgb(100, 0, 0)',
            width: 1
        },
        name: 'Temperature'
    };

    var traceB = {
        x: dew_pt, 
        y: height,  
        type: 'scatter',
        line: {
            color: 'rgb(0, 0, 100)',
            width: 1
        },
        name: 'Dew Point'
    }
    
    var data = [traceA, traceB];
    
    var layout = {
    title:'Atmosphere Conditions',
    height: 550,
    font: {
        family: 'Consolas',
        size: 16,
        color: 'rgb(100,150,200)'
    },
    plot_bgcolor: 'rgba(100,150,200,0.1)',
    margin: {
        pad: 10
    },
    xaxis: {
        title: 'Temperature (K)',
        titlefont: {
        color: 'rgb(100,150,200)',
        size: 16
        },
        range: [200, 350]
    },
    yaxis: {
        title: 'Height (m)',
        titlefont: {
        color: 'rgb(100,150,200)',
        size: 16
        },
        rangemode: 'tozero'
    }
    };


    Plotly.plot( lineDiv, data, layout );
}