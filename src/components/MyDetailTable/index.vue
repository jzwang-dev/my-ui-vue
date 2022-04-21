<template>
  <table class="detail condensed" v-if="inner.detailItem">
    <template v-for="column in visibleColumns">
      <slot
        :name="`before-${column.key}`"
        :item="inner.detailItem"
        :column="column"
      ></slot>
      <tr :key="column.key">
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
      <slot
        :name="`after-${column.key}`"
        :item="inner.detailItem"
        :column="column"
      ></slot>
    </template>
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

    invisibleColumnKeys: {
      type: Array,
      default() {
        return [];
      }
    }
  },

  data() {
    return {
      inner: {
        detailItem: this._normalized_detailItem(),
        columns: this._normalized_columns()
      }
    };
  },

  computed: {
    visibleColumns() {
      return this.inner.columns.filter(
        (column) =>
          column.visible !== false &&
          !this.invisibleColumnKeys.includes(column.key)
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
    }
  }
};
</script>
