const rrpc = function() {

var web_socket = null;
var callbacks = {};
var currentId = 1;
const jsonrpc= "2.0";

function nextId() {
    const id = currentId;
    currentId++;
    return id;
}

function tearDown() {
    if (web_socket) {
        web_socket.close();
    }
    const oldCallbacks = callbacks;
    callbacks = {};
    for (c in oldCallbacks) {
        oldCallbacks[c](null, new Error('WebSocket torn down'));
    }
}

function processMessage(event) {
	if (event.isTrusted) {
        const data = JSON.parse(event.data);
        if (data.id in callbacks) {
            console.log("callback " + data.id);
            console.log(data);
            callbacks[data.id](data.result, null);
            delete callbacks[data.id];
        } else {
            console.log("no callback for JsonRpc message " + data.id);
        }
    }
}

function initializeWebSocket(callback) {
    web_socket = new WebSocket("ws://" + window.location.host + "/websocket");
	web_socket.onopen = function() {
		web_socket.onmessage = processMessage;
		web_socket.onerror = function(event) {
            callback(null, event);
		}
		web_socket.onclose = function(event) {
            tearDown();
			initialiseWebSocket();
		}
	}
}

return {

initialize: function(callback) {
    tearDown();
    initializeWebSocket(callback);
},

send: function(method, params, callback) {
    const id = nextId();
    if (callback) {
        callbacks[id] = callback;
    }
	web_socket.send(JSON.stringify({ jsonrpc, method, params, id }));
},

destroy: function(callback) {
    tearDown();
},

}

}();