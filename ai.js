function Ai(game, population) {
  this.game = game;
  this.genomes = [];
  this.population = population;
  this.index = -1;
  this.movesTaken = 0;
  this.testState = 0;
  this.moveLimit = 200;
  this.genomeQ = [];
  this.action = false;
}


Ai.prototype.init = function () {

  this.testState = this.game.saveState();
  //for a given population size
  for (var i = 0; i < this.population; i++) {
    //randomly initialize the 7 values that make up a genome
    //these are all weight values that are updated through evolution
    var genome = {
      //unique identifier for a genome
      id: Math.random(),
      //The weight of each row cleared by the given move. the more rows that are cleared, the more this weight increases
      rowsCleared: Math.random() - 0.5,
      //the absolute height of the highest column to the power of 1.5
      //added so that the algorithm can be able to detect if the blocks are stacking too high
      weightedHeight: Math.random() - 0.5,
      //The sum of all the column’s heights
      cumulativeHeight: Math.random() - 0.5,
      //the highest column minus the lowest column
      relativeHeight: Math.random() - 0.5,
      //the sum of all the empty cells that have a block above them (basically, cells that are unable to be filled)
      holes: Math.random() * 0.5,
      // the sum of absolute differences between the height of each column
      //(for example, if all the shapes on the grid lie completely flat, then the roughness would equal 0).
      roughness: Math.random() - 0.5,
    };
    //add them to the array
    this.genomes.push(genome);
  }
  this.nextGenome();
};


/**
 * Evaluates the next genome in the population. If there is none, evolves the population.
 */
Ai.prototype.nextGenome = function () {
  //increment index in genome array

  if (this.genomes.length === 0) return;

  if (this.index >= 0) {
    this.genomes[this.index].fitness = this.game.score;
  }
  this.index++;

  //If there is none, evolves the population.
  if (this.index === this.genomes.length) {
    // this.evolve();
    this.index = 0;
    console.log("done");
  }
  //load current game state
  this.game.loadState(this.testState);
  //reset moves taken
  this.movesTaken = 0;
  //and make the next move
  this.makeNextMove();
};

/**
 * Makes a move, which is decided upon using the parameters in the current genome.
 */
Ai.prototype.makeNextMove = function () {


  if (this.action !== false) return this.solveAction();

  if (this.genomes.length === 0) return;


  //increment number of moves taken
  this.movesTaken++;
  //if its over the limit of moves
  if (this.movesTaken > this.moveLimit) {
    //update this genomes fitness value using the game score
    this.genomes[this.index].fitness = clone(this.game.score);
    //and evaluates the next g
    // genome
    this.nextGenome();

  } else {
    //time to make a move

    //get all the possible moves
    var possibleMoves = this.getAllPossibleMoves();
    //lets store the current state since we will update it

    //var lastState = this.game.saveState();
    //whats the next shape to play
    this.game.removeShape();
    this.game.nextShape();

    //for each possible move
    for (var i = 0; i < possibleMoves.length; i++) {
      //get the best move. so were checking all the possible moves, for each possible move. moveception.
      var nextMove = this.getHighestRatedMove(this.getAllPossibleMoves());
      //add that rating to an array of highest rates moves
      possibleMoves[i].rating += nextMove.rating;
    }

    //load current state
    // this.game.loadState(lastState);

    //get the highest rated move ever
    this.move = this.getHighestRatedMove(possibleMoves);
    //then rotate the shape as it says too
    for (var rotations = 0; rotations < this.move.rotations; rotations++) {
      this.game.rotateShape();
    }
    //and move left as it says
    if (this.move.translation < 0) {
      for (var lefts = 0; lefts < Math.abs(this.move.translation); lefts++) {
        this.game.moveLeft();
      }
      //and right as it says
    } else if (this.move.translation > 0) {
      for (var rights = 0; rights < this.move.translation; rights++) {
        this.game.moveRight();
      }
    }

  }
};


