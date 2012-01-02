Backbone.Store
======================================================================

# About Backbone.Store
Backbone.Store is a Backbone.Sync replacement that uses Lawnchair.js for persistent JSON storage. It is based on the original [Backbone.localstorage 
sync extension by jeromegn](https://github.com/jeromegn/Backbone.localStorage), but does have a couple of added features.  It is currently written in AMD format and as such
requires usage of a module loader such as Require.js or curl.js, or you will need to alter it to not use AMD format.

Features:
 * Can use a backend server, or not, or a mixture of either,
 * Time-to-live for cache expiration,
 * Settings to determine when to load from server vs. use cached item outside of expiration
 
Planned Features:
 * Batch model upload to server (online/offline or time delayed),
 * Parameter based caching (for caching paging / search results / etc),
 * ??

# About this project
This project is in it's infancy, and as such does not currently include any tests or optimizations. While the read functions have been tested both with/without 
a backend server, all other CRUD functions have to this point only been tested without a RESTful interface. This will change as the project matures.  

Backbone.Store is included as part of a really basic "Todo" style application in order to show the setup/usage and functionality. 

# Usage
Please refer to app/todo/models/todo.js for model settings. That should be all you need to actually use Backbone.Store.  Two other functions are:
 * Backbone.Store.ClearFromCache(model or collection, relatives)  - to remove the cached data. Setting relatives to true will destroy the related model or collection,
 * Backbone.Store.nuke() - to clear the entire storage cache - good for testing.
	

