# StockChart-Cloud
## Introduction
A web application that displays stock charts for a specified timeframe from a user inputted stock ticker symbol. This web app uses Vanilla JavaScript to get the user inputted stock ticker symbol and send it to [Polygon.io API](https://www.polygon.io/) API. This also is a single page application.

The [Polygon.io API](https://www.polygon.io/) returns the stock ticker symbol's historic data according to the time frame specified: 1 week, 1 month, 3 months, 6 months and 1 year. The received data is in JSON Format.

Stock queries are stored in a NoSQL database (DynamoDB) via a Lambda function from an AWS API. The most queried stocks are also shown also.

## Stock Chart Visual
Upon receiving the data, the web app produced a line graph of the history using [D3.js](https://d3js.org/).  D3.js uses SVG (Scalable Vector Graphics).

If you are viewing this app on a desktop or laptop, you can resize the screen and the graph will resize without resubmitting the query.

## Cloud Functionality
This web application also records the stock symbols entered by users in a AWS DynamoDB NO-SQL database via a Lambda function through an API.  When the web application is first loaded in the browser it will list the three most popular stocks that have been entered in to the app from an AWS DynamoDB NO-SQL database via a Lambda function through an API.

## How to set up this project (focus on Cloud Side)
More to come soon.