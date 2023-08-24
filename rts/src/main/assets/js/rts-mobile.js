rts = {
    connection: void 0,

    createConnection: function (accId, userId, serviceId, token, origin, webURL, debug) {
        console.log("Creating a new web socket connection");
        if (!this.isRTSConnected()) {
            this.connection = new window.RTS({
                accId: accId,
                traceId: "",
                userId: userId,
                serviceId: serviceId || '',
                token: token,
                origin: origin,
                webURL: webURL,
                nocookie: true,
                debug: debug,
                onConnect: this.onConnect.bind(this),
                onConnectError: this.onConnectError.bind(this),
                onReconnect: this.onConnect.bind(this),
                onReconnecting: this.onReconnecting.bind(this),
                onDisconnect: this.onDisconnect.bind(this),
                fetchToken: this.refreshToken.bind(this),
                isHealthCheckEnabled: true
            });
        } else {
            console.log("RTS is already connected");
            rtsJsCallback.onConnected();
        }
    },

    onConnect: function (err) {
        console.log("RTS is connecting...");
        if (!err) {
            this.isConnectionSuccess = true;
            this.connecting = false;
            this.connectionError = null;
            if (this.reconnecting) {
                this.reconnecting = false;
                console.log("didReconnect");
            } else {
                console.log("didConnect");
            }
            console.log("Connected");
            rtsJsCallback.onConnected();
        }
    },

    onConnectError: function (err) {
        console.log("onConnectError");
        this.connecting = false;
        console.log(err);
        console.log(err.type);
        rtsJsCallback.onConnectError()
    },

    closeConnection: function () {
        if (this.isRTSConnected()) {
            console.log("Close RTS connection");
            this.connection.close();
            this.connection.disconnect();
            this.connection = void 0;
        } else {
            console.log("RTS is not connected");
            rtsJsCallback.onDisconnected();
        }
    },

    onDisconnect: function (resp, scope) {
        console.log("Disconnecting RTS");
        rtsJsCallback.onDisconnected()
    },

    onReconnecting: function () {
        console.log("onReconnecting RTS");
        rtsJsCallback.onReconnecting()
    },

    isRTSConnected: function () {
        return this.connection && !!this.connection.connected;
    },

    refreshToken: function (callback) {
        console.log("Refresh RTS token before expiry");
    },

    channelSubscribe: function (name, token) {
        var channelName = name;
        var callback = (err, result) => {
            if (err) {
                console.log("Error in subscribing to channel", err);
                rtsJsCallback.subscriptionFailed(name)
            } else {
                rtsJsCallback.subscriptionSuccess(name)
                console.log("Subscribed to channel", result.msg);
            }
        };
        var token = token;
        var msgHandler = function(data) {
            if (data.msg) {
                console.log("channel name ", name)
                console.log("message received on the channel ", data.msg)
                rtsJsCallback.onMessageReceived(name, data.msg);
            }
        }
        var options = {
            messageHandler: msgHandler,
            token: token
        }
        this.connection.subscribeSocket(channelName, callback, options)
    },

    channelUnSubscribe: function (name, token) {
        var channelName = name;
        var callback = function() {
            console.log("Unsubscribe sent successfully")
        };
        var callback = (err, result) => {
            if (err) {
                console.log("Error in unsubscribing to channel", err);
                rtsJsCallback.unSubscriptionFailed(name)
            } else {
                rtsJsCallback.unSubscriptionSuccess(name)
                console.log("Unsubscribe sent successfully")
            }
        };
        var token = token;
        var msgHandler = function(data) {
            console.log("message received on the channel", data)
        }
        var options = {
            messageHandler: msgHandler,
            token: token
        }
        this.connection.unsubscribeSocket(channelName, callback, options)
    }
};