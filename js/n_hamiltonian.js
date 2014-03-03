var graphicEvent = function(object, new_color) {
            this.object = object;
            this.last_color = object.material.color.getHex();
            this.new_color = new_color;
};

graphics = {
    millisecondsToWait : 500,
    
    print3DResult:function(result, textColor){
        // Get text from hash
        var theText = result;

        text3d = new THREE.TextGeometry( theText, {size: 30,height: 15,curveSegments: 2,font: "helvetiker"});
        text3d.computeBoundingBox();
        var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

        var textMaterial = new THREE.MeshBasicMaterial( { color: textColor } );
        text = new THREE.Mesh( text3d, textMaterial );

        text.position.x = 200;
        text.position.y = 150;
        text.position.z = 0;

        text.rotation.x = 0;
        text.rotation.y = Math.PI * 2;

        group = new THREE.Object3D();
        group.add( text );
        graphics.scene.add( group );
        
    },
    
    origin: null,
    destiny: null,
    
    refreshScene:function(){
        $isAnimated = $('#isAnimated');
        if(!$isAnimated.is(':checked'))
            return;
        
        var current_event = null;
        if(algorithm.event_queue.length > 0){
            current_event = algorithm.event_queue.splice(0,1)[0];
            
//            if(graphics.origin == null){
//                graphics.origin = current_event;
//                
//                setTimeout(function(){
//                    graphics.refreshScene();
//                }, graphics.millisecondsToWait);
//                
//                return;
//            }
//            else{
//                graphics.destiny = current_event;
//            }
//            
//            //Paint Edge
//            var geometry = new THREE.Geometry();
//            geometry.vertices.push(new THREE.Vector3(graphics.origin.object.x, graphics.origin.object.y, graphics.origin.object.z));
//            geometry.vertices.push(new THREE.Vector3(graphics.destiny.object.x, graphics.destiny.object.y, graphics.destiny.object.z));
//            //geometry.vertices.push(new THREE.Vector3(this.origin.object.x, this.origin.object.y, this.origin.object.z));
//         
//            var material = new THREE.LineBasicMaterial({
//                color: 0x00ff000,
//                linewidth: 10,
//                fog:false
//            });
//            
//            var edge_animation = new THREE.Line(geometry, material);
//            graphics.scene.add(edge_animation);
//            /*
//            for(var i =0; i<10;i++){
//                geometry.vertices.push(new THREE.Vector3(this.destiny.object.x, this.destiny.object.y, this.destiny.object.z));
//            }
//            */
//            graphics.origin = this.destiny;
//            graphics.destiny = null;
        }
        
        setTimeout(function(){
                    graphics.refreshScene();
                }, graphics.millisecondsToWait);
    }
    
}

algorithm = {
    event_queue:[],
    graph: null,
    found_solutions: [],
    final_solutions_dom:"",
    
    clear: function(){
        algorithm._graphDegree = -1;
        algorithm.path = [];
        
        algorithm.graph.nodes.forEach(function(node) {
            node.visited = false;
        });
    },
    
    graphDegree: function(){
        
        var graphDegree = 0;
        algorithm.graph.edges.forEach(function(edge) {
            graphDegree += edge.limit;
        }); 
        this._graphDegree = graphDegree;
        return graphDegree;
    },
    
    isEveryVertexVisited: function(){
        var result = true;
        algorithm.graph.nodes.forEach(function(node) {
            if(!node.visited)
                result = false;
        }); 
        return result;
    },
    
    printPrettyPath: function(temporal_path){
        var path_string = "";
        temporal_path.forEach(function(node){
             path_string += node.id + " "; 
        });

    },
    
    printPrettyEdgePath: function(temporal_path){
        var path_string = "";
        temporal_path.forEach(function(edge){
            var node1 = null,node2 = null;
            
            if(edge.direction == 1 || edge.direction == 0){
                node2 = edge.node1;
                node1 = edge.node2;
            }
            if(edge.direction == -1){
                node1 = edge.node1;
                node2 = edge.node2;
            }
                
             path_string += node1.id + "_" + node2.id + "-"; 
        });
        
        console.log(path_string);
    },

    createDOMAndSaveSolution: function(solution){
        algorithm.found_solutions.push(solution);        
        algorithm.final_solutions_dom += "<div class='solution'>";
        
        solution.forEach(function(node){
            algorithm.final_solutions_dom += "<div class='node' style='background-color:" + node.color + "'>" + node.id +  "</div>";
        });
        
        algorithm.final_solutions_dom += "</div><div style='clear:both'/>";
    },
    
    printDOMSolution: function(){
        if(algorithm.found_solutions.length == 0){
            graphics.print3DResult("Not Solvable", 0xFF0000);
            return;
        }
        
        graphics.print3DResult("Solvable", 0x00FF00);
        
        $leyend = $('#leyend').find('.solutions');
        $leyend.append(algorithm.final_solutions_dom);
    },
    
    euler: function(node, nodes_path, edge_path, graph_degree){
        if(node == null){
            //Start Point
            algorithm.graph.nodes.forEach(function(node){ //DFS from every start node    
                algorithm.euler(node,[],[],algorithm.graphDegree());
            });
             algorithm.printDOMSolution();    
            return;
        }
        
        nodes_path.push(node);
        node.visited = true;
        
        node.neighboors.forEach(function(neighboor){
            if(neighboor.edge.limit <= 0)
                return false;
            
            neighboor.edge.limit --;
            edge_path.push(neighboor.edge);
            algorithm.euler(neighboor.neighboor, nodes_path, edge_path, graph_degree);
            neighboor.edge.limit ++;
            edge_path.splice(edge_path.length-1,1);
        });
        
        if(edge_path.length == graph_degree && algorithm.isEveryVertexVisited()) //Check for solution
        {
            algorithm.createDOMAndSaveSolution(nodes_path);
        }
            
        nodes_path.splice(nodes_path.length-1,1);
        node.visited = false;
        
        return;
    },    
    
    
    dfs: function(node, solution){
        if(node != null){
            algorithm.event_queue.push(new graphicEvent(node.object,0xffffff));
            solution.push(node);
        }
        else {
            //Start Point
            console.log(algorithm.graph.nodes);
            
            algorithm.graph.nodes.forEach(function(node){ //DFS from every start node    
                algorithm.dfs(node,[]);
            });
            
             algorithm.printDOMSolution();
            
            return;
        }
        
        node.visited = true;
        var next_node = null;
        
        node.neighboors.forEach(function(neighboor){
            if(neighboor.neighboor.visited /*|| neighboor.limit == 0*/)
                return false;
            
            neighboor.limit --;
            solution = algorithm.dfs(neighboor.neighboor, solution);
        });
        
        if(solution.length == algorithm.graph.nodes.length) //We just found a solution
        {
            algorithm.createDOMAndSaveSolution(solution);
        }
        
        node.visited = false;
        solution.splice(algorithm.path-1,1);
        
        return solution;
    },    
};


