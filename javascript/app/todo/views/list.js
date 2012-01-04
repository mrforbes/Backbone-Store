define('app/todo/views/list',['underscore','jquery','backbone.store','../models/todo','text!../templates/list.html','text!../templates/item.html','','pubsub'],function(_,$,Backbone, model, template, list_template){
   var exports = {};
       
  
  //this sets underscore templates to use moustache style {{}}     
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
 };
 
 /* most modules will have a collection view and a model view - in some cases they may have multiple collections and modules with an overarching parent 
  * but if so - your application is too tightly coupled.  use pubsub or mediator/subscriber patterns instead to communicate across modules.
  */
       
   exports.List = Backbone.View.extend({
       defaultOptions:{ //this is useful when creating drop-in modules - it allows us to pass in case specific settings
           
       },
       events: { 
           "click button":"addTodo"
       },
       el: $("#todo-container"),  //this needs to be in the html for it to work.
       initialize: function(options){
        
         _.bindAll(this,'addAll','addOne','addTodo','addToCollection','show','subscribers'); //all functions inside the view should be bound here... a weirdness of backbone.
         //create/merge settings
         this.settings = {};
         _.extend(this.settings, this.defaultOptions, options);
         // parse the template html to make it a real template
         this.template = _.template(template);
         this.render(); // add the template to the container
         this.collection.bind('add',this.addOne); //when a model is added to the collection, the addOne function will be called
         this.collection.fetch();   // since we bound the collection add, when fetch is done it will start adding models.
      	 this.subscribers();
       },
       subscribers: function(){
       	 var self = this;
       	 PubSub.subscribe( 'Todo.Detail.remove', function(){
       	 	self.show();
       	 });
       },
       render: function(){
         $(this.el).append(this.template); //put the template on the screen 
       },
       show: function(){
           $(this.el).find('.todo-list').show();
       },
       addTodo: function(e){  //occurs on click of add button
           this.model = new model.Item; // instantiating a model to hold the item we are adding
           this.model.bind('save',this.addToCollection,this); //binding the save event so whatever we add gets placed in the collection
           var self = $(e.currentTarget); // this is how we reference the event element, since 'this' is always bound to the view
           var input = self.prev(); // jquery, the input is right before the button
           var key = input.attr('id'); // don't really need this
           var value = input.val(); //get the value of the input
           this.model.save({'todo':value}); //save the model - this will make a restful call to the server if lawnchair.server is true, otherwise it will just get added to localstorage.
       },
       addAll: function(){ //this is used if the collection is bootstrapped into the page 
           this.collection.each(this.addOne)
       },
       addOne: function(model){  //this occurs every time a record is added to the collection           
           view = new Todo.Item({model:model,template:list_template, router:this.settings.router,rootEl: this.el});  //new single item view is instantiated  
           view.render(); //this new view is rendered
           $(this.el).find('ol').append(view.el); //this view is put onto the screen in the location we specify (jquery/zepto)
       },
       addToCollection: function(){ //callback function to add the new model to the collection, since the add event is bound, this will then do the addOne function and output to the screen.
       
           this.collection.add(this.model)
       }
   
   });
   
      
   return exports; 
});
