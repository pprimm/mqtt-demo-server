/*
NodeJS Static Http Server - http://github.com/thedigitalself/node-static-http-server/
By James Wanga - The Digital Self
Licensed under a Creative Commons Attribution 3.0 Unported License.

A simple, nodeJS, http development server that trivializes serving static files.

This server is HEAVILY based on work done by Ryan Florence(https://github.com/rpflorence) (https://gist.github.com/701407). I merged this code with suggestions on handling varied MIME types found at Stackoverflow (http://stackoverflow.com/questions/7268033/basic-static-file-server-in-nodejs).

To run the server simply place the server.js file in the root of your web application and issue the command
$ node server.js
or
$ node server.js 1234
with "1234" being a custom port number"

Your web application will be served at http://localhost:8888 by default or http://localhost:1234 with "1234" being the custom port you passed.

Mime Types:
You can add to the mimeTypes has to serve more file types.

Virtual Directories:
Add to the virtualDirectories hash if you have resources that are not children of the root directory

*/
var http = require("http"),
   url = require("url"),
   path = require("path"),
   fs = require("fs"),
   port = process.argv[2] || 8888;

var mimeTypes = {
   "htm": "text/html",
   "html": "text/html",
   "jpeg": "image/jpeg",
   "jpg": "image/jpeg",
   "png": "image/png",
   "gif": "image/gif",
   "js": "text/javascript",
   "css": "text/css"
};

var virtualDirectories = {
   //"images": "../images/"
};

var httpServer = http.createServer(function(request, response) {

   var uri = url.parse(request.url).pathname,
      filename = path.join(process.cwd(), uri),
      root = uri.split("/")[1],
      virtualDirectory;

   virtualDirectory = virtualDirectories[root];
   if (virtualDirectory) {
      uri = uri.slice(root.length + 1, uri.length);
      filename = path.join(virtualDirectory, uri);
   }

   fs.exists(filename, function(exists) {
      if (!exists) {
         response.writeHead(404, {
            "Content-Type": "text/plain"
         });
         response.write("404 Not Found\n");
         response.end();
         console.error("404: " + filename);
         return;
      }

      if (fs.statSync(filename).isDirectory()) filename += "/index.html";

      fs.readFile(filename, "binary", function(err, file) {
         if (err) {
            response.writeHead(500, {
               "Content-Type": "text/plain"
            });
            response.write(err + "\n");
            response.end();
            console.error("500: " + filename);
            return;
         }

         var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
         response.writeHead(200, {
            "Content-Type": mimeType
         });
         response.write(file, "binary");
         response.end();
         console.log("200: " + filename + " as " + mimeType);
      });
   });
});

/*******************************************************************************
socket.io and MQTT client instance(s)
*******************************************************************************/
var io = require("socket.io")(httpServer);

// MQTT host settings
var mqttSettings = {
    port: 1883,
    host: "10.1.10.132", //host: "10.10.101.24",
    connectOptions: {
        keepalive: 10,
        protocolId: "MQIsdp",
        protocolVersion: 3,
        reconnectPeriod: 1000,
        clean: true,
        encoding: "utf8",
        username: "",
        password: ""
    }
};

var mqttClient = require("mqtt").createClient(mqttSettings.port, mqttSettings.host, mqttSettings.connectOptions);


/*******************************************************************************
socket.io We can use the base io.on(...) because we want to emit the
messages to all clients.
*******************************************************************************/
io.on("connection", function(socket) {
    socket.on("setCounterValue", function(msg) {
        console.log("setCounterValue called");
        mqttClient.publish("set/ESP8266/counterValue",msg);
    });

    socket.on("setFilterConstant", function(msg) {
        console.log("setFilterConstant called");
        mqttClient.publish("set/ESP8266/filterConstant",msg);
    });

    socket.on("counterCmd", function(msg) {
        console.log("counterCmd called");
        mqttClient.publish("set/ESP8266/counterCmd",msg);
    });
});

/*******************************************************************************
MQTT client connection and callbacks
*******************************************************************************/


//console.log(JSON.stringify(mqttSettings, null, 4));

mqttClient.on("connect", function () {
    console.log("MQTT> connected w/ Client Options = " + JSON.stringify(mqttSettings.connectOptions, null, 4));

    var subTopic = "get/ESP8266/#";

    // listen to receive
    mqttClient.subscribe(subTopic, function () {
        console.log("MQTT> subscribing to " + subTopic);
    });
});

mqttClient.on("message", function (topic, msg) {
    switch (topic) {
        case "get/ESP8266/counterValue":
            io.emit("counterValue", msg); // should be sent volatile
            break;
        case "get/ESP8266/filterValue":
            io.emit("filterValue", msg); // should be sent volatile
            break;
        case "get/ESP8266/filterConstant":
            io.emit("filterConstant", msg);
            break;
    }
});

// fire off the HTTP server w/ piggy-back socket.io
httpServer.listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
