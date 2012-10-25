/*
 * scripts for the index page
 * by Wang Zhuochun
 * */

$(function() {

    // make code pretty
    window.prettyPrint && prettyPrint();

    // variables
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

    // demo actions
    function isKeyExists() {
        if (key) {
            return true;
        } else if ((key = $.trim($("#key").val())) && key !== "") {
            return true;
        } else {
            window.alert("You haven't enter your API Key.");
            return false;
        }
    }

    function isUserDefined() {
        if (user) {
            return true;
        } else {
            window.alert("Please make sure API Key and User Token is specified.");
            return false;
        }
    }

    function isModuleDefined() {
        if (isUserDefined() && modules.length > 0) {
            return true;
        } else {
            window.alert("Please get the list of modules first.");
            return false;
        }
        //} else if (isUserDefined()) {
        //    $.when(user.modules(function(data) {
        //        modules = data;
        //    })).then(function() { result = true; });
        //}
    }

    var demos = {
        "login": {
            check: isKeyExists,
            run: function(print) {
                print(ivle.login(key, location.href));
            }
        },
        "get_token": {
            check: isKeyExists,
            run: function(print) {
                var token = ivle.getToken();
                print(token ? token : "null");
            }
        },
        "validate_user": {
            check: isUserDefined,
            run: function(print) {
                user.validate(function(result) {
                    print(result.toString());
                });
            }
        },
        "username": {
            check: isUserDefined,
            run: function(print) {
                user.name(function(result) {
                    print(result.toString());
                });
            }
        },
        "user_id": {
            check: isUserDefined,
            run: function(print) {
                user.id(function(result) {
                    print(result.toString());
                });
            }
        },
        "user_email": {
            check: isUserDefined,
            run: function(print) {
                user.email(function(result) {
                    print(result.toString());
                });
            }
        },
        "unread_ann": {
            check: isUserDefined,
            run: function(print) {
                user.unreadAnnouncements(function(result) {
                    print(result);
                });
            }
        },
        "search_module": {
            check: isUserDefined,
            run: function(print) {
                var type = "Modules", q = {AcadYear: "2012/2013", Semester: "2"};
                user.search(type, q, function(result) {
                    print(result);
                });
            }
        },
        "get_modules": {
            check: isUserDefined,
            run: function(print) {
                user.modules(function(result) {
                    modules = result;
                    print(modules);
                });
            }
        },
        "get_module_data": {
            check: isModuleDefined,
            run: function(print) {
                print(modules[0].get("CourseName"));
            }
        },
        "module_ann": {
            check: isModuleDefined,
            run: function(print) {
                print(modules[0].announcements(function(result) {
                    print(result);
                }));
            }
        },
        "module_workbin": {
            check: isModuleDefined,
            run: function(print) {
                print(modules[0].workbins(function(result) {
                    print(result);
                }));
            }
        },
        "module_forum": {
            check: isModuleDefined,
            run: function(print) {
                print(modules[0].forums(function(result) {
                    print(result);
                }));
            }
        },
        "module_webcast": {
            check: isModuleDefined,
            run: function(print) {
                print(modules[0].webcasts(function(result) {
                    print(result);
                }));
            }
        },
        "module_gradebook": {
            check: isModuleDefined,
            run: function(print) {
                print(modules[0].gradebook(function(result) {
                    print(result);
                }));
            }
        }
    };

    function Demo(elem) {
        this.$elem = $(elem);

        this.$elem.append('<div class="btn-group"><button class="btn btn-primary btn-run">Run</button><button class="btn btn-primary btn-console">Run in Console</button></div><div class="result"><span class="result-holder">// result here</span></div>');

        var self = this,
            thisDemo = this.$elem.data("demo");

        this.$result = this.$elem.find(".result");

        this.$elem.on("click", ".btn-run", function() {
            var demo = demos[thisDemo];

            if (demo) {
                if (demo.check()) {
                    demo.run(function(output) {
                        if (typeof output === "string") {
                            self.$result.html(output);
                        } else {
                            if ($.isArray(output) && output.length > 0)
                                output = output[0];

                            self.$result.html(prettyObj(
                                JSON.parse(JSON.stringify(output)),
                                {expanded: false, maxDepth: 20}));
                        }
                    });
                }
            } else {
                console.log("Error: demo #" + thisDemo + " is not defined");
            }
        });

        this.$elem.on("click", ".btn-console", function() {
            var demo = demos[thisDemo];

            if (demo) {
                if (demo.check()) {
                    demo.run(function(output) {
                        console.log(output);
                    });
                }
            } else {
                console.log("Error: demo #" + thisDemo + " is not defined");
            }
        });
    }

    $.fn.demo = function() {
        return this.each(function () {
            if (!$(this).hasClass("norun") && !$.data(this, 'plugin_demo')) {
                $.data(this, 'plugin_demo', new Demo(this));
            }
        });
    };

    $(".demo").demo();

});