/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
(function($) {

    /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
    expect(numAssertions)
    stop(increment)
    start(decrement)
    Test assertions:
    ok(value, [message])
    equal(actual, expected, [message])
    notEqual(actual, expected, [message])
    deepEqual(actual, expected, [message])
    notDeepEqual(actual, expected, [message])
    strictEqual(actual, expected, [message])
    notStrictEqual(actual, expected, [message])
    raises(block, [expected], [message])
    */

    module("ivle base");

    test("ivle is added into window", function() {
        notEqual(window.ivle, undefined, "should be defined");
    });

    test("ivle getToken will return the token from string", function() {
        equal(ivle.getToken("aaa"), undefined, "invalid token will return undefined");
        equal(ivle.getToken("test?token=aaa"), "aaa", "return valid token");
        equal(ivle.getToken("test?TOKEN=aaa"), "aaa", "return valid token ignore case");
    });

    test("ivle login will return the login url", function() {
        equal(ivle.login("a", "url"),
            "https://ivle.nus.edu.sg/api/login/?apikey=a&url=url",
            "return valid login url");
    });

    var userA, _ajax;

    module("ivle.User", {
        setup: function() {
            // save a copy of the actual $.ajax
            _ajax = $.ajax;
            // keep a count
            var count = 0;
            // customized ajax
            function ajax(url) {
                count++;

                this.count = function() { return count; };

                this.success = function(callback) {
                    callback(url);
                };

                this.error = function(callback) {
                    callback(url);
                };
            }
            // substitude $.ajax with another one
            $.ajax = function(options) {
                return new ajax(options.url);
            };

            // create a user
            userA = ivle.User("key", "token");
        },
        teardown: function() {
            // return the original ajax
            $.ajax = _ajax;
            // destroy user
            userA = undefined;
        }
    });

    test("ivle can create user", function() {
        var user = ivle.User("key", "token");

        equal(user.KEY, "key", "user will has the key");
        equal(user.TOKEN, "token", "user will has the auth token");
    });

    test("validate user token", function() {
        // customized ajax for validation (success)
        function ajax(url) {
            this.success = function(callback) {
                callback({Success: url, Token: "newToken"});
            };
        }
        // substitude $.ajax with another one
        $.ajax = function(options) {
            return new ajax(options.url);
        };

        userA.validate(function(data) {
            equal(data,
                "https://ivle.nus.edu.sg/api/lapi.svc/Validate?APIKey=key&Token=token&output=json",
                "validate user token success");
        });

        equal(userA.TOKEN, "newToken", "token is updated after Validation");

        // customized ajax for validation (failed)
        function ajax_failed(url) {
            this.success = function(callback) {
                callback({Success: false, Token: "newToken"});
            };
        }
        // substitude $.ajax with another one
        $.ajax = function(options) {
            return new ajax_failed(options.url);
        };

        // reset user token
        userA.TOKEN = "token";

        userA.validate(function(data) {
            equal(data, false, "validate user token failed");
        });

        equal(userA.TOKEN, "token", "token is not updated for failed Validation");
    });

    test("get user id", function() {
        var ajax = $.ajax({url:"empty"});

        equal(ajax.count(), 1, "starting ajax count = 1");

        userA.id(function(data) {
            equal(data,
                "https://ivle.nus.edu.sg/api/lapi.svc/UserID_Get?APIKey=key&Token=token&output=json",
                "get user id");
        });

        equal(ajax.count(), 2, "call to get id -> ajax count = 2");

        userA.id(function(data) {
            equal(data,
                "https://ivle.nus.edu.sg/api/lapi.svc/UserID_Get?APIKey=key&Token=token&output=json",
                "get user id again");
        });

        equal(ajax.count(), 2, "call to get id is cached -> ajax count = 2");
    });

    test("get user name", function() {
        var ajax = $.ajax({url:"empty"});

        equal(ajax.count(), 1, "starting ajax count = 1");

        userA.name(function(data) {
            equal(data,
                "https://ivle.nus.edu.sg/api/lapi.svc/UserName_Get?APIKey=key&Token=token&output=json",
                "get user name");
        });

        equal(ajax.count(), 2, "call to get name -> ajax count = 2");

        userA.name(function(data) {
            equal(data,
                "https://ivle.nus.edu.sg/api/lapi.svc/UserName_Get?APIKey=key&Token=token&output=json",
                "get user name again");
        });

        equal(ajax.count(), 2, "call to get name is cached -> ajax count = 2");
    });

    test("get user email", function() {
        var ajax = $.ajax({url:"empty"});

        equal(ajax.count(), 1, "starting ajax count = 1");

        userA.email(function(data) {
            equal(data,
                "https://ivle.nus.edu.sg/api/lapi.svc/UserEmail_Get?APIKey=key&Token=token&output=json",
                "get user email");
        });

        equal(ajax.count(), 2, "call to get email -> ajax count = 2");

        userA.email(function(data) {
            equal(data,
                "https://ivle.nus.edu.sg/api/lapi.svc/UserEmail_Get?APIKey=key&Token=token&output=json",
                "get user email again");
        });

        equal(ajax.count(), 2, "call to get email -> ajax count = 2");
    });

    test("user download file", function() {
        equal(userA.download("s123"),
            "https://ivle.nus.edu.sg/api/downloadfile.ashx?APIKey=key&AuthToken=token&target=workbin&ID=s123",
            "return the file download url with string");

        equal(userA.download({ID: "s123"}),
            "https://ivle.nus.edu.sg/api/downloadfile.ashx?APIKey=key&AuthToken=token&target=workbin&ID=s123",
            "return the file download url with obj");
    });

    var modA;

    module("ivle.User.Modules", {
        setup: function() {
            // save a copy of the actual $.ajax
            _ajax = $.ajax;
            // keep a count
            var count = 0;
            // customized ajax
            function ajax(url) {
                count++;

                this.count = function() { return count; };

                this.success = function(callback) {
                    callback({
                        "Comments": "Valid login!",
                        "Results": [{"url": url}]
                    });
                };

                this.error = function(callback) {
                    callback(url);
                };
            }
            // substitude $.ajax with another one
            $.ajax = function(options) {
                return new ajax(options.url);
            };

            // create a user
            userA = ivle.User("key", "token");
            // create a module
            modA  = userA.Module({"ID":123, "Workbins": ["a"]});
        },
        teardown: function() {
            // return the original ajax
            $.ajax = _ajax;
            // destroy user
            userA = undefined;
            // destroy mod
            modA  = undefined;
        }
    });

    test("user modules search", function() {
        userA.search("Modules", {ModuleCode: "AA"}, function(data) {
            equal(data[0].url,
                "https://ivle.nus.edu.sg/api/lapi.svc/Modules_Search?APIKey=key&AuthToken=token&IncludeAllInfo=true&ModuleCode=AA&output=json",
                "user modules search");
        });

        userA.search("AAA", {ModuleCode: "AA"}, function(data) {
            equal(data, null, "user modules search with unknown type");
        });
    });


    test("get user modules", function() {
        userA.modules(function(data) {
            equal(data.length, 1, "get one module");
            equal(data[0].get("url"),
                "https://ivle.nus.edu.sg/api/lapi.svc/Modules?APIKey=key&AuthToken=token&Duration=0&IncludeAllInfo=true&output=json",
                "get user modules url");
        });
    });

    test("get gradebook in module", function() {
        modA.gradebooksAsync(function(data) {
            equal(data[0].url,
                "https://ivle.nus.edu.sg/api/lapi.svc/Gradebook_ViewItems?APIKey=key&AuthToken=token&CourseID=123&output=json",
                "get module's gradebook url");
        });
    });

    test("listA methods in module", function() {
        var list = "announcements forums workbins gradebooks polls weblinks descriptions".split(" ");

        // varify that all of them are defined function
        for (var i in list) {
            equal(typeof modA[list[i]], "function", "expect method " + list[i] + " is defined");
        }

        // check one of them
        equal(modA.workbins(), "a", "get module workbin's 1st item");
    });

    test("listB methods in module", function() {
        var list = "announcements forums webcasts workbins".split(" ");
    
        // varify that all of them are defined function
        for (var i in list) {
            equal(typeof modA[list[i] + "Async"], "function",
                "expect method " + list[i] + "Async is defined");
        }

        // check their url
        modA.announcementsAsync(function(data) {
            equal(data[0].url,
                "https://ivle.nus.edu.sg/api/lapi.svc/Announcements?APIKey=key&AuthToken=token&CourseID=123&Duration=0&TitleOnly=false&output=json",
                "get module's announcement url");
        });

        modA.workbinsAsync(function(data) {
            equal(data[0].url,
                "https://ivle.nus.edu.sg/api/lapi.svc/Workbins?APIKey=key&AuthToken=token&CourseID=123&Duration=0&TitleOnly=false&WorkbinID=&output=json",
                "get module's workbins url");
        });

        modA.forumsAsync(function(data) {
            equal(data[0].url,
                "https://ivle.nus.edu.sg/api/lapi.svc/Forums?APIKey=key&AuthToken=token&CourseID=123&Duration=0&IncludeThreads=true&TitleOnly=false&output=json",
                "get module's forums url");
        });

        modA.webcastsAsync(function(data) {
            equal(data[0].url,
                "https://ivle.nus.edu.sg/api/lapi.svc/Webcasts?APIKey=key&AuthToken=token&CourseID=123&Duration=0&output=json",
                "get module's forums url");
        });

        // test one with additional options
        modA.workbinsAsync({WorkbinID: 456}, function(data) {
            equal(data[0].url,
                "https://ivle.nus.edu.sg/api/lapi.svc/Workbins?APIKey=key&AuthToken=token&CourseID=123&Duration=0&TitleOnly=false&WorkbinID=456&output=json",
                "get module's workbin url with additional params");
        });
    });

}(jQuery));
