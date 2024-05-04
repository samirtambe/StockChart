//retrieve data from AWS getPopularQuotes API to retreive the 3 most 
//popular stock quotes with the number of times they have been queried
const recvPopularQuotes = (data) => {
    console.log("most popular stocks...");
    obj = JSON.parse(data.body);
    
    // This array will contain the 3 popular stocks
    let popArray = [];

    let displayStr = "";
    // the object "obj" is an array of arrays
    // [
    //   ['stocksymbol, 'cvx'],    <--- ROW 0
    //   ['count', '8'],           <--- ROW 1
    //   ['stocksymbol, 'aapl'],   <--- ROW 2
    //   ['count', '7'],           <--- ROW 3
    //   ['stocksymbol, 'tsla'],   <--- ROW 4
    //   ['count', '5']            <--- ROW 5
    // ]
    for (let row = 0; row < 6; row++) {

         // only rows 0, 2, and 4
        if (row % 2 == 0) {
            // ADD 2nd element ie... [row][1] array
            popArray.push(obj[row][1])
        }
    }
    // popular the corresponding span TAG
    document.getElementById('popstocks0').innerHTML = popArray[0];
    document.getElementById('popstocks1').innerHTML = popArray[1];
    document.getElementById('popstocks2').innerHTML = popArray[2];

};

document.addEventListener('DOMContentLoaded', function() {
    // Your code to run after the HTML has loaded
    //console.log('The HTML has loaded.');
    // create a JSON object with parameters for API call and store in a variable

    let requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    // make API call with parameters and use promises to get response
    fetch("https://jpyueqkohk.execute-api.us-east-1.amazonaws.com/phase2", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Parse the response body as JSON and return it
            return response.json();
        })
        .then(data => recvPopularQuotes(data))
        .catch(error => console.log('error', error));
});




let uiTickerInput = document.getElementById('uistocksymbol');
uiTickerInput.onfocus = () =>{
    let e = document.getElementById('errorPanel');
    e.className = 'invisible';
    e.textContent = '';
}
var tickerData = undefined;

const listenForScreenResize = () => {

    let timeout = false; // holder for timeout id

    let delay = 500; // no resizing window at all for this duration - triggers callback

    function performResize() {
        console.log('Resize Detected.');
        if (tickerData != undefined){
            clearStockChartArea();
            drawGraph(tickerData);
        }
    }

    window.addEventListener('resize', function() {

        clearTimeout(timeout);
        // start timing for event "completion"
        timeout = setTimeout(performResize, delay);
    });
}

const clearStockChartArea = () => {
    let parentDiv = document.getElementById('stockChartDiv');
    try {
        let childSVG = document.getElementById('theSVG');
        parentDiv.removeChild(childSVG);
    }
    catch(error) {
        //Unable to remove Element ID theSVG because it is the 1st time querying.
    }
}

const prepareUrl = (uiParams) => {

    let prefix = 'https://api.polygon.io/v2/aggs/ticker/';
    let stock = uiParams.symbol;
    let extra = '/range/1/day/';
    let howfarback = uiParams.startDate;
    let now = uiParams.endDate;
    let suffix = '?adjusted=true&sort=asc&limit=262&';
    
    let url = prefix + stock + extra + howfarback + '/' + now + suffix + APIKEYS.POLYGON;
    return url;
};

const performQuery = (url) => {

    let numOfDataPoints = undefined;

    fetch(url).then((response) => {

        if (!response.ok) {
            throw new Error(`HTTP ERROR: ${response.status}`);
        }
        else {
            console.log(`HTTP STATUS: ${response.status}`);
        }
        return response.json();
        })
        .then((data) => {

            if (data.resultsCount >= 1) {

                numOfDataPoints = data.results.length;
                
                for (let cn = 0; cn < numOfDataPoints; cn++) {

                  tickerData.push({
                      date: new Date(data.results[cn].t),
                      close: data.results[cn].c
                  });

                }// for

                drawGraph(tickerData);

                listenForScreenResize();

              } else {

                console.log('Invalid ticker!');
                let v = document.getElementById('errorPanel');
                v.textContent = 'Invalid ticker symbol.';
                v.className = 'visible';
                tickerData=undefined;
            }
        })
        .catch((error) => {
            console.log('performQuery() Catch: ' + error);
        });
};

const padWithZero = (chk) => {
    if (chk.length == 1) { return ('0' + chk); }
    else { return chk; }
};

