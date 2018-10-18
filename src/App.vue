<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <Board/>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import Tile from "./components/Tile.vue";
import Board from "./components/Board.vue";

export default {
  name: "app",
  components: {
    HelloWorld,
    Tile,
    Board
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
