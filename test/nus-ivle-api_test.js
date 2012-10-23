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

}(jQuery));