const drawGraph = (grData) => {
    let lowestCloseValue = undefined;
    let highestCloseValue = undefined;
    let yLowGap = undefined;
    let yHighGap = undefined;
    
    let idxGrphDiv = document.getElementById('stockChartDiv');
    let displayUnit = '$ US';
    let idSVG = 'theSVG';
    let wideOuter = idxGrphDiv.scrollWidth; // preset by the CSS
    let tallOuter = idxGrphDiv.scrollHeight; // preset by the CSS
    let margin = { top: 10, right: 10, bottom: 80, left: 55 };
    let width = wideOuter - margin.left - margin.right;
    let height = tallOuter - margin.top - margin.bottom;

        // Create x-axis scale
    let x = d3.time.scale().range([0, width]);

        // Create y-axis scale
    let y = d3.scale.linear().range([height, 0]);

        // Orient x-axis
    let xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);

        // Orient y-axis
    let yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

    area = d3.svg.area().x(function(d) {
        return x(d.date);
    }).y0(height).y1(function(d) {
        return y(d.close);
    }),
    svg = d3.select('#'+idxGrphDiv.id)
    .append("svg")
    .attr("id",idSVG)
    .attr("width", width + margin.left + margin.right) //
    .attr("height", height + margin.top + margin.bottom) //
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set domain range of values for X-Axis
    x.domain(d3.extent(grData, function(d) {  return d.date;  } ) );

// Find the lowest closing price from the data array
    lowestCloseValue = d3.min(grData, function(d) { return d.close; } );

// Find the highest closing price from the data array
    highestCloseValue = d3.max(grData, function(d) { return d.close; } );

    yLowGap = 0.05 * lowestCloseValue;
    yHighGap = 0.05 * highestCloseValue;

    y.domain([  lowestCloseValue - yLowGap,
              highestCloseValue + yHighGap]);

    svg.append("path")
       .datum(grData)
       .attr("class", "area")
       .attr("d", area);

    // Drawing x-axis
    svg.append("g")
       .attr("class","x axis")
       .attr("transform","translate(0," + height + ")")
       .call(xAxis)
       .selectAll("text")
       .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", function(d) {
            return "rotate(-15)";
    });

    // Drawing y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(displayUnit);

    return svg;
};

const formatDates = (tempdate) => {

    let formattedDate = tempdate.getFullYear() +
    '-' + 
    padWithZero((tempdate.getMonth() + 1).toString()) +
    '-' +
    padWithZero(tempdate.getDate().toString());

    return formattedDate;
};

const calcBeginDate = (today, duration) => {
    // 24 hrs x 60 minutes x 60 seconds x 1000 milliseconds
    
    let oneDayAsMilliseconds = 24 * 60 * 60 * 1000;
    
    let numOfDays = undefined;
    
    switch (duration) {
        case '1 Week'   : numOfDays = 7;    break;
        case '1 Month'  : numOfDays = 30;   break;
        case '3 Months' : numOfDays = 90;   break;
        case '6 Months' : numOfDays = 180;  break;
        case '1 Year'   : numOfDays = 365;  break;
    }

    let retStartDate = new Date(today - (oneDayAsMilliseconds * numOfDays));
    
    return retStartDate;
};
// ============================================================================
const init = () => {
    let form = document.querySelector(".form-group");
    form.addEventListener("submit", function (e) {
        e.preventDefault() // This prevents the window from reloading
    });
    // clear the stockchart if possible so a new one can be displayed
    clearStockChartArea();

    let uisymbol = document.getElementById('uistocksymbol').value;
    let uiduration = undefined;
    let todayDate = new Date();
    let howLongAgo = undefined;
    let url = undefined;

    if (uisymbol.length == 0) {
        console.log('Input Textbox uistocksymbol contain no user input.');
        let p = document.getElementById('errorPanel');
        p.textContent = 'No ticker entered.'
        p.className = "visible";
        tickerData = undefined;
        return;
    }
    
    uiduration = document.getElementById('uitimeframechoice').value;
    
    tickerData = new Array();
    
    let reqParams = {
        symbol: undefined,
        startDate: undefined,
        endDate: undefined
    };

    // calculate the beginning date of the timeframe window ie how far ago    
    howLongAgo = calcBeginDate(todayDate, uiduration);

    // convert user inputted symbol to uppercase and assign to object
    reqParams.symbol = uisymbol.toUpperCase();

    // format start date to YYYY-MM-DD
    reqParams.startDate = formatDates(howLongAgo);

    // format end date to YYYY-MM-DD
    reqParams.endDate = formatDates(todayDate);

    // combine URL elements with user input to create a whole url
    url = prepareUrl(reqParams);

    // get data from polygon.io and draw graph
    performQuery(url);


// ---------  save user inputted stock symbols to dynamodb
    let myHeaders = new Headers();
        
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    
    // using built in JSON utility package turn object to string and store in a variable
    let packagedInput = JSON.stringify({"stocksymbol" : uisymbol});
    
    console.log("packagedInput = " + packagedInput);
    
    // create a JSON object with parameters for API call and store in a variable
    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: packagedInput,
        redirect: 'follow'
    };
    
    // make API call with parameters and use promises to get response
    fetch("https://64ttn7xff6.execute-api.us-east-1.amazonaws.com/test1", requestOptions)
    .then(response => response.text())
    .then(result => console.log("sent"))
    .catch(error => console.log('error', error));

};