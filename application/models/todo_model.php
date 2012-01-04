<?php

class Todo_model extends CI_Model {
    
    function __construct()
    {
        // Call the Model constructor
        parent::__construct();
       
    }      
    
    private function formatResultForBackbone($query){
        $result = array();
        if(sizeof($query) > 0) {
            foreach( $query->result() as $row){
                $result[$row->id] = $row;
            }
        }
        return array($result);
        
    }
    
    public function get($id){
        $query = $this->db->get_where('todos', array('id' => $id));
        return $this->formatResultForBackbone($query);
    }
    
    public function get_all(){
        $query =  $this->db->get('todos');
        return $this->formatResultForBackbone($query);
        
    }
    
    public function delete($id){
        $query =  $this->db->delete('todos',array('id'=>$id));
    }
    
    public function update($id, $fields){
        $query =  $this->db->update('todos',$fields,array('id'=>$id));
        return $query;
    }
    
    public function set($fields){
     //   print_r($fields);
        $query =  $this->db->insert('todos',$fields);
        return $this->db->insert_id();
		
    }
    
    
}

?>