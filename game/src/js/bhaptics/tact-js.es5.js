var DEFAULT_URL = 'ws://127.0.0.1:15881/v2/feedbacks?app_id=com.bhaptics.designer2&app_name=bHaptics Designer';
var STATUS;
(function (STATUS) {
    STATUS["CONNECTING"] = "Connecting";
    STATUS["CONNECTED"] = "Connected";
    STATUS["DISCONNECT"] = "Disconnected";
})(STATUS || (STATUS = {}));
var DEFAULT_RETRY_CONNECT_TIME = 5000;
var PlayerSocket = /** @class */ (function () {
    function PlayerSocket(retryConnectTime) {
        var _this = this;
        if (retryConnectTime === void 0) { retryConnectTime = DEFAULT_RETRY_CONNECT_TIME; }
        this.handlers = [];
        this.isTriggered = false;
        this.connected = false;
        this.addListener = function (func) {
            _this.handlers.push(func);
        };
        this.emit = function (msg) {
            _this.handlers.forEach(function (func) {
                func(msg);
            });
        };
        this.connect = function () {
            try {
                _this.websocketClient = new WebSocket(DEFAULT_URL);
                _this.websocketClient.addEventListener('error', function (event) {
                    _this.connected = false;
                });
                _this.websocketClient.addEventListener('open', function (event) {
                    _this.connected = true;
                });

            }
            catch (e) {
                // connection failed
                console.log('PlayerSocket', e);

                return;
            }
            _this.websocketClient.onopen = function () {
                _this.currentStatus = STATUS.CONNECTED;
                _this.emit({
                    status: _this.currentStatus,
                    message: _this.message,
                });
            };
            _this.websocketClient.onmessage = function (result) {
                if (JSON.stringify(_this.message) === result.data) {
                    return;
                }
                _this.message = JSON.parse(result.data);
                _this.emit({
                    status: _this.currentStatus,
                    message: _this.message,
                });
            };
            _this.websocketClient.onclose = function (event) {
                _this.currentStatus = STATUS.DISCONNECT;
                _this.emit({
                    status: _this.currentStatus,
                    message: _this.message,
                });
                setTimeout(function () {
                    _this.connect();
                }, _this.retryConnectTime);
            };
            _this.currentStatus = STATUS.CONNECTING;
            _this.emit({
                status: _this.currentStatus,
                message: _this.message,
            });
        };
        this.send = function (message) {

            console.log(this.connected, 2)

            if (message === undefined) {
                return;
            }
            if (!_this.isTriggered) {
                _this.isTriggered = true;
                _this.connect();
                return;
            }
            if (_this.websocketClient === undefined) {
                return;
            }
            if (_this.currentStatus !== STATUS.CONNECTED) {
                return;
            }
            try {
                _this.websocketClient.send(message);
            }
            catch (e) {
                // sending failed
            }
        };
        this.message = {};
        this.retryConnectTime = retryConnectTime;
        this.currentStatus = STATUS.DISCONNECT;
    }
    return PlayerSocket;
}());

var HapticPlayer = /** @class */ (function () {
    function HapticPlayer() {

        var _this = this;
        this.addListener = function (func) {
            _this.socket.addListener(func);
        };
        this.turnOff = function (position) {
            var request = {
                Submit: [{
                        Type: 'turnOff',
                        Key: position,
                    }],
            };
            _this.socket.send(JSON.stringify(request));
        };
        this.turnOffAll = function () {
            var request = {
                Submit: [{
                        Type: 'turnOffAll',
                    }],
            };
            _this.socket.send(JSON.stringify(request));
        };
        this.submitDot = function (key, pos, dotPoints, durationMillis) {
            var request = {
                Submit: [{
                        Type: 'frame',
                        Key: key,
                        Frame: {
                            Position: pos,
                            PathPoints: [],
                            DotPoints: dotPoints,
                            DurationMillis: durationMillis,
                        },
                    }],
            };
            _this.socket.send(JSON.stringify(request, function (k, val) {
                return val.toFixed ? Number(val.toFixed(3)) : val;
            }));
        };
        this.submit = function(data){
            _this.socket.send(JSON.stringify(data));
        }
        this.submitPath = function (key, pos, pathPoints, durationMillis) {
            var request = {
                Submit: [{
                        Type: 'frame',
                        Key: key,
                        Frame: {
                            Position: pos,
                            PathPoints: pathPoints,
                            DotPoints: [],
                            DurationMillis: durationMillis,
                        },
                    }],
            };
            _this.socket.send(JSON.stringify(request, function (k, val) {
                return val.toFixed ? Number(val.toFixed(3)) : val;
            }));
        };
        this.registerFile = function (key, json) {
            var jsonData = JSON.parse(json);
            var project = jsonData["project"];
            var request = {
                Register: [{
                        Key: key,
                        project: project,
                    }]
            };
            _this.socket.send(JSON.stringify(request));
        };
        this.submitRegistered = function (key) {
            var request = {
                Submit: [{
                        Type: 'key',
                        Key: key,
                    }],
            };
            _this.socket.send(JSON.stringify(request));
        };
        this.submitRegisteredWithScaleOption = function (key, scaleOption) {
            var request = {
                Submit: [{
                        Type: 'key',
                        Key: key,
                        Parameters: {
                            scaleOption: scaleOption,
                        }
                    }],
            };
            _this.socket.send(JSON.stringify(request));
        };
        this.submitRegisteredWithRotationOption = function (key, rotationOption) {
            var request = {
                Submit: [{
                        Type: 'key',
                        Key: key,
                        Parameters: {
                            rotationOption: rotationOption,
                        }
                    }],
            };
            _this.socket.send(JSON.stringify(request));
        };



        this.socket = new PlayerSocket();
    }
    return HapticPlayer;
}());

var tactJs = new HapticPlayer();

export default tactJs;
//# sourceMappingURL=tact-js.es5.js.map
