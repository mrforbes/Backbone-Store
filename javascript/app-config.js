
/* jquery is being loaded early because of inline scripts */

require.config({
	paths: {
        "jquery": "https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.min",
        "modernizr": "libs/modernizr",
        "mediator": "libs/mediator",
        "underscore": "libs/underscore",
        "backbone":"libs/backbone",
        "backbone.store": "libs/backbone.store",
		"innershiv":"libs/innershiv",
		"pubsub": "libs/pubsub"
    },
	urlArgs: "bust=" +  (new Date()).getTime(),
	priority:['jquery'],
    waitSeconds: 10
});

 
require(['app/todo/router'],
	function(app){
	   app.execute();		 
	}
);


