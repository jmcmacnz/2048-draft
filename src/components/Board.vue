<template>
    <div id="mainBoard" class="container" tabindex="0" 
    :style="{ width: this.boardDimensions, height: this.boardDimensions }" 
    @keyup.right="newBoardMove('RIGHT')" 
    @keyup.left="newBoardMove('LEFT')" 
    @keyup.down="newBoardMove('DOWN')" 
    @keyup.up="newBoardMove('UP')">
        <Tile v-for="(tile, index) in numberOfTiles" :key="index">
        </Tile>
    </div>
</template>

<script>
import Tile from "./Tile.vue";
import { mapState, mapMutations } from "vuex";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";

export default {
  name: "Board",
  components: {
    Tile
  },
  data: function() {
    return {
      boardSize: this.$store.getters.getBoardSize,
      tileWidth: "100",
      keyCounter: 0
    };
  },
  computed: {
    ...mapState(["boardState"]),
    // Total no. of tiles on the board
    numberOfTiles: function() {
      return Math.pow(this.boardSize, 2);
    },
    // Setting pixel width of the board to fit the appropriate board size
    // based on tile size
    boardDimensions: function() {
      let dimension = this.tileWidth * this.boardSize;
      return dimension.toString() + "px";
    }
  },
  methods: {
    // Mutation for updating the board state
    ...mapMutations({ updateBoard: "UPDATE_BOARD_STATE" }),

    // Calculate given tile's coordinate based on board size,
    // returns an [x,y] array
    calculateTileCoordinate(position) {
      let column = position % this.boardSize;
      let row = Math.floor(position / this.boardSize);
      return [column, row];
    },
    // Returns the id of a random empty tile
    activateRandomTile(boardState) {
      let inactiveTiles = [];
      let newActiveTileId = null;
      let newActiveTileIndex = null;

      boardState.forEach(tile => {
        if (!tile.isActive) {
          inactiveTiles.push(tile.id);
        }
      });

      newActiveTileIndex = Math.floor(Math.random() * inactiveTiles.length);
      newActiveTileId = inactiveTiles[newActiveTileIndex];
      return newActiveTileId;
    },
    createTile(id, coordinates = [], isActive = false, currentValue = null, alreadyMerged = false) {
      let newTile = Object();
      newTile.id = id;
      newTile.coordinates = coordinates;
      newTile.isActive = isActive;
      newTile.currentValue = currentValue;
      newTile.alreadyMerged = alreadyMerged;
      return newTile;
    },
    // Initializes the board state with a random tile activated
    initializeBoard: function() {
      let firstActiveTile = Math.floor(Math.random() * this.numberOfTiles);
      let boardArray = [];

      for (let i = 0; i < this.numberOfTiles; i++) {
        let newCoordinate = this.calculateTileCoordinate(i);
        if (i === firstActiveTile) {
          boardArray.push(this.createTile(i, newCoordinate, true, 2));
        } else {
          boardArray.push(this.createTile(i, newCoordinate));
        }
      }

      this.updateBoard(boardArray);
    },
    // Carries out a single board move in the direction specified
    newBoardMove: function(direction) {
      let newBoardState = [];

      for (let i = 0; i < this.boardSize; i++) {
        let stackToBeMerged = [];
        let mergedStack = [];

        if (direction === "DOWN") {
          stackToBeMerged = this.getTileStack("COLUMN", i);
          mergedStack = cloneDeep(this.mergeTileStack(stackToBeMerged));
          mergedStack.forEach(tileObject => {
            newBoardState.push(tileObject);
          });
          newBoardState.sort(function(a, b) {
            return a.id - b.id;
          });
        } else if (direction === "UP") {
          stackToBeMerged = this.getTileStack("COLUMN", i).reverse();
          mergedStack = cloneDeep(this.mergeTileStack(stackToBeMerged));
          mergedStack.reverse().forEach(tileObject => {
            newBoardState.push(tileObject);
          });
          newBoardState.sort(function(a, b) {
            return a.id - b.id;
          });
        } else if (direction === "RIGHT") {
          stackToBeMerged = this.getTileStack("ROW", i);
          mergedStack = cloneDeep(this.mergeTileStack(stackToBeMerged));
          mergedStack.forEach(tileObject => {
            newBoardState.push(tileObject);
          });
        } else if (direction === "LEFT") {
          stackToBeMerged = this.getTileStack("ROW", i).reverse();
          mergedStack = cloneDeep(this.mergeTileStack(stackToBeMerged));
          mergedStack.reverse().forEach(tileObject => {
            newBoardState.push(tileObject);
          });
        }
      }
      if (this.checkBoardChanged(newBoardState, this.boardState)) {
        console.log(newBoardState, this.boardState);
        let newActiveTile = this.activateRandomTile(newBoardState);
        newBoardState[newActiveTile].isActive = true;
        newBoardState[newActiveTile].currentValue = 2;
        this.updateBoard(newBoardState);
      }
    },
    // Takes an array the length of the board width, and merges it as a stack
    // according to the game's logic
    mergeTileStack: function(stack) {
      let newColumn = cloneDeep(stack);

      // Loop through tiles starting at the end tile
      for (let i = newColumn.length - 1; i > -1; i--) {
        //console.log("Before: ", newColumn);
        let currentTile = cloneDeep(newColumn[i]);
        let nextTile = cloneDeep(newColumn[i - 1]);
        if (!nextTile) {
          newColumn.forEach(tile => {
            tile.alreadyMerged = false;
          });
          //console.log("After: ", newColumn);
          break;
        }
        // If the current tile is empty, and the next tile is active,
        // move next tile to current space
        if (!currentTile.isActive) {
          if (nextTile.isActive) {
            newColumn[i] = this.transferTileProps(newColumn[i - 1], newColumn[i]);
            newColumn[i - 1] = this.clearTile(newColumn[i - 1]);

            newColumn = cloneDeep(this.mergeTileStack(newColumn));
          } else {
            for (let j = i - 2; j < newColumn.length; j--) {
              nextTile = cloneDeep(newColumn[j]);
              if (!nextTile) {
                break;
              }
              if (nextTile.isActive) {
                newColumn[i] = this.transferTileProps(newColumn[j], newColumn[i]);
                newColumn[j] = this.clearTile(newColumn[j]);
                newColumn = cloneDeep(this.mergeTileStack(newColumn));
                break;
              }
            }
          }
          // Else if current tile is active and hasn't already been merged,
          // and next tile is active, hasn't already been merged and equal in value,
          // double current tile and clear next tile
        } else {
          if (
            !currentTile.alreadyMerged &&
            (nextTile.isActive &&
              !nextTile.alreadyMerged &&
              nextTile.currentValue === currentTile.currentValue)
          ) {
            newColumn[i] = this.doubleTileValue(newColumn[i]);
            newColumn[i - 1] = this.clearTile(newColumn[i - 1]);
            newColumn = cloneDeep(this.mergeTileStack(newColumn));
          }
        }
      }

      return newColumn;
    },
    // Returns an array containing a single column or row according to the direction arg,
    // at the index specified.
    getTileStack: function(direction, index) {
      if (direction === "COLUMN") {
        return this.getColumnArray(index);
      } else if (direction === "ROW") {
        return this.getRowArray(index);
      }
    },
    // Returns an array of a single board column at the index specified
    getColumnArray(columnIndex) {
      let columnArray = ["", "", "", ""];
      let tileIndex = 0;

      for (let i = 0; i < this.boardSize; i++) {
        tileIndex = i * this.boardSize + columnIndex;
        columnArray[i] = this.boardState.find(tile => tile.id === tileIndex);
      }
      return columnArray;
    },
    // Returns an array of a single board row at the index specified
    getRowArray(rowIndex) {
      let rowArray = ["", "", "", ""];
      let tileIndex = 0;

      for (let i = 0; i < this.boardSize; i++) {
        tileIndex = i + this.boardSize * rowIndex;
        rowArray[i] = this.boardState.find(tile => tile.id === tileIndex);
      }
      return rowArray;
    },
    // Returns a tile whose value is double and alreadyMerged property is set to true
    doubleTileValue(tile) {
      tile.currentValue += tile.currentValue;
      tile.alreadyMerged = true;
      return tile;
    },
    // Takes an active tile and returns it in a deactivated or 'empty' state
    clearTile(tile) {
      tile.currentValue = null;
      tile.alreadyMerged = false;
      tile.isActive = false;
      return tile;
    },
    // Returns a tile whose properties have been transferred over from the fromTile arg
    transferTileProps(fromTile, toTile) {
      toTile.currentValue = fromTile.currentValue;
      toTile.alreadyMerged = fromTile.alreadyMerged;
      toTile.isActive = fromTile.isActive;
      return toTile;
    },
    // Compares two states of the game board and returns true if they are not equal
    checkBoardChanged(oldBoard, newBoard) {
      let changed = false;
      for (let i = 0; i < this.numberOfTiles; i++) {
        console.log(newBoard[i], oldBoard[i]);
        if (!(newBoard[i].currentValue === oldBoard[i].currentValue)) {
          //console.log(newBoard[i], oldBoard[i]);
          changed = true;
          return changed;
        }
      }
      return changed;
    }
  },
  created: function() {
    return this.initializeBoard();
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  width: 600px;
  height: 600px;
  background-color: blue;
  margin: 5px auto;
  padding: 5px;
  border-radius: 5px;
}
</style>