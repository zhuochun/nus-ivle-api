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
    // Note: make sure params exists if use AuthToken
        uri = function(key, token, api, params) {
            return apiUrl + api + "?APIKey=" + key +
                (params === undefined ?  "&Token=" + token :
                    "&AuthToken=" + token + "&" + decodeURIComponent($.param(params))) +
                        "&output=json";
        },

    // Get the actual result from data return, null if data is invalid
        getResult = function(data) {
            if (data && (data.Comments === "Valid login!" ||
                         data.Comments === "" /* in WebCasts/Workbin return empty string! */)) {
                return data.Results;
            } else {
                return null;
            }
        },

    // process the query if callback is provided
        processQuery = function(query, callback) {
            return callback ? query.success(function(d) { callback(getResult(d)); }) : query;
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
    ivle.VERSION = '0.3.0';

    // Get the token string from window.location
    ivle.getToken = function(href) {
        var result = (/\?token=(\w+)/ig).exec(href || window.location.href);
        return result ? result[1] : null;
    };

    // get the login url
    ivle.login = function(key, redirectUrl) {
        return baseUrl + "login/?apikey=" + key + "&url=" + encodeURIComponent(redirectUrl);
    };

    // filter the result
    ivle.filterResult = getResult;

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

        init: function() {
            var self = this;

            return $.when(self.validate(), self.get("Profile_View", {}))
                    .done(function(arg1, arg2) {
                        self.data = getResult(arg2[0])[0];
                    });
        },

        get: function(api, params) {
            return jsonp(uri(this.KEY, this.TOKEN, api, params));
        },

        validate: function(callback) {
            var self = this;

            return this.get("Validate").success(function(data) {
                // update the token
                if (data.Success && data.Token !== self.TOKEN) {
                    self.TOKEN = data.Token;
                }

                if (callback) { callback(data.Success); }
            });
        },

        profile: function(key) {
            return key ? this.data[key] : this.data;
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
                opt = $.extend({Duration: 0, IncludeAllInfo: true}, options),
                query = this.get("Modules", opt),
                createModules = function(data) {
                    var m, modules = [], result = getResult(data);

                    if (result) {
                        for (m in result) {
                            modules.push(new Module(self, result[m]));
                        }

                        callback(modules);
                    } else {
                        callback(result);
                    }
                };

            return callback ? query.success(createModules) : query;
        },

        modulesTaken: function(callback) {
            var self = this,
                query = this.get("Modules_Taken", {StudentId: self.profile("UserID")});

            return processQuery(query, callback);
        },

        unreadAnnouncements: function(callback) {
            var query = this.get("Announcements_Unread", {TitleOnly: false});

            return processQuery(query, callback);
        },

        search: function(type, options, callback) {
            var opt = $.extend({IncludeAllInfo: true}, options),
                query = this.get("Modules_Search", opt);

            if (type === "Modules") {
                return processQuery(query, callback);
            } else {
                throw new Error("Search invalid type");
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
            var self = this;

            this._user.get("Module", {
                Duration: 0,
                IncludeAllInfo: true,
                CourseID: self.get("ID"),
                TitleOnly: false
            }).success(function(data) {
                var result = getResult(data);

                if (result && result.length > 0) {
                    self._lastUpdate = new Date();
                    self._data = data.Results[0];
                }
            });
        },

        gradebooksAsync: function(callback) {
            var self = this,
                query = this._user.get("Gradebook_ViewItems", {
                            CourseID: self.get("ID")
                        });

            return processQuery(query, callback);
        }
    };

    var modInfos = "announcements forums workbins webcasts gradebooks polls webLinks lecturers descriptions".split(" "),
        capitalize = function(str) { return str.slice(0,1).toUpperCase() + str.slice(1); },
        i, extendMod = function(key) { return function() { return this.get(key); }; };

    for (i in modInfos) {
        Module.prototype[modInfos[i].toLowerCase()] =
            extendMod.apply(Module.prototype, [capitalize(modInfos[i])]);
    }

    var modApi = [
            {api: "announcements", "options": {Duration: 0, TitleOnly: false}},
            {api: "workbins", "options": {Duration: 0, TitleOnly: false, WorkbinID: ""}},
            {api: "forums", "options": {Duration: 0, IncludeThreads: true, TitleOnly: false}},
            {api: "webcasts", "options": {Duration: 0}}
        ],
        asyncFun = function(i) {
            return function(options, callback) {
                if ($.isFunction(options)) {
                    callback = options;
                    options  = {};
                }

                var self = this,
                    opt = $.extend({CourseID: self.get("ID")}, i.options, options),
                    query = this._user.get(capitalize(i.api), opt);

                return processQuery(query, callback);
            };
        };

    for (i in modApi) {
        Module.prototype[modApi[i].api + "Async"] = 
            asyncFun.apply(Module.prototype, [modApi[i]]);
    }

})(jQuery, window);
