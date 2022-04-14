export default {
  props: {
    dataSource: {
      type: Array,
      default() {
        return [];
      }
    },

    dataValueField: {
      type: String,
      default: 'value'
    },

    dataTextField: {
      type: String,
      default: 'text'
    }
  }
};
