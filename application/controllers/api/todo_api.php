<?php defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Example
 *
 * This is an example of a few basic user interaction methods you could use
 * all done with a hardcoded array.
 *
 * @package		CodeIgniter
 * @subpackage	Rest Server
 * @category	Controller
 * @author		Phil Sturgeon
 * @link		http://philsturgeon.co.uk/code/
*/

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH.'/libraries/REST_Controller.php';

class Todo_api extends REST_Controller
{
    

	function todo_get()
    {
        
        $this->load->model('todo_model');
        $todo = $this->todo_model->get( $this->get('id') );     
        
        if(!$this->get('id') || !$todo)  
        {  
            $this->response(NULL, 400);  
        }  
        else{
            $this->response($todo, 200); 
        }
    }
    
    function todo_post()
    {
        $this->load->model('todo_model');
      
        
        $result = $this->todo_model->set($this->post());
  
        if(sizeof($result)===0)  
        {  
            $this->response(array('status' => 'failed'));  
        }  
  
        else  
        {  
            $this->response(array(array('id' => $result)));  
        }  
  
    }
    
    function todo_put(){
        $this->load->model('todo_model');
        $result = $this->todo_model->set( $this->put('id'), array(  
            'todo' => $this->put('todo')  
        ));  
  
        if($result === FALSE)  
        {  
            $this->response(array('status' => 'failed'));  
        }  
  
        else  
        {  
            $this->response(array('status' => 'success'));  
        }  
    }
    
    function todo_delete()
    {
         $this->load->model('todo_model');
    	$result = $this->todo_model->delete( $this->delete('id'), array(  
            'todo' => $this->delete('todo')  
        ));  
  
        if($result === FALSE)  
        {  
            $this->response(array('status' => 'failed'));  
        }  
  
        else  
        {  
            $this->response(array('status' => 'success'));  
        }  
    }
    
    function todos_get()
    {
        
       $this->load->model('todo_model');
       $todos = $this->todo_model->get_all();  
  
        if($todos)  
        {  
            $this->response($todos, 200);  
        }  
  
        else  
        {  
            $this->response(NULL, 404);  
        } 
       
    }


	
}