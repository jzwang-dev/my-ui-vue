<template>
  <div class="modal fade" :id="id" tabindex="-1">
    <div
      class="modal-dialog"
      :class="[
        `modal-${size}`,
        {
          'modal-dialog-centered': centered,
          'modal-dialog-scrollable': scrollable
        }
      ]"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">檢視{{ title }}</h5>
          <button type="button" class="close" data-dismiss="modal">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <my-detail-table
            :detailItem.sync="inner.detailItem"
            :columns="columns"
            :invisibleKeys="invisibleKeys"
          >
            <template
              v-for="(_, slot) in $scopedSlots"
              v-slot:[slot]="slotProps"
            >
              <slot :name="slot" v-bind="slotProps" />
            </template>
          </my-detail-table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            <i class="fas fa-times"></i> 關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MyDetailTable from '../MyDetailTable';

export default {
  name: 'MyDetailModal',

  components: {
    MyDetailTable
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

    invisibleKeys: {
      type: Array,
      default() {
        return [];
      }
    },

    title: {
      type: String
    },

    id: {
      type: String,
      default: 'detialModal'
    },

    size: {
      type: String,
      default: 'md',
      validator(value) {
        return ['sm', 'md', 'lg', 'xl'].indexOf(value) !== -1;
      }
    },

    centered: {
      type: Boolean,
      default: true
    },

    scrollable: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      inner: {
        detailItem: this.detailItem,
        columns: this.columns
      }
    };
  },

  methods: {
    close() {
      $(this.$el).modal('hide');
    },

    _onHidden() {
      this.inner.detailItem = null;
    }
  },

  mounted() {
    $(this.$el)
      .modal({ show: false })
      .on('hidden.bs.modal', () => {
        this._onHidden();
      });
  },

  beforeDestroy() {
    $(this.$el).off('hidden.bs.modal');
  },

  watch: {
    'inner.detailItem': {
      deep: true,
      handler() {
        this.$emit('update:detailItem', this.inner.detailItem);
      },
      immediate: true
    },

    detailItem: [
      {
        handler() {
          if (this.inner.detailItem !== this.detailItem) {
            this.inner.detailItem = this.detailItem;
          }
        }
      },
      {
        handler(detailItem, old) {
          if (detailItem && !old) {
            $(this.$el).modal('show');
          } else if (!detailItem) {
            $(this.$el).modal('hide');
          }
        }
      }
    ],

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
          this.inner.columns = this.columns;
        }
      }
    }
  }
};
</script>
