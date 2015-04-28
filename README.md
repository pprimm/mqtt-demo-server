mqtt-demo-server
===============
Static HTTP file server with Socket.io &lt;-> MQTT bridge used to demonstrate how to expose MQTT to the browser.  This demo is used in conjunction with the [NodeMCU MQTT](https://github.com/pprimm/nodemcu-lua-mqtt) demo.

Demo Architecture
===============
The following diagram shows the architecture for the demo.  There are three (3) MQTT clients in this demo:

 1. The NodeMCU (ESP8266) board implementing the counter service
 2. The Node-Red implementation that augments a filter onto the counter service
 3. The mqtt.js client that implements the MQTT-to-socket.io bridge to expose the MQTT topics to Socket.io

![Demo Architecture](https://github.com/pprimm/mqtt-demo-server/blob/master/architecture.png)

[Demo Architecture](https://github.com/pprimm/mqtt-demo-server/blob/master/architecture.png)