<template>
    <div class="counter-box">

  
        <h1>{{count}}</h1>

        <p v-if="flag">cant go lower than 0</p>

        <button @click="decrement"> - </button>
        <button @click="reset"> Reset </button>
        <button v-on:click="increment"> + </button>

    </div>
</template>

<script>

export default {
    name: "Counter-Box",
    data(): {
    return {
        count: 0,
        flag:false
    };
  },

  methods: {
    decrement(){

      if (this.count <=0){
        this.flag=true;
      }
      else{
        this.flag=false;
        this.count --;
      }
      
    },

    reset(){
      this.count = 0;
    },

    increment(){
      this.count++;
    }
    }
}

</script>

<style scoped>

.counter-box { font-family: monospace; text-align: center; margin-top: 50px; }
h1 { font-size: 4rem; margin: 10px; }
button { padding: 10px 20px; font-size: 1.2rem; margin: 5px; cursor: pointer; }


</style>
