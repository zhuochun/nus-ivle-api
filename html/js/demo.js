/*
 * scripts for the index page
 * by Wang Zhuochun
 * */

$(function() {

    // make code pretty
    if (window.prettyPrint) { prettyPrint(); }
    // set version
    $(".version").html(ivle.VERSION);

    // variables
    var key, token = ivle.getToken();

    window.user = null;
    window.modules = [];

    initUser();

    function initUser() {
        // check store, get key and token
        if ((key = store.get("key"))) {
            $("#key").val(key);
        }

        if (token) {
            store.set("token", token);
            $("#token").val(token);
        } else if ((token = store.get("token"))) {
            $("#token").val(token);
        }

        // initial user if key and token exists
        if (key && token) {
            user = ivle.User(key, token);

            return user.init().done(function() {
                // prefetch modules
                user.modules(function(data) { modules = data; });
            });
        }

        return null;
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
        "init_user": {
            check: null,
            run: function(print) {
                var q;

                if (isUserDefined) {
                    print(user.profile());
                } else {
                    q = initUser();

                    if (!q) {
                        window.alert("Please make sure API Key and User Token is specified.");
                    } else {
                        q.done(print(user.profile()));
                    }
                }
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
        "user_profile": {
            check: isUserDefined,
            run: function(print) {
                print(user.profile());
            }
        },
        "user_id": {
            check: isUserDefined,
            run: function(print) {
                print(user.profile("UserID"));
            }
        },
        "user_email": {
            check: isUserDefined,
            run: function(print) {
                print(user.profile("Email"));
            }
        },
        "modules_taken": {
            check: isUserDefined,
            run: function(print) {
                user.modulesTaken(function(result) {
                    print(result);
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
                var type = "Modules", q = {ModuleCode: "ACC1002"};
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
                modules[0].announcementsAsync(function(data) {
                    print(data);
                });
                //print(modules[0].announcements());
            }
        },
        "module_workbin": {
            check: isModuleDefined,
            run: function(print) {
                modules[0].workbinsAsync(function(data) {
                    print(data);
                });
                //print(modules[0].workbins());
            }
        },
        "module_forum": {
            check: isModuleDefined,
            run: function(print) {
                modules[0].forumsAsync(function(data) {
                    print(data);
                });
                //print(modules[0].forums());
            }
        },
        "module_webcast": {
            check: isModuleDefined,
            run: function(print) {
                modules[0].webcastsAsync(function(data) {
                    print(data);
                });
                //print(modules[0].webcasts());
            }
        },
        "module_gradebook": {
            check: isModuleDefined,
            run: function(print) {
                modules[0].gradebooksAsync(function(data) {
                    print(data);
                });
                //print(modules[0].gradebooks());
            }
        },
        "module_gradebook_raw": {
            check: isModuleDefined,
            run: function(print) {
                modules[0].gradebooksAsync().success(function(data) {
                    print(ivle.filterResult(data));
                });
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

            if (!demo) { throw new Error("Error: demo #" + thisDemo + " is not defined"); }

            if (demo.check && !demo.check()) { return ; }

            self.$result.html("fetching data...");

            demo.run(function(output) {
                if (typeof output === "string") {
                    self.$result.html(output);
                } else {
                    if ($.isArray(output) && output.length > 0) {
                        output = output[0];
                    }

                    self.$result.html(prettyObj(output,
                        {expanded: false, maxDepth: 20}));
                }
            });
        });

        this.$elem.on("click", ".btn-console", function() {
            var demo = demos[thisDemo];

            if (demo) {
                if (demo.check()) {
                    demo.run(function(output) {
                        window.$$ = output;
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
