<template>
    <div>
        <p :class= "{active: isActive}">{{currentValue}}</p>
    </div>
</template>

<script>
export default {
  name: "Tile",
  props: {},
  data: function() {
    return {
      tileId: this.$vnode.key
    };
  },
  computed: {
    // Tile object containing its data based on its id
    getTileState() {
      return this.$store.getters.getBoardState[this.tileId];
    },
    // Boolean
    isActive() {
      //return this.getBoardState[this.tileId].isActive;
      return this.getTileState.isActive;
    },
    // Number
    currentValue() {
      return this.getTileState.currentValue;
    },
    // [x,y] array
    coordinates() {
      return this.getTileState.coordinates;
    }
  },
  methods: {}
};
</script>

<style scoped>
p {
  color: aliceblue;
  background-color: #3e6da1;
  width: 80px;
  height: 80px;
  border: 5px solid rgb(133, 133, 133);
  margin: 5px auto;
  border-radius: 10px;
  line-height: 80px;
}
.active {
  color: aliceblue;
  background-color: #42b96a;
  border: 5px solid rgb(179, 179, 179);
}
</style>