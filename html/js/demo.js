/*
 * scripts for the index page
 * by Wang Zhuochun
 * */

$(function() {

    var key, token = ivle.getToken(),
        user, modules = [];

    // check store, get key and token
    if (key = store.get("key")) {
        $("#key").val(key);
    }
    if (token) {
        store.set("token", token);
        $("#token").val(token);
    } else if (token = store.get("token")) {
        $("#token").val(token);
    }
    // initial user if key and token exists
    if (key && token) {
        user = ivle.User(key, token);
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

    $("#username").on("click", function() {
        $result = $(this).parent().find(".result");

        user.name(function(data) {
            $result.html(data);
        });
    });

    $("#get-modules").on("click", function() {
        $result = $(this).parent().find(".result");

        user.modules(function(data) {
            var i, table;

            console.log(data);

            for (i in data) {
                table = prettyPrint(data[i], {expanded: false, maxDepth: 20});
                
                $result.append(table);
            }
        });
    });

});
