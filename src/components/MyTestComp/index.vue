<template>
  <div class="my-test-comp">
    <button type="button" class="btn btn-primary" @click="count++">
      click
    </button>
    <div>clicked {{ count }} time(s).</div>
  </div>
</template>

<style scoped>
.my-test-comp {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>

<script>
export default {
  name: 'MyTestComp',

  data() {
    return {
      count: 0
    };
  }
};
</script>
