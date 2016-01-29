var HTTPS = require('https');
var nodeRequest = require('request');
var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /\/giphy/i;
  if(request.text && botRegex.test(request.text)) {
    var searchString = request.text.split(' ').slice(1).join('+');

    nodeRequest('http://api.giphy.com/v1/gifs/search?q=' + searchString + '&api_key=dc6zaTOxFJmzC', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        try {
          var data = JSON.parse(body).data;
          console.log(data);
          var randomGif = Math.floor(data.length * Math.random());
          console.log(randomGif);
          postMessage(data[randomGif].images.fixed_height.url);
        } catch (e) {
          postMessage('no luck');
        }
      } else {
        postMessage('no luck');
      }
    });

    this.res.writeHead(200);
    this.res.end();
  } else {
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage(botResponse) {
  var options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;
