Backbone.Store
======================================================================

# About Backbone.Store
Backbone.Store is a Backbone.Sync replacement that uses Lawnchair.js for persistent JSON storage. It is based on the original [Backbone.localstorage 
sync extension by jeromegn](https://github.com/jeromegn/Backbone.localStorage), but does have a couple of added features.  It is currently written in AMD format and as such
requires usage of a module loader such as Require.js or curl.js, or you will need to alter it to not use AMD format.  The project includes a really basic backend using CodeIgniter (php) in order
to make it as easy as possible to set up on your local machine. 

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

# Dependencies
Require.js (or modify to not use AMD module loading), Lawnchair.js, Underscore.js, Backbone.js, backbone.store.js
All dependencies are included in the project.

# Setup
You will need:

* A LAMP stack - either your own custom stack, or one of any number of preconfigured packages (MAMP, XAMP, ZWAMP, etc)
* To know how to create a virtual host, or to alter the main script path and the Backbone history root setting.  

# Installation

* In order to make this work on your specific system, you will need to create your database, import the included application/setup/todo.sql file, and change your database configuration settings in application/config/database.php

# Updates

V 0.2:

* Fixed bug to allow use of collection parsing
* Changed model property name to 'store' instead of 'lawnchair' for naming consistency
* Added non-model based peristent state

V 0.3:

* Added 'complete' event for collection updates.. due to the way backbone.store was implemented, it fires an 'add' event for each model put in the collection,instead of one 'add' for the entire collection.  The 'complete' event will allow you to act on only the full collection. 
* Added ability to set store.key as a function for dynamic keys - this can be useful for things like paging, where you can use the url/hash to store 'pages' of data.
