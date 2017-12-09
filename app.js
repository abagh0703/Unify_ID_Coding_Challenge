var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var request = require('request');
var requestPromise = require('request-promise');
var Promise = require("bluebird");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


/*******************************/
//BEGIN NON-DEFAULT CODE
/*******************************/

/**
 * The parameters for the random.org requests we'll be making.
 * Url: random.org request url
 * method: GET since we're getting data
 * headers: email for User-Agent as requested by https://www.random.org/clients/
 * timeout: 3 minutes (3 minutes * 60 seconds/minute * 1000 ms/second), as recommended by https://www.random.org/clients/
 * @type {{url: string, method: string, headers: {User-Agent: string, Content-Type: string}, timeout: number}}
 */
var randomSiteOptions = {
    url: 'https://candidate.hubteam.com/candidateTest/v2/partners?userKey=9b3e160a6b4bfb171b4116d13e0f',
    method: 'GET',
    headers: {
        'User-Agent': 'abagh0703@gmail.com',
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 3 * 60 * 1000
};


/**
 * Used to check how many bits you have left in your quota
 */
app.get("/checkQuota", function (req, res) {
    randomSiteOptions.url = "https://www.random.org/quota/?format=plain";
    request(randomSiteOptions, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response.send(response.body);
        }
        else {
            response.send(-1);
        }
    });
});


/**
 * See here for documentation: https://www.random.org/clients/http/
 * Creates url for random.org integers
 * Used a function because url may change with new API coming out
 * @param num the number of integers
 * @param min the smallest value allowed
 * @param max the largest value allowed
 * @param col The number of columns in which the integers will be arranged.
 * @param base base of num, eithr 2, 8, 10, 16
 * @param format format of response, either plain or html
 * @param rnd new if you want true random, id.identifier or date.iso-date for other options
 * @return {string} the url to make the request to
 */
function createRandomRequest(num, min, max, col, base, format, rnd) {
    return "https://www.random.org/integers/?num=" + num + "&min=" + min + "&max=" + max + "&col=" + col + "&base=" + base
        + "&format=" + format + "&rnd=" + rnd;

}


/**
 * Gets random pixels based on the height and width provided by the request json.
 * Returns and array with width * height * 3 values between 0 and 255.
 */
app.post('/getRandomPixels', function (req, res) {
    var height = req.body.height;
    var width = req.body.width;
    if (height < 1 || width < 1) {
        res.status(401).send("The number of pixels must be greater than 0.");
        return;
    }

    randomSiteOptions.url = "https://www.random.org/quota/?format=plain";
    requestPromise(randomSiteOptions).then(function (resolvedVal) {
        return Promise.resolve(resolvedVal);
    }).then(function (bitsLeft) {
        //if we don't have enough bits to get all the pixel values, send a custom error message
        if (bitsLeft < height * width * 3) {
            res.statusMessage = "Due to quotas, we cannot get a random image of that size.";
            res.status(401).send();
            return;
        }
        //number of values we'll need
        var numValues = height * width * 3;
        //add requests to an arra so we can call all of them using promisese
        var requests = [];
        //random.org doesn't allow more than 10000 integers
        const MAX_NUMS = 10000;
        //the array of all the RGB values for all the pixel values that we'll send back
        var randomPixels = [];
        /**
         * Loop through, adding requests via promises. We have to do it this way due to random.org's limit of 10k integers
         * per request.
         */
        while (numValues > 0) {
            var numsToRequest = numValues > MAX_NUMS ? MAX_NUMS : numValues;
            randomSiteOptions.url = createRandomRequest(numsToRequest, 0, 255, numsToRequest, 10, "plain", "new");
            requests.push(requestPromise(randomSiteOptions));
            numValues -= MAX_NUMS;
        }
        Promise.all(requests).then(function (results) {
            results.forEach(function (numsString) {
                //in case there's only one number
                if (numsString.indexOf("\n") === -1) {
                    randomPixels.push.apply(randomPixels, numsString.split("\t"));
                }
                //in case multiple columns are used
                else {
                    numsString.split("\n").forEach(function (numLine) {
                        numLine.split("\t").forEach(function (number) {
                            randomPixels.push(number);
                        });
                    });
                }
                var lastElement = randomPixels[randomPixels.length - 1];
                if (randomPixels.length > 0 && (lastElement === "" || lastElement === "\t")) randomPixels.pop();
            });
            res.send(randomPixels);
        }).catch(function (err) {
            res.status(500).send(err);
        });
    });
});
/*******************************/
//END NON-DEFAULT CODE
/*******************************/


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = app;
