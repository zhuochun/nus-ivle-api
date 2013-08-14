# NUS IVLE API JavaScript SDK

a JavaScript SDK for NUS IVLE API, visit [page](http://zhuochun.github.com/nus-ivle-api).

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/Zhuochun/nus-ivle-api/master/dist/nus-ivle-api.min.js
[max]: https://raw.github.com/Zhuochun/nus-ivle-api/master/dist/nus-ivle-api.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/nus-ivle-api.min.js"></script>
<script>
$(function() {
    var key = "YOUR KEY", token = "USER TOKEN",
        user = ivle.User(key, token);

    // you must init the user
    user.init()
        .done(function() {
            // start doing anything
        });
});
</script>
```

## Documentation

Visit [Page](http://zhuochun.github.com/nus-ivle-api).

## Release History

+ Version 0.2.0 First Release -> 26/Oct/2012
+ Version 0.3.0 Some new APIs from IVLE -> 14/Aug/2013

## License

Copyright (c) 2012 [Wang Zhuochun](https://github.com/zhuochun).
Licensed under the MIT license.

## Contributing

You will need `Node` and `Grunt.js`.

Then run `npm install grunt --save-dev` to install all dependencies.
