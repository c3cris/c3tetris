

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
   }

