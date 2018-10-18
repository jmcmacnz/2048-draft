function Tile(isActive = false, currentValue = 0, alreadyMerged = false) {
  this.isActive = isActive;
  this.currentValue = currentValue;
  this.alreadyMerged = alreadyMerged;
}

var tile1 = new Tile(true, 2);
var tile2 = new Tile();
var tile3 = new Tile();
var tile4 = new Tile();

var column1 = [tile1, tile2, tile3, tile4];

function newBoardMove(board, direction) {
  var newBoardState = [];

  for (let i = 0; i < this.boardSize; i++) {
    var stackToBeMerged = [];

    if (direction === "down") {
      stackToBeMerged = getTileStack(board, "VERTICAL", i);
      newBoardState.push(mergeTileStack(stackToBeMerged));
    } else if (direction === "up") {
      stackToBeMerged = getTileStack(board, "VERTICAL", i).reverse();
      newBoardState.push(mergeTileStack(stackToBeMerged).reverse());
    } else if (direction === "right") {
      stackToBeMerged = getTileStack(board, "HORIZONTAL", i);
      newBoardState.push(mergeTileStack(stackToBeMerged));
    } else if (direction === "left") {
      stackToBeMerged = getTileStack(board, "HORIZONTAL", i).reverse();
      newBoardState.push(mergeTileStack(stackToBeMerged).reverse());
    }
  }

  this.updateBoard(newBoardState);
}

function mergeTileStack(column) {
  var newColumn = column;

  // Loop through tiles starting at the end tile
  for (var i = newColumn.length - 1; i > -1; i--) {
    var currentTile = newColumn[i];
    var nextTile = newColumn[i - 1];
    if (!nextTile) {
      newColumn.forEach(tile => {
        tile.alreadyMerged = false;
      });
      break;
    }
    // If the current tile is empty, and the next tile is active,
    // move next tile to current space
    if (!currentTile.isActive) {
      if (nextTile.isActive) {
        Object.assign(newColumn[i], newColumn[i - 1]);
        newColumn[i - 1] = new Tile();
        newColumn = this.mergeTileStack(newColumn);
      }
      // Else if current tile is active and hasn't already been merged,
      // and next tile is active, hasn't already been merged and equal in value,
      // merge next tile with current tile and remove next tile from board
    } else {
      if (
        currentTile.alreadyMerged === false &&
        (nextTile.isActive === true &&
          nextTile.alreadyMerged === false &&
          nextTile.currentValue === currentTile.currentValue)
      ) {
        newColumn[i].currentValue = newColumn[i].currentValue * 2;
        newColumn[i].alreadyMerged = true;
        newColumn[i - 1] = new Tile();
        newColumn = this.mergeTileStack(newColumn);
      }
    }
  }
  return newColumn;
}

function getTileStack(board, direction, index) {
  if (direction === "VERTICAL") {
    return this.$store.getters.getBoardColumn(index);
  } else if (direction === "HORIZONTAL") {
    return this.$store.getters.getBoardRow(index);
  }
}
