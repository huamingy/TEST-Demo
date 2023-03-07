<!--  -->
<template>
  <div  ref="webgl" id="test"  class="canvas"></div>
</template>
<script >
import {renderer} from '../js/test01.js'

export default {
    data() {
      return{
      }
    },
    props:[],
    components: {},
    created() {
    },
    mounted() {
      this.$refs.webgl.appendendChild(renderer.domElement)
    },
    methods:{
    }
  };
</script>

<style lang='scss'>
.canvas{
  margin-top: 10px;
  margin-left: 10px;
}

</style>