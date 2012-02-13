/*
 * Backbone.Store
 * @version: 0.3
 * @author: Michael Forbes
 * @description: based on backbone.localstorage, this one uses Lawnchair.js to provide the JSON storage adapter, allowing it to be used with
 * a larger range of browsers / devices including IE<8, mobile, and browsers that support indexDB 
 * @license: do whatever you want with it, but please keep the above attached.
 * TODO: make this not dependent on AMD loader (require in this case)
 */


define('backbonestore',['underscore','backbone','libs/lawnchair'],function(_,Backbone,Lawnchair){
    

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


Backbone.Store = Lawnchair(function(){});  //create a lawnchair instance as Backbone.Store 
   
_.extend(Backbone.Store, {
// save the model to lawnchair
  saveModel: function(settings,model,fromCollection){
    
     var json = model.toJSON();
     if(json[model.idAttribute]){
         model.id = json[model.idAttribute];
     }
     else if(!model.id){
         model.id = guid();
     } 
     if(fromCollection) json.fromCollection = true;
     else{
         if(json.hasOwnProperty('fromCollection')){
             delete json.fromCollection;
         }
         json.isComplete = true;
     }
     if(settings.isComplete) {
         json.isComplete = settings.isComplete; //use this to specify if original stored model has complete detail data
     }
     json.id = model.id;
     json.key = settings.key + '-' + model.id;
     json.timestamp = +new Date();
  
     this.save(json);  
  },
  //save the collection to lawnchair, this is just a reference to the stored models.
  saveCollection: function(key, ids){
     this.save({key:key,models:ids,timestamp:+new Date()}); 
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(method,model,options) {
     var self = this;
     
     //if using a server, push the new object up, don't add to store unless successfull
     if(model.store.server){
         options.success = function(resp){
            
            if(resp[model.idAttribute]){
                // set the model id her
                
                model.id = resp[model.idAttribute];
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
     this.get(model.store.key,function(data){
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
      this.saveCollection(model.store.key,ids);
     
      model.trigger('save');
  },

 
  update: function(method,model,options) {
      
       //need to update the stored version of the model, and send it to the server
       var key = model.store.key + '-' + model.id;
       var self = this,
       success = null;
       
       
       if(model.store.server){
         //save it back to the server
         if(options.success){
            success = options.success;
         }
         
         options.success = function(resp){  
            self.saveModel(model);
            if(success) success();
         }
         
         Backbone.RESTfulsync(method,model,options);
         
       }
       else {
         self.saveModel(model);
       }
  },

  // Retrieve a model from `this.data` by id.
  find: function(method,model,options) {
      
        var self = this;
        var key = model.store.key+'-'+model.id;
        var success = null;
        var loadFromServer = false;
        var thisData = {};
      
   
            this.get(key,function(data){
                
                if(!model.store.server){  //not using server, doesnt matter
                    thisData = data;
                }
                else if((!data || data.fromCollection || !data.isComplete) && model.store.server){
                    //we have data, and it is complete (fromCollection flag has been removed)
                    loadFromServer = true;
                }
                else{
                    var expired = checkExpired(model.store, data.timestamp);
                    if(expired){
                        loadFromServer = true;
                    }
                    else {
                        thisData = data;
                    }
                } 
                
            });
        
      
        if(loadFromServer){
            if(options.success) success = options.success;
                   options.success = function(data){
                       var record = data[0];
                       if(data[model.idAttribute]){
                           record = data;
                       }
                      _.each(record,function(row){
                          model.set(row);
                          self.saveModel(model, false);  
                          if(success) success(model);  
                      });
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
                          self.saveModel(model.store,row, true);
                      });
                      
        self.saveCollection(model.store.key,ids);     
  },
  // Return the array of all models currently in storage.
  findAll: function(model,options) {
    
   
   //make jsonp if external url
    if(typeof model.url === 'String' && model.url.match(/http/)!==null){
            options.dataType = 'jsonp';
    }
    var self = this;

    self.get(model.store.key,function(data){
        
        //tried to get the data, but it came back null. if we are using a server, we need to get the data from there. otherwise we will create an empty key
        if(!data){
            if(model.store.server){     
                 
                options.success = function(resp, status, xhr){
                      if(_.isFunction(model.parse)) model.parse(resp, xhr)
                      var ids = [];
                      if(_.isArray(resp)) resp = resp[0];
                      _.each(resp,function(row){
                          model.add(row);
                      });
                      
                      self.saveModelsAndCollections(model); 
                      model.trigger('complete',model)
                }
                
                return Backbone.RESTfulsync('read', model, options);  
                //this does the original ajax call as if there was no local storage
                        
            }
            else{
                //not using a server, make sure collection exists.
                self.saveModelsAndCollections(model); 
                model.trigger('complete',model)
            }
        }
        else{
            var expired = checkExpired(model.store, data.timestamp)
            if(expired){
                this.remove(model.store.key);                   
                this.findAll(model, options);
            } 
            else
            {
                //make sure the collection is fresh
                model.reset();
                //here we need to get all of the saved models and put them in the collection
                
                 _.each(data.models,function(id){
                          self.get(model.store.key + '-' + id, function(data){
                              if(data) model.add(data)
                          })
                });
                 model.trigger('complete',model)
            }
        }
     });
  },
  destroy: function(method,model,options) {
    var self = this;
    if(model.store.server){
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
        var key = model.store.key + '-' + model.id;
        this.remove(key);
        
        this.get(model.store.key,function(data){
            var index = data.models.indexOf(model.id);
            data.models.splice(index,1);
            ids = data.models;
        });
        this.saveCollection(model.store.key,ids);
        
        if(!noremove) {
               model.trigger('destroy');
        }
        
  },
  clearFromCache: function(model, relatives){
      //this is a backbone.store call that will clear the cached copy of the data. can be used to prevent overflowing memory limits, etc...  set relatives to true to reset any related stores (shared key)
      // usage:  Backbone.Store.clearFromCache({stored model or collection});
      // this does not remove individual models from a stored collection.
      var key = model.store.key
      if(model.id){
          //this is not a collection, add the id
          key = key + '-'+ model.id   
          
          if(relatives){  //this would be a collection
             this.remove(model.store.key)
          }
          
      }
      else{
           this.remove(model.store.key)
           if(relatives){
               this.remove(model.store.key+'-'+model.id)
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

  
 
  if(model.store) {     
    var chair = Backbone.Store;
    
    //allow key to be a function
    if(_.isFunction(model.store.key)){
        model.store.keyFunction = model.store.key;
    }
    
    //there are a lot of ways to do this... store keyfunction separately so it can re-overwrite key each time it is called.
    if(_.isFunction(model.store.keyFunction)){
        model.store.key = model.store.keyFunction.call(model)
    }
    
    
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


  try{
  if (resp) {
    options.success(resp);
  } else {
    options.error("Record not found");
  }
  }
  catch(err){
    
  }
};

_.extend(Backbone.Store,{
    saveState: function(key, value, ttl){
        //key is the component name
        //value is a hash of state information
        
        this.save({key:key,data:{value:value,ttl:ttl,timestamp:+new Date()}},function(obj){
            
        })
    },
    loadState: function(key){
        var response = null;
        
        this.get(key, function(data){
            
             if(data===null) return null;
             
             var now = +new Date();
             var diff = Math.abs(data.timestamp - now) / 1000;
             if(diff > data.ttl && data.ttl > 0) this.destroystate(key);
             else if(data!=null) response = data.data.value;
        });
        
        return response
    },
    destroyState: function(key){
        var response = null
        this.destroy(key, function(data){
            response = true
        });
        
        return response
    }
})
    
    
    return Backbone;
})
