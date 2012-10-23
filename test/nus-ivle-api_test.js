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

    module("ivle (initialization)");

    test("ivle is added into window", function() {
        notEqual(window.ivle, undefined, "should be defined");
    });

    module("ivle (static methods)");

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

    module("ivle (user generate)");
    
    test("ivle get user", function() {
        var user = (new ivle("key")).User("token");

        equal(user.KEY, "key", "user will has the key");
        equal(user.TOKEN, "token", "user will has the auth token");
    });

    var userA, _ajax;

    module("user identities", {
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
            userA = (new ivle("key").User("token"));
        },
        teardown: function() {
            // return the original ajax
            $.ajax = _ajax;
            // destroy user
            userA = undefined;
        }
    });

    test("get user id", function() {
        var ajax = $.ajax({url:"empty"});

        equal(ajax.count(), 1, "starting ajax count = 1");

        // user id
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

}(jQuery));
