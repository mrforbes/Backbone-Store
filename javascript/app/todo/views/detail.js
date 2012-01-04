define('app/todo/views/detail',['underscore','jquery','backbone.store','../models/todo','text!../templates/detail.html','pubsub'],function(_,$,Backbone, model, template){
   var exports = {};
  //this sets underscore templates to use moustache style {{}}     
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
 };
 
 /* most modules will have a collection view and a model view - in some cases they may have multiple collections and modules with an overarching parent 
  * but if so - your application is too tightly coupled.  use pubsub or mediator/subscriber patterns instead to communicate across modules.
  */
       
   exports.Detail = Backbone.View.extend({
       events: { 
       	   "click .remove": "removeOne",
           "click .edit": "editOne"
       },
       initialize: function(options){
       	this.settings = {};
         _.bindAll(this,'render','show','hide','editOne','removeOne','preRender','remove');
         // parse the template html to make it a real template
         _.extend(this.settings, options);
         this.template = _.template(template);
         
         //if an id is passed ,this means the creation originates in the router, meaning the user came here directly.
         if(this.settings.id){
         	this.model.id = this.settings.id;
         }
         this.delegateEvents();
         
       },
       preRender: function(){
       	 
         // get the model date and then go on to the show event
          this.model.bind("change",this.render);
          this.model.bind("destroy",this.remove);
          this.model.fetch();
         // this.show();  
       },
       render: function(){
       	 $(this.el).empty().append(this.template(this.model.toJSON()));
       	 this.show();
       },
       show:function(){
         $(this.settings.rootEl).find('.todo-list').fadeOut();  
       //if the record hasn't been rendered yet add it to the page.
         if($("#todo-"+this.model.id).length === 0){
             $(this.settings.rootEl).append(this.el)
         }
         //could add an animate here.
         $("#todo-"+this.model.id).show();
         
            
       },
       hide: function(){
          $('.todo-detail').hide();
       },
       remove: function(){
       	$(this.el).remove();
       	this.settings.router.navigate('');
       	//publish the item remove event when in detali to tell list to show itself.
       	PubSub.publish( 'Todo.Detail.remove', {} );
       },
       removeOne: function(e){
       	   e.preventDefault();
           this.model.destroy(); // starts the delete process. this will ultimately call this.remove
       },
       editOne: function(e){
       	  e.preventDefault();
       	  this.model.set({todo:'Testing this out'});
       	  this.model.save();
       },
       updateTodo: function(){
       	  $(this.el);
       }
      
   
   });
  
  
   return exports; 
});
