define('app/router',[
'underscore'
,'jquery'
,'backbone.store'
,'modernizr'
],function(_,$,Backbone){
	
	exports = {},
	appRouter = Backbone.Router.extend({
	  initialize: function(){
	  	 this.all();
	  },
	  //add your paths here
	  routes: {
	    "": "home",    // #help
	  },
	  all: function(){
	  	// for anything that could occur everywhere the app is loaded
	  	$(function(){
	  	    if($("#todo-container").length > 0){
	  	        require(['app/todo/router'],function(module){
	  	           module.execute(); 
	  	        });
	  	    }
	  	})
	  },
	  home: function() {
	    // this is equivalent to '/'
	  }
	});
	 
	exports.execute = function(){
		new appRouter();
		//start the history module
		
	}

	
	return exports;
}); 