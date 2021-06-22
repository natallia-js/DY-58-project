<template>
  <div class="outer-cursor-block">
    <div class="current-order-pattern-pos-block blink" />
  </div>
</template>

<script>
  export default {
  }
</script>


<style lang="scss" scoped>
  .outer-cursor-block {
    width: auto;
    margin: 0 10px 10px 0;
  }

  .current-order-pattern-pos-block {
    width: 2px;
    height: 100%;
    background-color: var(--primary-color);
  }

  .blink {
    animation-name: blinker;
    animation-iteration-count: infinite;
    animation-timing-function: cubic-bezier(1.0,2.0,0,1.0);
    animation-duration: 1s;
    -webkit-animation-name: blinker;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-timing-function: cubic-bezier(1.0,2.0,0,1.0);
    -webkit-animation-duration: 1s;
  }

  @keyframes blinker {
    from { opacity: 1.0; }
    to { opacity: 0.0; }
  }

  @-webkit-keyframes blinker {
    from { opacity: 1.0; }
    to { opacity: 0.0; }
  }
</style>
