/**

 Todo - add call to bot ( abstract )

 **/


function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}


/**
 * Game
 */

var game = new Game(10, 20, "game", 500);


/**
 * Game
 */
function Game(w, h, game, steps) {
  this.dom = document.getElementById(game);
  this.domStatus = document.getElementById("status");
  this.domAi = document.getElementById("ai");
  this.domInput = document.getElementById("gene");
  this.board = [];
  this.aiFlag = true;
  this.height = h;
  this.width = w;
  this.default = 0;
  this.steps = steps;
  this.shape = 0;
  this.state = 0;
  this.score = 0;
  this.interval = 0;
  this.seed = 1;
  this.pressed = false;
  this.save = 0;
  this.ai = new Ai(this, 10);

  //Block colors
  this.colors = ["CBCBCB", "F92338", "A733F9", "1C76BC", "FEE356", "53D504", "36E0FF", "F8931D", "EB13E6", "FFFFFF"];
  this.shapes = {
    I: [[0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]],
    J: [[2, 0, 0],
      [2, 2, 2],
      [0, 0, 0]],
    L: [[0, 0, 3],
      [3, 3, 3],
      [0, 0, 0]],
    O: [[4, 4],
      [4, 4]],
    S: [[0, 5, 5],
      [5, 5, 0],
      [0, 0, 0]],
    T: [[0, 6, 0],
      [6, 6, 6],
      [0, 0, 0]],
    Z: [[7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]],
    // X: [[1,2,3],
    //   [4,5,6],
    //   [7,8,9]]
  };
  this.codes = Object.keys(this.shapes);

  console.log("created");


}

Game.prototype.start = function () {
  this.reset();
  this.nextShape();
  this.ai.init();
  this.loop(this);
  var x = this;

  $("#add").click(function (e) {
    input = $("#geneInput").val();
    x.ai.addGenomes(input);
  });
  $("#delete").click(function (e) {
    x.ai.deleteGenomes();
  });

};


Game.prototype.reset = function () {
  this.state = 0;
  this.shape = 0;
  this.score = 0;
  this.board = [];
  for (var y = 0; y < this.height; y++) {
    if (this.board.length <= y) this.board.push([]);
    for (var x = 0; x < this.width; x++) {
      this.board[y].push(this.default);
    }
  }
};


Game.prototype.checkState = function () {
  if (this.state === 1) {
    if (!this.aiFlag) this.reset();
    return false;
  }
  return true;
};

Game.prototype.gravity = function () {

  result = this.moveDown();

  if (result.lose) {
    this.state = 1;
    if (this.aiFlag) {
      this.state = 0;
      this.ai.nextGenome();
    }
  }
  if (!result.moved) {
    if (this.aiFlag) this.ai.makeNextMove();
  }
};

Game.prototype.moveDown = function () {

  if (!this.shape) return false;

  var result = {lose: false, moved: true, rows: 0};

  this.removeShape();

  if (this.collision(0, 1)) {

    result.moved = false;
    //move down
    this.addShape();
    //get rows eliminated
    result.rows = this.clearRows();

    if (this.nextShape() === false) {
      result.lose = true;
    }

    return result;
  }

  this.score++;
  this.shape.y++;
  this.addShape();

  return result;


};

Game.prototype.moveRight = function () {

  if (!this.shape) return false;

  this.removeShape();
  // if typeof this.shape == 'undefined';
  if (this.collision(1, 0)) {

    //move right
    return this.addShape();
  }
  this.shape.x++;
  this.addShape();

};

Game.prototype.moveLeft = function () {

  if (!this.shape) return false;

  this.removeShape();
  // if typeof this.shape == 'undefined';
  if (this.collision(-1, 0)) {

    //move left
    return this.addShape();

  }
  this.shape.x--;
  this.addShape();

};

Game.prototype.rotateShape = function () {

  if (!this.shape) return false;

  this.removeShape();
  this.shape.rotate(1);
  if (this.collision(0, 0)) {
    this.shape.rotate(3);
  }
  this.addShape();

};

Game.prototype.collision = function (x, y) {

  var shape_x = this.shape.x + x;
  var shape_y = this.shape.y + y;
  // console.log(this.shape.y, this.height);
  for (var row = 0; row < this.shape.shape.length; row++) {
    for (var col = 0; col < this.shape.shape[row].length; col++) {
      if (this.shape.shape[row][col] !== 0) {

        if (this.board[shape_y + row] === undefined) return true;

        if (this.board[shape_y + row][shape_x + col] !== 0 ||
          this.board[shape_y + row][shape_x + col] === undefined) {
          return true;
        }
      }
    }
  }
  return false;
};

Game.prototype.nextShape = function () {
  this.shape = this.createShape();
  this.shape.x = Math.floor(this.width / 2) - 1;

  if (this.collision(0, 0)) {
    return false;
  }
  this.addShape();
  return true;
};

Game.prototype.createShape = function () {

  var randomShape = this.lng(0, this.codes.length);
  var type = this.getCode(randomShape);
  return new Shape({type: type, shape: this.getShape(type)});


};