Ai.prototype.getAllPossibleMoves = function () {

  var lastState = this.game.saveState();
  var possibleMoves = [];
  var possibleMoveRatings = []; // not used
  // var iterations = 0;
  //for each possible rotation
  for (var rots = 0; rots < 4; rots++) {

    var oldX = [];
    //for each iteration
    for (var t = -5; t <= 5; t++) {
      // iterations++;
      this.game.loadState(lastState);
      //rotate shape
      for (var j = 0; j < rots; j++) {
        this.game.rotateShape();
      }

      //move left
      if (t < 0) {
        for (var l = 0; l < Math.abs(t); l++) {
          this.game.moveLeft();
        }
        //move right
      } else if (t > 0) {
        for (var r = 0; r < t; r++) {
          this.game.moveRight();
        }
      }
      //if the shape has moved at all
      // if (!contains(oldX, currentShape.x)) {
      //move it down
      var moveStats = this.game.moveDown();
      while (moveStats.moved) {
        moveStats = this.game.moveDown();
      }

      stats = this.game.getBoardStats();

      //set the 7 parameters of a genome
      var algorithm = {
        rowsCleared: moveStats.rows,
        weightedHeight: Math.pow(stats.height, 1.5),
        cumulativeHeight: stats.totalHeight,
        relativeHeight: stats.relativeHeight,
        holes: stats.holes,
        roughness: stats.roughness
      };

      //rate each move
      var rating = 0;
      rating += algorithm.rowsCleared * this.genomes[this.index].rowsCleared;
      rating += algorithm.weightedHeight * this.genomes[this.index].weightedHeight;
      rating += algorithm.cumulativeHeight * this.genomes[this.index].cumulativeHeight;
      rating += algorithm.relativeHeight * this.genomes[this.index].relativeHeight;
      rating += algorithm.holes * this.genomes[this.index].holes;
      rating += algorithm.roughness * this.genomes[this.index].roughness;
      //if the move loses the game, lower its rating
      if (moveStats.lose) {
        rating -= 500;
      }
      //push all possible moves, with their associated ratings and parameter values to an array
      possibleMoves.push({rotations: rots, translation: t, rating: rating, algorithm: algorithm});
      //update the position of old X value
      // oldX.push(currentShape.x);
      // }
    }
  }
  //get last state
  this.game.loadState(lastState);
  //return array of all possible moves
  return possibleMoves;

};


Ai.prototype.deleteGenomes = function () {
  this.action = "delete";
};

Ai.prototype.addGenomes = function (genomes) {
  this.action = "add";
  this.genomeQ.push(JSON.parse(genomes));
  this.index = -1;

};


Ai.prototype.getHighestRatedMove = function (moves) {
  //start these values off small
  var maxRating = -10000000000000;
  var maxMove = -1;
  var ties = [];
  //iterate through the list of moves
  for (var index = 0; index < moves.length; index++) {
    //if the current moves rating is higher than our maxrating
    if (moves[index].rating > maxRating) {
      //update our max values to include this moves values
      maxRating = moves[index].rating;
      maxMove = index;
      //store index of this move
      ties = [index];
    } else if (moves[index].rating === maxRating) {
      //if it ties with the max rating
      //add the index to the ties array
      ties.push(index);
    }
  }
  //eventually we'll set the highest move value to this move var
  var move = moves[ties[0]];
  //and set the number of ties
  move.algorithm.ties = ties.length;
  return move;
};


Ai.prototype.getAiData = function () {
  return this.move;
};

Ai.prototype.solveAction = function () {


  if (this.action === "add") {
    this.genomes = this.genomes.concat(this.genomeQ);
    this.index = -1;
    this.genomeQ = [];
    this.clearAction();
    return this.nextGenome();
  } else if (this.action == "delete") {
    this.index = -1;
    this.genomes = [];
  }

};

Ai.prototype.clearAction = function () {
  this.action = false;
};

function randomNumBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomWeightedNumBetween(min, max) {
  return Math.floor(Math.pow(Math.random(), 2) * (max - min + 1) + min);
}

function randomChoice(propOne, propTwo) {
  if (Math.round(Math.random()) === 0) {
    return clone(propOne);
  } else {
    return clone(propTwo);
  }
}


/**
 * Returns an array that replaces all the holes in the grid with -1.
 * @return {Array} The modified grid array.
 */
