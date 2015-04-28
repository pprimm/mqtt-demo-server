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

Node-Red Flow for Filter
====================
The following is the Node-Red flow that adds a filter value topic (get/ESP8266/filterValue) to the MQTT counter topic (get/ESP8266/counterValue).  Also as a [link](https://github.com/pprimm/mqtt-demo-server/blob/master/filter-flow.json).

    [{"id":"80804206.7f7fc","type":"mqtt-broker","broker":"localhost","port":"1883","clientid":""},{"id":"22f2ce73.dd0d32","type":"mqtt in","name":"","topic":"get/ESP8266/counterValue","broker":"80804206.7f7fc","x":146,"y":90,"z":"1e47102.fe1b8f","wires":[["4b72bd0e.b48d44"]]},{"id":"4b72bd0e.b48d44","type":"function","name":"Filter","func":"switch (msg.topic) {\n  case \"get/ESP8266/counterValue\":\n    context.filterValue = context.filterValue || 0;\n    var filterConstant = context.filterConstant || 0.4;\n    var unfiltered = msg.payload;\n    var filtered = ((unfiltered - context.filterValue) * filterConstant) + context.filterValue;\n    context.filterValue = Math.round(filtered);\n    msg.topic = \"get/ESP8266/filterValue\";\n    msg.payload = context.filterValue;\n    return msg;\n    break;\n  case \"set/ESP8266/filterConstant\":\n    if (msg.payload >= 0.0 && msg.payload <= 1.0) {\n      context.filterConstant = msg.payload;\n      msg.topic = \"get/ESP8266/filterConstant\";\n      msg.payload = context.filterConstant;\n      msg.retain = true;\n      return msg;\n    }\n    break;\n}\n\nreturn null;","outputs":1,"x":456,"y":204,"z":"1e47102.fe1b8f","wires":[["a099df33.5f662","ec7fa690.138058"]]},{"id":"a099df33.5f662","type":"mqtt out","name":"MQTT out","topic":"","broker":"80804206.7f7fc","x":796,"y":262,"z":"1e47102.fe1b8f","wires":[]},{"id":"ec7fa690.138058","type":"debug","name":"","active":false,"console":false,"complete":false,"x":795,"y":123,"z":"1e47102.fe1b8f","wires":[]},{"id":"84c0cef8.7b3f3","type":"mqtt in","name":"","topic":"set/ESP8266/filterConstant","broker":"80804206.7f7fc","x":151,"y":248,"z":"1e47102.fe1b8f","wires":[["4b72bd0e.b48d44"]]}]
