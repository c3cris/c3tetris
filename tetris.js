//Block shapes
var shapes = {
  I: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
  J: [[2,0,0], [2,2,2], [0,0,0]],
  L: [[0,0,3], [3,3,3], [0,0,0]],
  O: [[4,4], [4,4]],
  S: [[0,5,5], [5,5,0], [0,0,0]],
  T: [[0,6,0], [6,6,6], [0,0,0]],
  Z: [[7,7,0], [0,7,7], [0,0,0]]
};

//Block colors
var colors = ["F92338", "C973FF", "1C76BC", "FEE356", "53D504", "36E0FF", "F8931D"];

//Used to help create a seeded generated random number for choosing shapes. makes results deterministic (reproducible) for debugging
var rndSeed = 1;


/**
 * Determines if the given grid and shape collide with one another.
 * @param  {Grid} scene  The grid to check.
 * @param  {Shape} object The shape to check.
 * @return {Boolean} Whether the shape and grid collide.
 */
 function collides(scene, object) {
  //for the size of the shape (row x column)
  for (var row = 0; row < object.shape.length; row++) {
    for (var col = 0; col < object.shape[row].length; col++) {
      //if its not empty
      if (object.shape[row][col] !== 0) {
        //if it collides, return true
        if (scene[object.y + row] === undefined || scene[object.y + row][object.x + col] === undefined || scene[object.y + row][object.x + col] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
 }

//for rotating a shape, how many times should we rotate
 function rotate(matrix, times) {
  //for each time
  for (var t = 0; t < times; t++) {
    //flip the shape matrix
    matrix = transpose(matrix);
    //and for the length of the matrix, reverse each column
    for (var i = 0; i < matrix.length; i++) {
      matrix[i].reverse();
    }
  }
  return matrix;
 }
//flip row x column to column x row
 function transpose(array) {
  return array[0].map(function(col, i) {
    return array.map(function(row) {
      return row[i];
    });
  });
 }




 function replaceAll(target, search, replacement) {
  return target.replace(new RegExp(search, 'g'), replacement);
 }

  function getHeight() {
    removeShape();
    var peaks = [20,20,20,20,20,20,20,20,20,20];
    for (var row = 0; row < grid.length; row++) {
      for (var col = 0; col < grid[row].length; col++) {
        if (grid[row][col] !== 0 && peaks[col] === 20) {
          peaks[col] = row;
        }
      }
    }
    applyShape();
    return 20 - Math.min.apply(Math, peaks);
   }


function transpose(array){
  var newArray = array[0].map(function(col, i) { 
    return array.map(function(row) { 
      return row[i] 
    })
  });
  return newArray;
}












/**
 * Game
 */

var game = new Game(6, 6, "game");



function Game(w, h, game){
  this.dom = document.getElementById(game);
  this.board = [];
  this.height = h;
  this.width = w;
  this.default = 0;
  this.steps = 1000;
  this.shape = {};
  this.interval;
  console.log("created");
 
  // console.log(this.board);
  
}
Game.prototype.start = function(){
 this.reset();
 console.log(this.board);
 this.shape = new Shape("J");
 this.loop(this);
}

Game.prototype.loop = function() {
  console.log("draw");
  this.setTimeout(this.loop, this.steps);
}

Game.prototype.reset = function(){
  this.board = [];
  for (var y = 0; y < this.height; y++) {
    if(this.board.length <= y) this.board.push([]);
    for (var x = 0; x < this.width; x++) {
      this.board[y].push(this.default);
    }
  }
};



Game.prototype.step = function(){


  this.gravity();
  console.log(this.shape);
  console.log("end step");
}

Game.prototype.gravity = function(){

  this.moveDown();
}

Game.prototype.moveDown = function(){

  // if typeof this.shape == 'undefined';
  if(!this.collision(0, 1)){
    this.removeShape();
    //move down
    this.shape.y++;
    this.addShape();
    return;
  }

  this.nextShape("L");

}

Game.prototype.collision = function(x, y) {

  var shape_x = this.shape.x + x;
  var shape_y = this.shape.y + y;
  // console.log(this.shape.y, this.height);
  if(shape_y + 1 < this.height) return false;

  return true;
}

Game.prototype.nextShape = function(t) {
  this.shape = new Shape(t);
  this.shape.x = Math.floor(this.width / 2);
};

Game.prototype.draw = function(){

  var html = "";
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      html += "["+this.board[y][x]+"]";
    }
    html += "<br>";
  }

  this.dom.innerHTML = html;
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
        this.board[this.shape.y + row][this.shape.x + col] = 2;
      }
    }
  }

}

Game.prototype.loop = function(t){

  t.step();
  t.draw();
  t.interval = setTimeout(t.loop, t.steps, t)

}

function Shape(t){

  this.shape = shapes[t];
  this.x = 0;
  this.y = 0;
  this.type = t;
}







window.onload = game.start();


//key options
window.onkeydown = function (event) {

  var characterPressed = String.fromCharCode(event.keyCode);

  if (event.keyCode == 38) {
    rotateShape();
  } else if (event.keyCode == 40) {
    moveDown();
  } else if (event.keyCode == 37) {
    moveLeft();
  } else if (event.keyCode == 39) {
    moveRight();

  // } else if (shapes[characterPressed.toUpperCase()] !== undefined) {
    // removeShape();
    // currentShape.shape = shapes[characterPressed.toUpperCase()];
    // applyShape();
  // } else if (characterPressed.toUpperCase() == "D") {
  //   //slow down
  //   speedIndex--;
  //   if (speedIndex < 0) {
  //     speedIndex = speeds.length - 1;
  //   }
  //   speed = speeds[speedIndex];
  //   changeSpeed = true;
  // } else if (characterPressed.toUpperCase() == "E") {
  //   //speed up
  //   speedIndex++;
  //   if (speedIndex >= speeds.length) {
  //     speedIndex = 0;
  //   }
  //   //adjust speed index
  //   speed = speeds[speedIndex];
  //   changeSpeed = true;
  //   //Turn on/off AI
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
  render();
 
  return false;
};