/*Ai.prototype.getHolesArray = function(game) {
 var array = clone(grid);
 removeShape();
 var peaks = [20,20,20,20,20,20,20,20,20,20];
 for (var row = 0; row < grid.length; row++) {
 for (var col = 0; col < grid[row].length; col++) {
 if (grid[row][col] !== 0 && peaks[col] === 20) {
 peaks[col] = row;
 }
 }
 }
 for (var x = 0; x < peaks.length; x++) {
 for (var y = peaks[x]; y < grid.length; y++) {
 if (grid[y][x] === 0) {
 array[y][x] = -1;
 }
 }
 }
 applyShape();
 return array;
 };*/


/**
 * Returns the roughness of the grid.
 * @return {Number} The roughness of the grid.
 */


/**
 * Evolves the entire population and goes to the next generation.
 */
function evolve() {

  console.log("Generation " + generation + " evaluated.");
  //reset current genome for new generation
  this.index = 0;
  //increment generation
  generation++;
  //resets the game
  reset();
  //gets the current game state
  testState = getState();
  //sorts genomes in decreasing order of fitness values
  genomes.sort(function (a, b) {
    return b.fitness - a.fitness;
  });
  //add a copy of the fittest genome to the elites list
  archive.elites.push(clone(genomes[0]));
  console.log("Elite's fitness: " + genomes[0].fitness);

  //remove the tail end of genomes, focus on the fittest
  while (genomes.length > populationSize / 2) {
    genomes.pop();
  }
  //sum of the fitness for each genome
  var totalFitness = 0;
  for (var i = 0; i < genomes.length; i++) {
    totalFitness += genomes[i].fitness;
  }

  //get a random index from genome array
  function getRandomGenome() {
    return genomes[randomWeightedNumBetween(0, genomes.length - 1)];
  }

  //create children array
  var children = [];
  //add the fittest genome to array
  children.push(clone(genomes[0]));
  //add population sized amount of children
  while (children.length < populationSize) {
    //crossover between two random genomes to make a child
    children.push(makeChild(getRandomGenome(), getRandomGenome()));
  }
  //create new genome array
  genomes = [];
  //to store all the children in
  genomes = genomes.concat(children);
  //store this in our archive
  archive.genomes = clone(genomes);
  //and set current gen
  archive.currentGeneration = clone(generation);
  console.log(JSON.stringify(archive));
  //store archive, thanks JS localstorage! (short term memory)
  localStorage.setItem("archive", JSON.stringify(archive));
}

/**
 * Creates a child genome from the given parent genomes, and then attempts to mutate the child genome.
 * @param  {Genome} mum The first parent genome.
 * @param  {Genome} dad The second parent genome.
 * @return {Genome}     The child genome.
 */
function makeChild(mum, dad) {
  //init the child given two genomes (its 7 parameters + initial fitness value)
  var child = {
    //unique id
    id: Math.random(),
    //all these params are randomly selected between the mom and dad genome
    rowsCleared: randomChoice(mum.rowsCleared, dad.rowsCleared),
    weightedHeight: randomChoice(mum.weightedHeight, dad.weightedHeight),
    cumulativeHeight: randomChoice(mum.cumulativeHeight, dad.cumulativeHeight),
    relativeHeight: randomChoice(mum.relativeHeight, dad.relativeHeight),
    holes: randomChoice(mum.holes, dad.holes),
    roughness: randomChoice(mum.roughness, dad.roughness),
    //no fitness. yet.
    fitness: -1
  };
  //mutation time!

  //we mutate each parameter using our mutationstep
  if (Math.random() < mutationRate) {
    child.rowsCleared = child.rowsCleared + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.weightedHeight = child.weightedHeight + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.cumulativeHeight = child.cumulativeHeight + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.relativeHeight = child.relativeHeight + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.holes = child.holes + Math.random() * mutationStep * 2 - mutationStep;
  }
  if (Math.random() < mutationRate) {
    child.roughness = child.roughness + Math.random() * mutationStep * 2 - mutationStep;
  }
  return child;
}

/**
 * Returns an array of all the possible moves that could occur in the current state, rated by the parameters of the current genome.
 * @return {Array} An array of all the possible moves that could occur.
 */


