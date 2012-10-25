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
    /*global exports*/

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

/* ========================================
 * Define ivle
 * ======================================== */

        ivle;

    // The top-level namespace. All public classes and modules will
    // be attached to this. Exported for both CommonJS and the browser.
    if (typeof exports !== 'undefined') {
        ivle = exports;
    } else {
        ivle = window.ivle = {};
    }

    // Current version of the library. Keep in sync with `package.json`.
    ivle.VERSION = '0.1.0';

    // Get the token string from window.location
    ivle.getToken = function(href) {
        var token
          , result = (/\?token=(\w+)/ig).exec(href || window.location.href);

        if (result) {
            token = result[1];
        }

        return token;
    };

    // get the login url
    ivle.login = function(key, redirectUrl) {
        return baseUrl + "login/?apikey=" + key + "&url=" + encodeURIComponent(redirectUrl);
    };

    // generate user
    ivle.User = function(key, token) {
        return new User(key, token);
    };

/* ========================================
 * Define User
 * ======================================== */

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
            var self = this;

            this._get("Validate").success(function(data) {
                if (data.Success) {
                    if (data.Token !== self.TOKEN) {
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

        Module: function(data) {
            return new Module(this, data);
        },

        modules: function(options, callback) {
            if ($.isFunction(options)) {
                callback = options;
                options  = {};
            }

            var self = this,
                opt = $.extend({"Duration": 10, "IncludeAllInfo": true}, options);

            this._get("Modules", opt).success(function(data) {
                var m, modules = [];

                if (data.Comments === "Valid login!") {
                    for (m in data.Results) {
                        modules.push(new Module(self, data.Results[m]));
                    }
                }

                callback(modules);
            });
        },

        unreadAnnouncements: function(callback) {
            this._get("Announcements_Unread", {TitleOnly: false})
                .success(function(data) {
                    if (data.Comments === "Valid login!") {
                        callback(data.Results);
                    } else {
                        callback([]);
                    }
                });
        },

        search: function(type, q, callback) {
            var opt = $.extend({IncludeAllInfo: true}, q);

            if (type === "Modules") {
                this._get("Modules_Search", opt).success(callback);
            } else {
                callback(null);
            }
        },

        download: function(file) {
            var url = baseUrl + "downloadfile.ashx?APIKey=" + this.KEY + 
                    "&AuthToken=" + this.TOKEN + "&target=workbin&ID=";

            if (typeof file === "string") {
                return url + file;
            } else if (file.ID) {
                return url + file.ID;
            } else {
                return null;
            }
        }
    };

/* ========================================
 * Define Module
 * ======================================== */

    function Module(user, data) {
        this._user = user;
        this._data = data;
        this._lastUpdate = new Date();
    }

    Module.prototype = {
        constructor: Module,

        get: function(key) {
            return this._data[key];
        },

        update: function() {
            var self = this,
                minute = 0 | ((new Date() - this._lastUpdate) / 1000 / 60);

            if (minute > 0) {
                this._user._get("Module", {
                    Duration: minute,
                    IncludeAllInfo: true,
                    CourseID: self.get("ID"),
                    TitleOnly: false
                }).success(function(data) {
                    if (data.Comments === "Valid login!") {
                        self._lastUpdate = new Date();
                        self._data = data.Results[0];
                    }
                });
            }
        },

        gradebook: function(callback) {
            var self = this;

            this._user._get("Gradebook_ViewItems", {
                CourseID: self.get("ID")
            }).success(function(data) {
                if (data.Comments === "Valid login!") {
                    callback(data.Results);
                } else {
                    callback(null);
                }
            });
        }
    };

    var i,
        listA = "information weblinks readingFormatted readingUnformatted reading".split(" "),
        afun  = function(type) {
            return function(callback) {
                var self = this;

                this._user._get("Module_" + type, {
                    CourseID: self.get("ID")
                }).success(function(data) {
                    if (data.Comments === "Valid login!") {
                        callback(data.Results);
                    } else {
                        callback(null);
                    }
                });
            };
        };

    for (i in listA) {
        Module.prototype[listA[i]] = afun(listA[i]);
    }

    var listB = [
            {api: "announcements", "options": {Duration: 0, TitleOnly: false}},
            {api: "workbins", "options": {Duration: 0, TitleOnly: false}},
            {api: "forums", "options": {Duration: 0, IncludeThreads: true, TitleOnly: false}},
            {api: "webcasts", "options": {Duration: 0}}
        ],
        bfun = function(key) {
            return function(options, callback) {
                if ($.isFunction(options)) {
                    callback = options;
                    options  = {};
                }

                var self = this,
                    opt = $.extend({CourseID: self.get("ID")}, key.options, options); 

                this._user._get(key.api, opt).success(function(data) {
                    if (data.Comments === "Valid login!") {
                        callback(data.Results);
                    }
                });
            };
        };

    for (i in listB) {
        Module.prototype[listB[i].api] = bfun(listB[i]);
    }

})(jQuery, window);
