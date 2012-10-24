/*
 * scripts for the index page
 * by Wang Zhuochun
 * */

$(function() {

    var token = ivle.getToken(),
        iapi, user, modules = [];

    // check store
    if (store.get("key")) {
        $("#key").val(store.get("key"));
    }
    if (token) {
        store.set("token", token);
        $("#token").val(token);
    } else if (store.get("token")) {
        $("#token").val(store.get("token"));
    }

    // get token button
    $("#getToken").on("click", function(e) {
        e.preventDefault();

        var key = $.trim($("#key").val()),
            redirectUrl = location.href; /*"http://www.nus.edu.sg";*/

        if (key === "") {
            alert("Please provide a API key");
        } else {
            store.set("key", key);
            location.assign(ivle.login(key, redirectUrl));
        }
    });



});
