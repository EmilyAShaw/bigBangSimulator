function Agent1() {
  // any variables you add here are for your own internal state
  this.is_alive = false;
  this.was_alive = false;

  // setup is run when the agent is reset
  // value is a number between 0 and 100
  this.setup = function(value) {
    if(value > 50) {
      this.is_alive = true;
    }
    else {
      this.is_alive = false;
    }
    this.was_alive = this.is_alive;
  }

  // this happens generally on mouse over
  this.activate = function() {
    this.is_alive = true;
  }

  // decide on your next move based on neighbors (but don't do it yet)
  this.step = function(neighbors) {
    var num_neighbors_alive = 0;
    for(var i=0; i<neighbors.length; i++) {
      if(neighbors[i].agent.is_alive) {
        num_neighbors_alive = num_neighbors_alive + 1;
      }
    }

    // lonliness
    if (this.is_alive && num_neighbors_alive < 2) {
      this.next_alive = false;
    }
    // overpopulation
    else if (this.is_alive && num_neighbors_alive > 3) {
      this.next_alive = false;
    }
    // reproduction
    else if (this.is_alive == false && num_neighbors_alive == 3) {
      this.next_alive = true;
    }
    // statis
    else {
      this.next_alive = this.is_alive;
    }
  }

  // execute the next move you decided on
  this.update_state = function() {
    this.was_alive = this.is_alive;
    this.is_alive = this.next_alive;
  }

  this.draw = function(size) {
    stroke(0);
    if(this.is_alive == true && this.was_alive == true) {
      fill(255, 170, 0); //hydrogen
    }
    else if(this.is_alive == true && this.was_alive == false) {
      fill(0, 244, 0);//berillym
    }
    else if(this.is_alive == false && this.was_alive == true) {
      fill(244, 0, 0); //lithium
    }
    else {
      fill(0, 0, 30);
    }
    rect(0, 0, size, size);
  }
}