Game.prototype.predictShapes = function (n) {

  var shapes = [];
  var currentSeed = this.seed;
  for (i = 0; i < n; i++) {
    var randomShape = this.lng(0, this.codes.length);
    shapes.push(this.getCode(randomShape))
  }
  this.seed = currentSeed;
  return shapes;

};

Game.prototype.getCode = function (n) {
  return this.codes[n]
};

Game.prototype.getShape = function (t) {
  return this.shapes[t]
};


Game.prototype.removeShape = function () {

  if (this.shape === 0) return;

  for (var row = 0; row < this.shape.shape.length; row++) {
    for (var col = 0; col < this.shape.shape[row].length; col++) {
      if (this.shape.shape[row][col] !== 0) {
        this.board[this.shape.y + row][this.shape.x + col] = 0;
      }
    }
  }
};

Game.prototype.addShape = function () {

  if (this.shape === 0) return;

  for (var row = 0; row < this.shape.shape.length; row++) {
    for (var col = 0; col < this.shape.shape[row].length; col++) {
      if (this.shape.shape[row][col] !== 0) {
        this.board[this.shape.y + row][this.shape.x + col] = this.shape.shape[row][col];
      }
    }
  }

};

Game.prototype.clearRows = function () {

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

  if (fullRows.length === 1) {
    this.score += 400;
  } else if (fullRows.length === 2) {
    this.score += 1000;
  } else if (fullRows.length === 3) {
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
    this.board.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  //return the rows cleared
  return rowsCleared;

};

/**
 * Linear Congruential Generator
 * @param  {Number} min The minimum number, inclusive.
 * @param  {Number} max The maximum number, exclusive.
 * @return {Number}     The generated random number.
 */

Game.prototype.lng = function (min, max) {
  max = max || 1;
  min = min || 0;

  this.seed = (this.seed * 9301 + 49297) % 233280;

  var rnd = this.seed / 233280;

  return Math.floor(min + rnd * (max - min));
};

/**
 * Get state and break references
 * @returns {{board: *, shape: *, seed: *, score: *}}
 */
Game.prototype.getState = function () {
  return {
    board: clone(this.board),
    shape: clone(this.shape),
    seed: this.seed,
    score: this.score
  };

};
/**
 * Save State
 */
Game.prototype.saveState = function () {

  this.removeShape();
  this.save = this.getState();
  this.addShape();
  return this.save;
};

/**
 * Load State
 * @param state
 */
Game.prototype.loadState = function (state) {

  this.board = clone(state.board);
  this.shape = new Shape(state.shape);
  this.score = state.score;
  this.seed = state.seed;
  this.addShape();
  // this.draw();
};


/**
 * Returns statistics about the game board.
 * @return {Object}
 */


Game.prototype.getBoardStats = function () {

  this.removeShape();
  var grid = this.board;
  var stats = {};


  stats.peaks = [20, 20, 20, 20, 20, 20, 20, 20, 20, 20];
  for (var row = 0; row < grid.length; row++) {
    for (var col = 0; col < grid[row].length; col++) {

      if (stats.peaks[col] !== 20) break;

      if (grid[row][col] !== 0) {
        stats.peaks[col] = row;
      }
    }
  }

  // Height
  stats.height = 20 - Math.min.apply(Math, stats.peaks);

  // Relative Height
  stats.relativeHeight = Math.max.apply(Math, stats.peaks) - Math.min.apply(Math, stats.peaks);

  // Roughness
  stats.roughness = 0;
  stats.differences = [];


  for (var i = 0; i < stats.peaks.length - 1; i++) {
    stats.roughness += Math.abs(stats.peaks[i] - stats.peaks[i + 1]);
    stats.differences[i] = Math.abs(stats.peaks[i] - stats.peaks[i + 1]);
  }

  // Holes
  stats.holes = 0;
  for (var x = 0; x < stats.peaks.length; x++) {
    for (var y = stats.peaks[x]; y < grid.length; y++) {
      if (grid[y][x] === 0) {
        stats.holes++;
      }
    }
  }

  // GetCumulativeHeight
  stats.totalHeight = 0;
  for (var i = 0; i < stats.peaks.length; i++) {
    stats.totalHeight += 20 - stats.peaks[i];
  }


  this.addShape();

  return stats;
};

Game.prototype.draw = function () {

  var html = "";

  // Draw Board
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      html += "<span style=\"color:#" + this.colors[this.board[y][x]] + "\">&#9632;</span>";
    }
    html += "<br>";
  }
  this.dom.innerHTML = html;

  if (this.state) {
    this.domStatus.innerHTML = "Lost";
  } else {
    this.domStatus.innerHTML = "Running";
  }

  // Get upcoming shapes
  var shapes = this.predictShapes(7);

  html = "<div style='float:left;width:550px;'><table>\
  <tr><td>Name</td><td>Value</td></tr>\
  <tr><td>Score</td><td>" + this.score + "</td></tr>\
  <tr><td>Current Genome</td><td>" + this.ai.index + "/" + this.ai.genomes.length + "</td></tr>\
  <tr><td>AI</td><td>" + this.aiFlag + "</td></tr>\
  <tr><td>Status</td><td>" + this.state + "</td></tr>\
  <tr><td>Steps</td><td>" + this.steps + "</td></tr>\
  <tr><td>Shape</td><td>" + JSON.stringify(this.shape) + "</td></tr>\
  <tr><td>Line UP</td><td>" + JSON.stringify(shapes) + "</td></tr>\
  </table>";

  var debug = this.boardDebug();

  aidata = this.ai.getAiData();

  statsHtml = "";

  stats = this.getBoardStats();

  for (var stat in stats) {
    statsHtml += stat + " : " + stats[stat] + " <br> ";
  }

  aiHtml = "";
  for (var aiinfo in aidata) {
    if (aiinfo === "algorithm") {
      aiHtml += "_____Algorithm______<br>";

      for (var algo in aidata[aiinfo]) {
        aiHtml += algo + " : " + aidata[aiinfo][algo] + " <br> ";
      }
      continue;
    }
    aiHtml += aiinfo + " : " + aidata[aiinfo] + " <br> ";
  }
  genomeHtml = "";
  for (var gene in this.ai.genomes[this.ai.index]) {
    genomeHtml += gene + " : " + this.ai.genomes[this.ai.index][gene] + " <br> ";
  }


  genomeHtml += "<pre>" + JSON.stringify(this.ai.genomes, false, 2) + "</pre>";

  html += debug + "<div>" + statsHtml + "</div> </div><div style='float:right;'>" + genomeHtml + "</div> <div style=\"width:300px;\">" + aiHtml + " </div>";
  this.domAi.innerHTML = html;

