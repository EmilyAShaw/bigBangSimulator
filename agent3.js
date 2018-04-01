function Agent3Preload() {  
}

function Agent3() {
  // any variables you add here are for your own internal state

  // setup is run when the agent is reset
  // value is a number between 0 and 100



  this.setup = function(value, agent_type) {
    this.agent_type = agent_type;
  }

  // mouse over triggers hydrogen fusion, changing agent 2 into agent 4. Playing god.

  var destroy = 2; //the element you are destroying
  var destroyer = 4; //the element it turns into 
  


  this.activate = function() {
    scale(0.5);
    if (this.agent_type==destroy){
    scale(0.5);
    this.agent_type = destroyer;}

      
  

  }

  // decide on your next move based on neighbors (but don't do it yet)
  this.step = function(neighbors, radius) {


var r = 20;

    this.close = false;
    if(this.agent_type >= 0) {
      v = p5.Vector.random2D().mult(radius/r);
      for(var i=0; i<neighbors.length; i++) {
        var npos = neighbors[i].pos;
        var d = npos.mag();
        if ((d > 0) && (d < radius + neighbors[i].radius)) {
          this.close = true;
          // Calculate vector pointing away from neighbor
          var move_away = npos.mult(-1);
          move_away.normalize();
          move_away.div(d*0.1);        // Weight by distance
          v.add(move_away);
        }
      }
      return v;
    }


  }

  var turnInTo = 4;

 this.fusion = function(){
    	this.agent_type = turnInTo;

     
    }

    function mouseClicked(){

fill(255,0,0);
rect(0,0,960,500);

}


  this.draw = function(radius) {
    stroke(0);
    textSize(8);

    

    if(this.close && this.agent_type==2) {
      // sound.play(); tried to get a pop sound, code kept breaking
     scale(3);
       this.fusion();


   }


    else if(this.agent_type == 0) { //created transparent 'plasma'. I did this because ititiall I had 
      //black to fill the 'void' as back then there was nothing, but it did not look aesthetically nice.
    
       image(plasma,0,0,radius*2, radius*2);
}
else if(this.agent_type == 1) { //BERYLLIUM
    fill(109, 181, 94); //proton color 
    noStroke();
      
       ellipse(7, -3, radius/2, radius/2); //right proton
       ellipse(-7, -3, radius/2, radius/2);//left proton
       ellipse(0,7, radius/2, radius/2); //bottom proton
       fill(150, 237, 132);
       ellipse(4,4, radius/2, radius/2); //neutron
       ellipse(-4,4, radius/2, radius/2); //neutron

       ellipse(0,-4, radius/2, radius/2); //neutron
       fill(109, 181, 94); //proton color 
     ellipse(0, 1, radius/2, radius/2); //middle proton
    }
 else if(this.agent_type == 2) { //hydrogen
  scale(0.7);
      fill(255, 170, 0); 
      noStroke();
       ellipse(0, 0, radius*4, radius*4);
       stroke('red');
       noFill();
       fill(255,0,0);
       //ellipse(0,0,radius/2, radius/2);
       //text("H", -4, 5);
       noFill();
      // ellipse(0,0,radius*2, radius*2);

       fill(255, 170, 0);
    }
 else if(this.agent_type == 3) { //LITHIUM
     
      fill(170, 215, 239); //neutron color 
    noStroke();
      
       ellipse(7, -3, radius, radius); //right neutron
       ellipse(-7, -3, radius, radius);//left neutron
       ellipse(0,7, radius, radius); //bottom neutron
       fill(121, 191, 229); //proton color
       ellipse(4,4, radius, radius); //proton
       ellipse(-4,4, radius, radius); //proton

       ellipse(0,-4, radius, radius); //proton
       fill(170, 215, 239); //neutron color 
     ellipse(0, 1, radius, radius); //middle neutron
    }

 else if(this.agent_type == 4) {
     
     scale(4);
      image(atomicImage, -10, -10, radius*2, radius*2); //fusion
 }
   
  }
}

function hydrogen (x,y){
    ellipse(x,y, radius, radius);
  }
