define('app/todo/views/item',['underscore','jquery','backbone.store','text!../templates/item.html','pubsub'],function(_,$,Backbone,template){
	
	var exports = {};
	
	exports.Item = Backbone.View.extend({  //each result of a search
       events:{
          "click .remove": "removeOne",  //clicking the remove link deletes
          "click .save": "saveOne",  //clicking the save link updates
          "click .todo a": "getDetail"
       },
       initialize: function(options){  //this function is called when the view is instantiated
          /* we pass in the template variable.. its better to load all of the templates in the module at once because they are 
           * 1. really small
           * 2. included in the single compressed file when optimized
           * by passing the template it allows us to use a list view, table view, or some other type of view that will have different markup.
           */
          this.settings = options;
          this.template = _.template(options.template); 
          _.bindAll(this,'render','remove','removeOne')
          this.model.bind('change',this.render); // the template will be re-rendered when the model is updated
          this.model.bind("destroy", this.remove, this); //the template item will be removed when the model is removed
          this.delegateEvents();
          
       },
       /*
        * get the id of the selected record and tell the router to change the url - then load the detail screen
        */
       getDetail: function(e){
          e.preventDefault();
          var self = $(e.currentTarget);
          var id = self.attr('href').replace(/#/,'');
          if(this.settings.router) this.settings.router.navigate('detail/'+id);
          
          this.loadDetail();
          
       },
       //create and render the new detail view
       loadDetail: function(){
       	  var detail = new Todo.Detail({model:this.model, router:this.settings.router, rootEl: this.settings.rootEl});
       	  detail.preRender();
       	  detail.render();
       },
       removeOne: function(e){
           this.model.destroy(); // starts the delete process. this will ultimately call this.remove
       },
       saveOne: function(e){
           //this.model.save()   //since this already has an id it will be updated instead of created.
       },
       render: function(){
                $(this.el).html(this.template(this.model.toJSON()));
                return this;
       },
       remove: function(){
           $(this.el).remove();
       }
   });
   
   return exports;
   
});
