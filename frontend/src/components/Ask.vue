<template>
    <div id="seek">
        <p>Seek</p>
    </div>
</template>
<script>
  export default {
    props: {
      source: String,
    },

    data: function () {
      return {
        appName: this.$appName,
        drawer: null
      }
    },
  }
</script>