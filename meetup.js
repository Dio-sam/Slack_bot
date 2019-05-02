require('dotenv').config();
var moment=require('moment');
var fs=require("fs");
var http = require('http'),
    url = require('url'),
    oauth_token;
var meetup = require('meetup-api')({
    oauth: {
      key: process.env.MEETUP_APIKEY,
      secret: process.env.MEETUP_SECRETKEY
    }
});
var now=moment().format('YYYY-MM-DDTHH:MM:SS');
var nextWeek=moment().add(1,'weeks').format('YYYY-MM-DDTHH:MM:SS');
// Create an HTTP server
var server = http.createServer(function(request, response) {
  var uri = url.parse(request.url, true);
  oauth_token = oauth_token || uri.query.access_token || uri.query.code;
  if (oauth_token) {
// Get authentification
    meetup.getOAuth2AccessToken(oauth_token, function(error) {
      if (error) {
        console.warn(error);
        if (error.statusCode === 400) {
          console.info('INFO: This error is because no HTTPS!');
        }
      }
// Get upcoming events
      meetup.getUpcomingEvents({
        'topic_category': 292,
        'start_date_range':now,
        'end_date_range':nextWeek,
        'page':100
      }, function(err, obj) {
        if (err) {
          response.writeHead(200, {
              'Content-Type': 'application/json'
          });
          response.end(JSON.stringify(err));
        } else {
          response.writeHead(200, {
            'Content-Type': 'application/json'
          });
          response.end(JSON.stringify(obj));
          fs.writeFile("events.json",JSON.stringify(obj, null, 2),function(err){
            if (err) {
              return console.error(err);
            }   
            return console.log("File succeffully saved")
          });    
        }
      });
    });
    } else {
// Get authentification Request
      meetup.getOAuth2RequestToken({
        redirect: `http://localhost:${process.env.PORT}/oauth`
      }, function(error, Url) {
        if (!error) {
          response.writeHead(302, {
            Location: Url
          });
          response.end();
        } else {
          response.writeHead(500, {
            'Content-Type': 'application/json'
          });
          response.end(JSON.stringify(error));
        }
      });
    }
});
  
// Listen on port 3005, IP defaults to 127.0.0.1
server.listen(process.env.PORT);

console.log('Server running at http://127.0.0.1:3005/oauth');

module.exports=meetup;

