# Unify ID Coding Challenge
Coding challenge for Unfiy ID.
Required to create an RGB bitmap picture using random numbers from Random.org.
## Running The Server
    npm install
will install all required dependencies. You only need to do this once.
    
    npm start
will run the server on localhost:3000.
## Approach
### Back-End
I used Node.JS + Express for my stack. I used the standrad
requests library to issue HTTP requests.
To deal with callbacks, I used Bluebird.js. 
### Front-End
The challenge could have been accomplished without a Node.js back-end, since
vanilla javascript (especially with jQuery) has the ability to make 
get requests. But since this is a full-stack challenge and not the time to be minimalistic, I implemented a
back-end nonetheless.

No special design frameworks were used, only jQuery to simplify adding/removing classes as well as ajax requests.
### Extra Features
Some coding challenges encourage you to get a solution as quickly as possible, regardless of how clean it is.
Here, I focused on making it code that isn't shoddy and hacked together without proper design patterns.
##### Dimensions Input
I gave the user the option to specify the width and height of the box that they generate.
##### Quota Checker
When a a user submits a query to construct a random rectangle, a request is made to Random.org to get the number of 
bits the server's IP has left. If there are enough bits left, it proceeds with the request; otherwise, 
##### Error Checking
There are multiple error messages that the server may send back to the client. The client displays the error messages
in large red text on the page.
![Screenshot of the site](screenshot.PNG?raw=true "Optional Title")

## And more! Feel free to jump into the source code!
All the back-end code was done in app.js, and all the front-end code is in 
public/index.html and public/stylesheets/style.css.