//   debug = "";
//   for(var shape in this.shapes) {
//     for (var y = 0; y < this.shapes[shape].length; y++) {
//       for (var x = 0; x < this.shapes[shape][y].length; x++) {
//         debug += "<span style=\"color:#" + this.colors[this.shapes[shape][y][x]] + "\">&#9632;</span>";
//       }
//       debug += "<br>";
//     }
//     debug += "<br>";
//   }
//
//   this.domStats.innerHTML += "<div>" + debug + "</div>";
};

Game.prototype.boardDebug = function () {

  debug = "<table  class=\"monospace\"><tr><td><div>";

  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      debug += "<span style=\"color:#" + this.colors[this.board[y][x]] + "\">" + this.board[y][x] + "</span>";
    }
    debug += "<br>";
  }
  debug += "</div></td>";

  if (this.save !== 0) {

    debug += "<td><div>";

    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        debug += "<span style=\"color:#" + this.colors[this.save.board[y][x]] + "\">" + this.save.board[y][x] + "</span>";
      }
      debug += "<br>";
    }
    debug += "</div></td>";

  } else {

    debug += "<td>No Save</td>";
  }
  debug += "</tr></table>";

  return debug;
};

Game.prototype.step = function () {

  if (!this.checkState()) return false;
  if (!this.shape) return this.nextShape();

  this.gravity();


};


/**
 * Creates loop based on t
 * @param t context
 */
Game.prototype.loop = function (t) {

  t.step();
  t.draw();
  t.interval = setTimeout(t.loop, t.steps, t)

};


/**
 * Shape Class
 * @param shape
 * @constructor
 */
function Shape(shape) {


  this.type = shape.type;
  this.shape = shape.shape;
  this.x = shape.x !== undefined ? shape.x : 0;
  this.y = shape.y !== undefined ? shape.y : 0;

}

Shape.prototype.transpose = function () {
  var shape = this.shape;
  this.shape = shape[0].map(function (col, i) {
    return shape.map(function (row) {
      return row[i];
    });
  });
};

Shape.prototype.rotate = function (times) {

  for (var t = 0; t < times; t++) {
    //flip the shape matrix
    this.transpose();
    //and for the length of the matrix, reverse each column
    for (var row = 0; row < this.shape.length; row++) {
      this.shape[row].reverse();
    }
  }

};


window.onload = game.start();


//key options
window.onkeydown = function (event) {

  var characterPressed = String.fromCharCode(event.keyCode);

  if (event.keyCode === 38) {
    game.rotateShape();
  } else if (event.keyCode === 40) {
    game.gravity();
  } else if (event.keyCode === 37) {
    game.moveLeft();
  } else if (event.keyCode === 39) {
    game.moveRight();
  } else if (characterPressed.toUpperCase() === "X") {
    game.steps *= 1.5;
  } else if (characterPressed.toUpperCase() === "Z") {
    game.steps /= 1.5;
  } else if (characterPressed.toUpperCase() === "C") {
    game.aiFlag = !game.aiFlag;
  } else if (characterPressed.toUpperCase() === "F") {

    if (game.pressed) return;
    game.pressed = true;
    game.saveState();
    setTimeout(function () {
      game.pressed = false;
      console.log("pressed false");
    }, 1100);

  } else if (characterPressed.toUpperCase() === "V") {
    game.loadState(game.save);
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
