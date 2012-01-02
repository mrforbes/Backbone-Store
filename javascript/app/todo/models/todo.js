define('app/todo/models/todo',['underscore','backbone.store'],function(_,Backbone){
    var Todo = {}
    
    Todo.Item = Backbone.Model.extend({
        defaults:{
           "todo": "",
           "note":"" 
        },
        lawnchair:{
            'server': false,
            'ttl':3600,
            'key':'todolist'
        },
        url:'/todo/add'
    })
    
    Todo.List = Backbone.Collection.extend({
        model: Todo.Item,
      //  url: 'http://beta.dhmstaging.com/api/listings/CA/anaheim_hills/-117.722784=NELong/33.861508=NELat/-117.731472=SWLong/33.856164=SWLat/',
        url: '/javascript/app/todo/fixtures/todo.json',
        lawnchair:{
            server:true,
            ttl: 3600,
            key:'todolist'
        }
        
    })
    
    return Todo;
      
});


