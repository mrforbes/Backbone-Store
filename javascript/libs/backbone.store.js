/*
 * Backbone.Store
 */
define('backbone.store',['underscore','backbone','libs/lawnchair'],function(_,Backbone,Lawnchair){
    

function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    
    // Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
       return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    };

function checkExpired(lawnchair, timestamp){
    var now = +new Date();
    var diff = Math.abs(timestamp - now) / 1000;
    if((diff > lawnchair.ttl && lawnchair.ttl > 0) || lawnchair.destroy){
        return true;   
    }
    else{
        return false;
    }
}


Backbone.Store = Lawnchair(function(){});   
   
_.extend(Backbone.Store, {
  // Save the current state of the **Store** to *localStorage*.
  saveData: function(model, data) {
     
     if(model.id){
         model.lawnchair.key = model.lawnchair.key + '-' + model.id;
     }
     
  	 //again, check to see if we are using a server - we don't want to create empty lawnchairs if we are using a server without checking the server first
  	 if(!model.lawnchair.server){
  	 	if(!data) var data = {};
    	this.save({key:model.lawnchair.key,records:data});
     }
     else
     {
     	var now = +new Date(); //add a timestamp so we can expire the storage later
     	this.save({key:model.lawnchair.key,records:data,timestamp:now});
     }
  },
  
  saveModel: function(model, fromCollection){
     if(!model.id) model.id = guid();
     var json = model.toJSON();
     if(fromCollection) json.fromCollection = true;
     else{
         if(json.hasOwnProperty('fromCollection')){
             delete json.fromCollection;
         }
         model.lawnchair.isComplete = true;
     }
     if(model.lawnchair.isComplete) json.isComplete = model.lawnchair.isComplete; //use this to specify if original stored model has complete detail data
     json.id = model.id;
     json.key = model.lawnchair.key + '-' + model.id;
     json.timestamp = +new Date();
    
     this.save(json);  
  },
  saveCollection: function(key, ids){
     this.save({key:key,models:ids,timestamp:+new Date()}); 
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(method,model,options) {
     var self = this;
     
     //if using a server, push the new object up, don't add to store unless successfull
     if(model.lawnchair.server){
         options.success = function(resp){
         	
            if(resp[0][model.idAttribute]){
                // set the model id her
                
                model.id = resp[0][model.idAttribute];
                var modelatt = {};
                modelatt[model.idAttribute] = model.id;
                model.set(modelatt);
            }    
            self.addToStore(model);
         } 
         Backbone.RESTfulsync(method,model,options);
     }
     else{
         self.addToStore(model);
     }
     
     
  },
  
  addToStore: function(model){
       
     var ids = [];
    
     //get the list of associated stored models
     this.get(model.lawnchair.key,function(data){
         if(data){
           ids = ids.concat(data.models);   
         }
      });
      
      if(!model.id) {
          model.id = guid();
          model.set({id:model.id});
      }
      this.saveModel(model);
      ids.push(model.id);
      this.saveCollection(model.lawnchair.key,ids);
     
      model.trigger('save');
  },

 
  update: function(method,model,options) {
      
       //need to update the stored version of the model, and send it to the server
       var key = model.lawnchair.key + '-' + model.id;
       var self = this,
       success = null;
       
       
       if(model.lawnchair.server){
       	 //save it back to the server
       	 if(options.success){
       	 	success = options.success;
       	 }
       	 
       	 options.success = function(model,resp){
       	 	self.saveModel(model);
       	 	if(success) success();
       	 }
       	 
       }
       else {
       	 self.saveModel(model);
       }
  },

  // Retrieve a model from `this.data` by id.
  find: function(method,model,options) {
      
        var self = this;
        var key = model.lawnchair.key+'-'+model.id;
        var success = null;
        var loadFromServer = false;
        var thisData = {};
      
       
        if(!model.lawnchair.isComplete && model.lawnchair.server){
            // we don't have a complete dataset, so lets get the detail from the server
            loadFromServer = true;
        }
        else{
           
            this.get(key,function(data){
            	
                if(!model.lawnchair.server){  //not using server, doesnt matter
                    thisData = data;
                }
                else if((!data || data.fromCollection) && model.lawnchair.server){
                    //we have data, and it is complete (fromCollection flag has been removed)
                    loadFromServer = true;
                }
                else{
                    var expired = checkExpired(model.lawnchair, data.timestamp);
                    if(expired){
                        loadFromServer = true;
                    }
                    else {
                        thisData = data;
                    }
                } 
                
            });
        }
       // console.log(thisData, data)
        if(loadFromServer){
            if(options.success) success = options.success;
                   options.success = function(data){
                      model.set(data[0]);
                      self.saveModel(model, false);  
                      if(success) success(model);  
                    }
            return Backbone.RESTfulsync(method, model, options);
        }
        else{
            model.set(thisData);
            if(options.success) options.success();
        }
        
        
      
  },
  saveModelsAndCollections: function(model){
        var ids = [],
            self = this;
        _.each(model.models,function(row){
                          ids.push(row.id);
                          self.saveModel(row, true);
                      });
                      
        self.saveCollection(model.lawnchair.key,ids);     
  },
  // Return the array of all models currently in storage.
  findAll: function(model,options) {

  	if(model.url.match(/http/)!==null){
            options.dataType = 'jsonp';
    }
  	var self = this;
  	self.get(model.lawnchair.key,function(data){
  	
  	 	//tried to get the data, but it came back null. if we are using a server, we need to get the data from there. otherwise we will create an empty key
  	 	if(!data){
  	 		if(model.lawnchair.server){
  	 		     
  	 		    options.success = function(data){
                      var ids = [];
                      _.each(data[0],function(row){
                          model.add(row);
                      });
                      
                      self.saveModelsAndCollections(model); 
                }
                return Backbone.RESTfulsync('read', model, options);  //this does the original ajax call as if there was no local storage
                		
  	 		}
  	 		else{
  	 		    //not using a server, make sure collection exists.
  	 		    self.saveModelsAndCollections(model); 
  	 		}
  	 	}
  	 	else{
  	 		var expired = checkExpired(model.lawnchair, data.timestamp)
            if(expired){
				this.remove(model.lawnchair.key);	       			
				this.findAll(model, options);
			} 
			else
			{
  	 			//make sure the collection is fresh
  	 			model.reset();
  	 			//here we need to get all of the saved models and put them in the collection
  	 			
				 _.each(data.models,function(id){
                          self.get(model.lawnchair.key + '-' + id, function(data){
                              if(data) model.add(data)
                          })
                });
				
			}
  	 	}
  	 });
  },
  destroy: function(method,model,options) {
    var self = this;
    if(model.lawnchair.server){
        //need to delete from the server, then remove from stored collection
         options.success = function(resp){
            self.removeFromStore(model);
         } 
         Backbone.RESTfulsync(method,model,options);
    }else{
        //just delete it from the lawnchair collection
        this.removeFromStore(model);
    }
  },
  removeFromStore: function(model,noremove){
        var self = this;
        var ids = [];
        var key = model.lawnchair.key + '-' + model.id;
        this.remove(key);
        
        this.get(model.lawnchair.key,function(data){
            var index = data.models.indexOf(model.id);
            data.models.splice(index,1);
            ids = data.models;
        });
        this.saveCollection(model.lawnchair.key,ids);
        
        if(!noremove) {
               model.trigger('destroy');
        }
        
  },
  clearFromCache: function(model, relatives){
      //this is a backbone.store call that will clear the cached copy of the data. can be used to prevent overflowing memory limits, etc...  set relatives to true to reset any related stores (shared key)
      // usage:  Backbone.Store.clearFromCache({stored model or collection});
      // this does not remove individual models from a stored collection.
      var key = model.lawnchair.key
      if(model.id){
          //this is not a collection, add the id
          key = key + '-'+ model.id   
          
          if(relatives){  //this would be a collection
             this.remove(model.lawnchair.key)
          }
          
      }
      else{
           this.remove(model.lawnchair.key)
           if(relatives){
               this.remove(model.lawnchair.key+'-'+model.id)
           }
      }
      this.remove(key);
      
    
      
      
      
  }

});

Backbone.RESTfulsync = Backbone.sync

// Override `Backbone.sync` to use delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
Backbone.sync = function(method, model, options, error) {

  // Backwards compatibility with Backbone <= 0.3.3
  if (typeof options == 'function') {
    options = {
      success: options,
      error: error
    };
  }

  
 
  if(model.lawnchair) { 	
    var chair = Backbone.Store;
   
	  switch (method) {
	    case "read":    resp = model.id ? chair.find(method,model, options) : chair.findAll(model,options); break;
	    case "create":  resp = chair.create(method,model,options);                            break;
	    case "update":  resp = chair.update(method, model, options);                            break;
	    case "delete":  resp = chair.destroy(method,model,options);                           break;
	  }
  
  }
  else{
  	Backbone.RESTfulsync(method,model,options,error)
  }



  if (resp) {
    options.success(resp);
  } else {
    options.error("Record not found");
  }
};

_.extend(Backbone,{
	savestate: function(key, value){
		//key is the component name
		//value is a hash of state information
		
		Backbone.Store.save({key:key,value:value},function(obj){
			
		})
	},
	loadstate: function(key){
		var response = null
		Backbone.Store.get(key, function(data){
			//console.log(response)
			if(data!=null) response = data.value
		});
		
		return response
	},
	destroystate: function(key){
		var response = null
		Backbone.Store.destroy(key, function(data){
			response = true
		});
		
		return response
	}
})
	
	
	return Backbone;
})
