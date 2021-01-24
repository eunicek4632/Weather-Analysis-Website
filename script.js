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
var cloud_base_height = 0;

// Set the range of values in x-axis
var max_x = 270;
var min_x = 220;

// Send POST request to obtain weather data from Windy
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
        find_cloud_base();
        set_margin();
        console.log("Average Temperature");
        console.log(avg_temp_arr);
        console.log("Dew Point");
        console.log(dew_pt);
        console.log("Temp");
        console.log(temp);
        graph();
    }
};
var data = JSON.stringify({"lat": 42, "lon": 12, "model": "gfs", "parameters": ["temp", "dewpoint", "pressure"], "levels": ["surface", "1000h", "950h", "900h", "850h", "800h", "700h", "600h", "500h"], "key": "1ZAR25ecRJ7pghoENmV77c9v48cvrrkq"});
xhr.send(data);

// Set the range of x axis according to the data's max and min
function set_margin(){
    for(var i = 0; i < 9; i++){
        if(temp[i] < min_x){
            min_x = temp[i];
        }
        if(temp[i] > max_x){
            max_x = temp[i];
        }
    }
}

// only keep necessary data for processing
// onlt the first entry in each array is left
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
    console.log(json)
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
        if(i >= 9 && i <= 17){
            //add dew point temperature of each pressure level to the array 
            dew_pt.push(json[k][0]);
        }
        i++;
    }
}

//calculate height from pressure and temperature
function calc_height(){
    //  Z = RT/g ln(ps / p)     R = 287     g = 9.807
    for(var i = 0; i < 9; i++){
        var z = (R * avg_temp_arr[i] / g) * Math.log(pressure[0] / pressure[i]);
        height.push(z);
    }
    // console.log("Height");
    // console.log(height);
}

function find_cloud_base(){
    for(var i = 0; i < 9; i++){
        if(avg_temp_arr[i] <= dew_pt[i] && height[i] > 0){
            cloud_base_height = height[i];
            break;
        }
    }
}

//Plotly
// Plot graph
function graph(){

    var lineDiv = document.getElementById('tester');

    var temp_line = {
        x: temp, 
        y: height,  
        type: 'scatter',
        line: {
            color: 'rgb(100, 0, 0)',
            width: 1
        },
        name: 'Temperature'
    };

    var dew_line = {
        x: dew_pt, 
        y: height,  
        type: 'scatter',
        line: {
            color: 'rgb(0, 0, 100)',
            width: 1
        },
        name: 'Dew Point'
    }
    
    var cloud_base = {
        x: [min_x + 10, max_x + 10], 
        y: [cloud_base_height, cloud_base_height],  
        type: 'scatter',
        line: {
            color: 'rgb(0, 100, 0)',
            width: 1
        },
        name: 'Cloud base'
    }
    var data;
    if(cloud_base_height <= 0){
        data = [temp_line, dew_line];
    }
    else{
        data = [temp_line, dew_line, cloud_base];
    }
    
    
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
        range: [min_x - 10, max_x + 10]
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