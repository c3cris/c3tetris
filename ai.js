

function Ai(){

}


Ai.prototype.getHeight = function(game) {
    game.removeShape();
    var peaks = [20,20,20,20,20,20,20,20,20,20];
    
    for (var row = 0; row < game.board.length; row++) {
      for (var col = 0; col < game.board[row].length; col++) {

        if (game.board[row][col] !== 0 && peaks[col] === 20) {
          peaks[col] = row;
        }
      }
    }
    game.applyShape();
    return 20 - Math.min.apply(Math, peaks);
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