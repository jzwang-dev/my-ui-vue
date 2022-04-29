import columnsUtil from '../utils/columnsUtil';

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
  },

  computed: {
    normalizedDataSource() {
      return columnsUtil.normalizeDataSource(
        this.dataSource,
        this.dataValueField,
        this.dataTextField
      );
    }
  }
};
