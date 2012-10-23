/*
 * nus-ivle-api
 * https://github.com/Zhuochun/nus-ivle-api
 *
 * Copyright (c) 2012 Zhuochun
 * Licensed under the MIT license.
 */

(function($, window, undefined) {

    "use strict";
    /*jshint jquery:true, laxcomma:true, maxerr:50 */

    // The base and api URL of IAPI
    var baseUrl = "https://ivle.nus.edu.sg/api/",
        apiUrl  = baseUrl + "lapi.svc/",

    // Wrap ajax to allow jsonp
        jsonp = function(url) {
            return $.ajax({
                  type : "GET"
                , dataType : "jsonp"
                , contentType :"application/x-javascript"
                , url : url
                , xhrFields : { widthCredentials : false }
            });
        },

    // Generate uri for IVLE api
        uri = function(key, token, api, params) {
            return apiUrl + api + "?APIKey=" + key +
                (params === undefined ?  "&Token=" + token :
                    "&AuthToken=" + token + "&" + decodeURIComponent($.param(params))) +
                        "&output=json";
        },

    // Define ivle finally
        ivle = function(key) {
            this.KEY = key;
        };

    // Current version of the library. Keep in sync with `package.json`.
    ivle.VERSION = '0.0.1';

    // Get the token string from window.location
    ivle.getToken = function(href) {
        var token
          , result = (/\?token=(\w+)/ig).exec(href || window.location.href);

        if (result) {
            token = result[1];
        }

        return token;
    };

    ivle.login = function(key, redirectUrl) {
        return baseUrl + "login/?apikey=" + key + "&url=" + encodeURIComponent(redirectUrl);
    };

    ivle.prototype = {
        constructor: ivle,

        login: function(redirectUrl) {
            return ivle.login(this.KEY, redirectUrl);
        },

        getToken: ivle.getToken,

        User: function(authToken) {
            return new User(this.KEY, authToken);
        }
    };

    // Define a User
    function User(key, token) {
        this.KEY = key;
        this.TOKEN = token;
    }

    User.prototype = {
        constructor: User,

        _get: function(api, params) {
            return jsonp(uri(this.KEY, this.TOKEN, api, params));
        },

        _identity: function(api, local, callback) {
            var self = this;
            // if cached variable
            if (this[local]) {
                callback(this[local]);
            } else {
                this._get(api).success(function(data) {
                    callback((self[local] = data));
                });
            }
        },

        validate: function(callback) {
            // TODO add expireDay ==> ValidTill
            var self = this;

            this._get("Validate").success(function(data) {
                if (data.Success) {
                    if (data.Token != self.TOKEN) {
                        self.TOKEN = data.Token;
                    }
                }

                callback(data.Success);
            });
        },

        id: function(callback) {
            this._identity("UserID_Get", "_id", callback);
        },

        name: function(callback) {
            this._identity("UserName_Get", "_name", callback);
        },

        email: function(callback) {
            this._identity("UserEmail_Get", "_email", callback);
        },

        modules: function(callback, options) {
            var opt = $.extend({"Duration": 10, "IncludeAllInfo": true}, options);

            this._get("Modules", options).success(function(data) {
                callback(data);
            });
        }
    };

    // Define a module
    function module(key, token, data) {

    }

    
    // Expose ivle to the global object
    window.ivle = ivle;

})(jQuery, window);
