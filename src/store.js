import Vue from "vue";
import Vuex from "vuex";
import cloneDeep from "lodash/cloneDeep";

Vue.use(Vuex);

const state = {
  boardSize: 4,
  boardState: []
};

const mutations = {
  UPDATE_BOARD_STATE(state, boardArray) {
    state.boardState = cloneDeep(
      boardArray.sort(function(a, b) {
        return a.id - b.id;
      })
    );
  }
};

const actions = {};

const getters = {
  // Returns xy dimension of the board
  getBoardSize(state) {
    return state.boardSize;
  },
  // Returns array of all empty tiles' id's
  getInactiveTiles(state) {
    var inactiveTiles = [];
    state.boardState.forEach(tile => {
      if (!tile.isActive) {
        inactiveTiles.push(tile.id);
      }
    });
    return inactiveTiles;
  },
  // Returns the state array of all Tile objects on the board
  getBoardState(state) {
    return state.boardState;
  },
  getTileById: state => id => {
    return state.boardState.find(tile => tile.id === id);
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
});

/*
Tile Object:
{
    id = Number
    coordinates = 1x2 Array
    isActive = Boolean
    currentValue = Number
    alreadymerged = Boolean
}
*/
