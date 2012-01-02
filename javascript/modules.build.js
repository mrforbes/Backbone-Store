({
    appDir: ".",
    baseUrl: ".",
    dir: "../js-build",
    //Comment out the optimize line if you want
    //the code minified by UglifyJS
    //optimize: "none",

    paths: {
        "jquery": "libs/jquery.min",  //can't use remote file to build
        "modernizr": "libs/modernizr",
        "mediator": "libs/mediator",
        "underscore": "libs/underscore",
        "backbone":"libs/backbone",
        "backchair": "libs/backchair",
        "innershiv":"libs/innershiv",
        "pubsub": "libs/pubsub"
    },

    modules: [	
        //Optimize the require-jquery.js file by applying any minification
        //that is desired via the optimize: setting above.
        {
            name: "require"
        },
        //Optimize the application files. Exclude jQuery since it is
        //included already in require-jquery.js
        {
            name: "modules/todo",
            exclude: ["jquery","order","domReady","backchair","underscore","backbone","pubsub","innershiv","text"]
        }
    ]
})
