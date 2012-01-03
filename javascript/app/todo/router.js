define('app/todo/router',[
'underscore'
,'jquery'
,'backbone.store'
,'./models/todo'
,'./views/list'
,'./views/item'
,'./views/detail'
,'modernizr'
],function(_,$,Backbone, models, list, item, detail){
	var todoList = null;
	exports = {},
	Todo = {};
	
	Backbone.Store.nuke(); //reset the cache
	
	/** gather each view **/
	_.extend(Todo, list);
	_.extend(Todo, item);
	_.extend(Todo, detail);
	
	
	
	var collection = new models.List;
	var model = new models.Item;
	var todoDetail = new Todo.Detail();
	
	Todo.Router = Backbone.Router.extend({
	  initialize: function(){
	  	 this.all();
	  },
	  //add your paths here
	  routes: {
	    "": "home",    // #help
	    "/detail/:id": "detail"
	  },
	  all: function(){
	  	
	  },
	  detail: function(id){
	    var urlDetail = new Todo.Detail({collection:collection, model:model,router:this,id:id,rootEl:$("#todo-container")});
	    urlDetail.render();
	  },
	  home: function() {
	    // this is equivalent to '/'
	      if(!todoList) todoList = new Todo.List({collection:collection,model:model,router:this});
	      else todoList.show();
	      todoDetail.hide();
	 //   TodoDetail.remove();
	//    TodoList.execute({collection:collection, model:item,router:this});
	  }
	});
	 
	exports.execute = function(){
		new Todo.Router();
		//start the history module
		Backbone.history.start({pushState:true});
	}

	
	return exports;
}); 