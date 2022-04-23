<template>
  <div class="my-dummy-button">
    <button type="button" class="btn btn-primary" @click="count++">
      clicked {{ count }} time(s)
    </button>
  </div>
</template>

<script>
export default {
  name: 'MyDummyButton',

  data() {
    return {
      count: 0
    };
  }
};
</script>
