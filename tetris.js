
//Used to help create a seeded generated random number for choosing shapes. makes results deterministic (reproducible) for debugging
var rndSeed = 1;










//Block shapes
var shapes = {
  I: [[0,0,0,0], 
      [1,1,1,1],
      [0,0,0,0], 
      [0,0,0,0]],
  J: [[2,0,0], 
      [2,2,2], 
      [0,0,0]],
  L: [[0,0,3], 
      [3,3,3], 
      [0,0,0]],
  O: [[1,2], 
      [3,4]],
  S: [[0,5,5], 
      [5,5,0], 
      [0,0,0]],
  T: [[0,6,0], 
      [6,6,6], 
      [0,0,0]],
  Z: [[7,7,0], 
      [0,7,7], 
      [0,0,0]],
  X: [[1,2,3], 
      [4,5,6], 
      [7,8,9]],
  };

codes = ["I","J","L","O","S","T","Z"];
//Block colors
var colors = ["CBCBCB", "F92338", "A733F9", "1C76BC", "FEE356", "53D504", "36E0FF", "F8931D", "EB13E6", "#FFFFFF"];



/**
 * Game
 */

var game = new Game(10, 20, "game", 500);


/**
 * Game
 */
function Game(w, h, game, steps){
  this.dom = document.getElementById(game);
  this.domStatus = document.getElementById("status");
  this.domStats = document.getElementById("stats");
  this.board = [];
  this.height = h;
  this.width = w;
  this.default = 0;
  this.steps = steps;
  this.shape = 0;
  this.state = 0;
  this.score = 0;
  this.interval;
  console.log("created");

  
}
Game.prototype.start = function(){
 this.reset();
 console.log(this.board);
 this.loop(this);
}

Game.prototype.loop = function() {
  console.log("draw");
  this.setTimeout(this.loop, this.steps);
}

Game.prototype.reset = function(){
  this.state = 0;
  this.shape = 0;
  this.score = 0;
  this.board = [];
  for (var y = 0; y < this.height; y++) {
    if(this.board.length <= y) this.board.push([]);
    for (var x = 0; x < this.width; x++) {
      this.board[y].push(this.default);
    }
  }
};

Game.prototype.step = function(){

  if(!this.checkState()) return false;
  if(!this.shape) return this.nextShape();

  this.gravity();
 

}

Game.prototype.checkState = function() {
  if(this.state == 1 ){
    this.reset();
    return false;
  }
  return true;
}

Game.prototype.gravity = function(){

  this.moveDown();
}

Game.prototype.moveDown = function(){

  if(!this.shape) return false;

  this.removeShape();
  // if typeof this.shape == 'undefined';
  if(this.collision(0, 1)){

    //move down
    this.addShape();

    this.clearRows();

    this.nextShape();

    return;
  }
  this.score++;
  this.shape.y++;
  this.addShape();
  

}

Game.prototype.moveRight = function(){

  if(!this.shape) return false;

  this.removeShape();
  // if typeof this.shape == 'undefined';
  if(this.collision(1, 0)){

    //move right
    return this.addShape();
  }
  this.shape.x++;
  this.addShape();

}
Game.prototype.moveLeft = function(){

  if(!this.shape) return false;

  this.removeShape();
  // if typeof this.shape == 'undefined';
  if(this.collision(-1, 0)){

    //move left
    return this.addShape();

  }
  this.shape.x--;
  this.addShape();

}

Game.prototype.rotateShape = function() {

  if(!this.shape) return false;

  this.removeShape();
  this.shape.rotate(1);
  if(this.collision(0,0)){
    this.shape.rotate(3);
  }
  this.addShape();

}

Game.prototype.collision = function(x, y) {

  var shape_x = this.shape.x + x;
  var shape_y = this.shape.y + y;
  // console.log(this.shape.y, this.height);
  for (var row = 0; row < this.shape.shape.length; row++) {
    for (var col = 0; col < this.shape.shape[row].length; col++) {
      if (this.shape.shape[row][col] !== 0) {

         if(this.board[shape_y + row] === undefined) return true;

         if(this.board[shape_y + row][shape_x + col] !== 0 ||
            this.board[shape_y + row][shape_x + col] === undefined) {
            return true;
        }
      }
    }
  }
  return false;
}

Game.prototype.nextShape = function() {
  this.shape = new Shape();
  this.shape.x = Math.floor(this.width / 2) - 1;

  if(this.collision(0, 0)){
    this.state = 1;
  }
  this.addShape();
};

