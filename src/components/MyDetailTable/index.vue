<template>
  <table class="detail condensed" v-if="inner.detailItem">
    <tr v-for="column in displayableColumns" :key="column.key">
      <th>{{ column.header }}</th>
      <td>
        <slot
          :name="`item-${column.key}`"
          :item="inner.detailItem"
          :column="column"
        >
          <!-- prettier-ignore -->
          <div class="pre-line">{{ _formatValue(column.format, column.value(inner.detailItem)) | nulltext(column.nullText) }}</div>
        </slot>
      </td>
    </tr>
  </table>
</template>

<script>
import _normalizeColumn from '../MyTable/_normalizeColumn';
import myUtil from '../../utils/myUtil';
import { nulltext } from '../../filters';

export default {
  name: 'MyDetailTable',

  filters: {
    nulltext
  },

  props: {
    detailItem: {
      type: Object
    },

    columns: {
      type: Array,
      required: true,
      validator: (columns) => columns.every((column) => column.key)
    },

    visibleColumnKeys: {
      type: Array
    }
  },

  data() {
    return {
      inner: {
        detailItem: this._normalized_detailItem(),
        columns: this._normalized_columns(),
        visibleColumnKeys: this._normalized_visibleColumnKeys()
      }
    };
  },

  computed: {
    displayableColumns() {
      return this.inner.columns.filter(
        (column) => column.displayable !== false
      );
    },

    visibleColumns() {
      return this.displayableColumns.filter((column) =>
        this.inner.visibleColumnKeys.includes(column.key)
      );
    }
  },

  methods: {
    _normalized_detailItem() {
      if (!this.detailItem) {
        return null;
      }

      const detailItem = { ...this.detailItem };
      for (let column of this._normalized_columns()) {
        if (detailItem[column.key] === undefined) {
          detailItem[column.key] = column.defaultValue ?? null;
        }
      }

      return detailItem;
    },

    _normalized_columns() {
      return this.columns.map(_normalizeColumn);
    },

    _normalized_visibleColumnKeys() {
      const keys = this._normalized_columns()
        .filter((column) => column.displayable !== false)
        .map((column) => column.key);
      return (
        this.visibleColumnKeys?.filter((key) => keys.includes(key)) ?? keys
      );
    },

    _formatValue(format, value) {
      return myUtil.formatValue(format, value);
    }
  },

  watch: {
    'inner.detailItem': {
      deep: true,
      handler() {
        this.$emit('update:detailItem', this.inner.detailItem);
      },
      immediate: true
    },

    detailItem: {
      handler() {
        if (this.inner.detailItem !== this.detailItem) {
          this.inner.detailItem = this._normalized_detailItem();
        }
      }
    },

    'inner.columns': {
      deep: true,
      handler() {
        this.$emit('update:columns', this.inner.columns);
      },
      immediate: true
    },

    columns: {
      deep: true,
      handler() {
        if (this.inner.columns !== this.columns) {
          this.inner.columns = this._normalized_columns();
        }
      }
    },

    'inner.visibleColumnKeys': {
      handler() {
        this.$emit('update:visibleColumnKeys', this.inner.visibleColumnKeys);
      },
      immediate: true
    },

    visibleColumnKeys: {
      handler() {
        if (this.inner.visibleColumnKeys !== this.visibleColumnKeys) {
          this.inner.visibleColumnKeys = this._normalized_visibleColumnKeys();
        }
      }
    }
  }
};
</script>