Game.prototype.draw = function(){

  var html = "";

  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      html += "<span style=\"color:#" + colors[this.board[y][x]] + "\">&#9632;</span>";
    }
    html += "<br>";
  }
  this.dom.innerHTML = html;

  if(this.state){
    this.domStatus.innerHTML = "Lost";
  }else{
    this.domStatus.innerHTML = "Running";
  }

  this.domStats.innerHTML = "<table>\
  <tr><td>Name</td><td>Value</td></tr>\
  <tr><td>Score</td><td>"+this.score+"</td></tr>\
  <tr><td>Status</td><td>"+this.state+"</td></tr>\
  <tr><td>Steps</td><td>"+this.steps+"</td></tr>\
  <tr><td>Shape</td><td>"+JSON.stringify(this.shape)+"</td></tr>\
  </table>";
}

Game.prototype.removeShape = function() {

  for (var row = 0; row < this.shape.shape.length; row++) {
    for (var col = 0; col < this.shape.shape[row].length; col++) {
      if (this.shape.shape[row][col] !== 0) {
        this.board[this.shape.y + row][this.shape.x + col] = 0;
      }
    }
  }
}
Game.prototype.addShape = function() {

  for (var row = 0; row < this.shape.shape.length; row++) {
    for (var col = 0; col < this.shape.shape[row].length; col++) {
      if (this.shape.shape[row][col] !== 0) {
        this.board[this.shape.y + row][this.shape.x + col] = this.shape.shape[row][col];
      }
    }
  }

}

Game.prototype.clearRows = function(){

  //empty array for rows to clear
  var fullRows = [];
  //for each row in the grid
  for (var row = 0; row < this.height; row++) {
    var containsEmptySpace = false;
    //for each column
    for (var col = 0; col < this.board[row].length; col++) {
      //if its empty
      if (this.board[row][col] === 0) {
        //set this value to true
        containsEmptySpace = true;
      }
    }
    //if none of the columns in the row were empty
    if (!containsEmptySpace) {
      //add the row to our list, it's completely filled!
      fullRows.push(row);
    }
  }

  //increase score for up to 4 rows. it maxes out at 12000
  if (fullRows.length == 1) {
    this.score += 400;
  } else if (fullRows.length == 2) {
    this.score += 1000;
  } else if (fullRows.length == 3) {
    this.score += 3000;
  } else if (fullRows.length >= 4) {
    this.score += 12000;
  }
  //new array for cleared rows
  var rowsCleared = fullRows.length;
  //for each value
  for (var toClear = fullRows.length - 1; toClear >= 0; toClear--) {
    //remove the row from the grid
    this.board.splice(fullRows[toClear], 1);
  }
  //shift the other rows
  while (this.board.length < this.height) {
    this.board.unshift([0,0,0,0,0,0,0,0,0,0]);
  }

  //return the rows cleared
  return rowsCleared;
 
}
Game.prototype.loop = function(t){

  t.step();
  t.draw();
  t.interval = setTimeout(t.loop, t.steps, t)

}


/**
 * Shape class
 */
function Shape(){

  this.type = codes[Math.round( Math.random() * ( codes.length - 1))];
  this.shape = shapes[this.type];
  this.x = 0;
  this.y = 0;
  
}

Shape.prototype.transpose = function() {
  var shape = this.shape;
  this.shape = shape[0].map(function(col, i) {
    return shape.map(function(row) {
      return row[i];
    });
  });
}

Shape.prototype.rotate = function(times) {
  
  for (var t = 0; t < times; t++) {
    //flip the shape matrix
    this.transpose();
    //and for the length of the matrix, reverse each column
    for (var row = 0; row < this.shape.length; row++) {
      this.shape[row].reverse();
    }
  }

}








window.onload = game.start();


//key options
window.onkeydown = function (event) {

  var characterPressed = String.fromCharCode(event.keyCode);

  if (event.keyCode == 38) {
    game.rotateShape();
  } else if (event.keyCode == 40) {
    game.moveDown();
  } else if (event.keyCode == 37) {
    game.moveLeft();
  } else if (event.keyCode == 39) {
    game.moveRight();
  } else if (characterPressed.toUpperCase() == "X") {
    game.steps *= 2;
  } else if (characterPressed.toUpperCase() == "Z") {
    game.steps /= 2;
  } else if (characterPressed.toUpperCase() == "C") {
    ai = !ai;
  // } else if (characterPressed.toUpperCase() == "G") {
  //   if (localStorage.getItem("archive") === null) {
  //     alert("No archive saved. Archives are saved after a generation has passed, and remain across sessions. Try again once a generation has passed");
  //   } else {
  //     prompt("Archive from last generation (including from last session):", localStorage.getItem("archive"));
  //   }
  // } else if (characterPressed.toUpperCase() == "F") {
  //   inspectMoveSelection = !inspectMoveSelection;
  } else {
    console.log("Pressed : " + characterPressed);
    return true;
  }
  //outputs game state to the screen (post key press)
  game.draw();
 
  return false;
};
