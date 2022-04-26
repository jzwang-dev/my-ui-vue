<template>
  <div class="my-modify-modal modal fade" :id="_id" tabindex="-1">
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
          <h5 class="modal-title">
            {{ modifyMode == 'create' ? '新增' : '修改' }}{{ title }}
          </h5>
          <button type="button" class="close" data-dismiss="modal">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <slot name="body-begin" :item="inner.modifyItem"></slot>
          <my-modify-form
            ref="modifyForm"
            :modifyItem.sync="inner.modifyItem"
            :columns="columns"
            :invisibleColumnKeys="invisibleColumnKeys"
            :updateOnlyColumnKeys="updateOnlyColumnKeys"
            :hideHeaderColumnKeys="hideHeaderColumnKeys"
            :modifyMode="modifyMode"
            :showActions="false"
            @validate-item-failed="
              ({ errors, item }) =>
                $emit('validate-item-failed', { errors, item })
            "
            @save-create-item="(item) => $emit('save-create-item', item)"
            @save-update-item="(item) => $emit('save-update-item', item)"
            @cancel-item="(item) => $emit('cancel-item', item)"
          >
            <template
              v-for="(_, slot) in $scopedSlots"
              v-slot:[slot]="slotProps"
            >
              <slot :name="slot" v-bind="slotProps" />
            </template>
          </my-modify-form>
          <slot name="body-end" :item="inner.modifyItem"></slot>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">
            <i class="fas fa-times"></i> 關閉
          </button>
          <button type="button" class="btn btn-primary" @click="save">
            <i class="fas fa-check"></i> 儲存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import 'bootstrap/js/dist/modal';
import MyModifyForm from '../MyModifyForm';
import '../MyModifyForm/style.css';
import '../../configs/bootstrapDefaultSettings';
import myUtil from '../../utils/myUtil';

const events = [
  'show.bs.modal',
  'shown.bs.modal',
  'hide.bs.modal',
  'hidden.bs.modal',
  'hidePrevented.bs.modal'
];

export default {
  name: 'MyModifyModal',

  components: {
    MyModifyForm
  },

  props: {
    modifyItem: {
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
    },

    updateOnlyColumnKeys: {
      type: Array,
      default() {
        return [];
      }
    },

    hideHeaderColumnKeys: {
      type: Array,
      default() {
        return [];
      }
    },

    rowKey: {
      type: String,
      default: 'id'
    },

    title: {
      type: String
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
        modifyItem: this.modifyItem,
        columns: this.columns
      }
    };
  },

  computed: {
    _id() {
      return this.$attrs.id ?? myUtil.randomId();
    },

    modifyMode() {
      return !this.modifyItem?.[this.rowKey] ? 'create' : 'update';
    }
  },

  methods: {
    close() {
      $(this.$el).modal('hide');
    },

    _onHidden() {
      this.$refs.modifyForm.cancel();
    },

    save() {
      this.$refs.modifyForm.save();
    }
  },

  mounted() {
    $(this.$el)
      .modal({ show: false })
      .on('hidden.bs.modal', () => {
        this._onHidden();
      });

    events.forEach((event) => {
      $(this.$el).on(event, (...args) => {
        const eventName = event.replace(/[.|:]/g, '-');
        this.$emit(eventName, ...args);
        this.$root.$emit(eventName, ...args);
      });
    });
  },

  beforeDestroy() {
    $(this.$el).off('').modal('dispose');
  },

  watch: {
    'inner.modifyItem': {
      deep: true,
      handler() {
        this.$emit('update:modifyItem', this.inner.modifyItem);
      },
      immediate: true
    },

    modifyItem: [
      {
        handler() {
          if (this.inner.modifyItem !== this.modifyItem) {
            this.inner.modifyItem = this.modifyItem;
          }
        }
      },
      {
        handler(modifyItem, old) {
          if (modifyItem && !old) {
            $(this.$el).modal('show');
          } else if (!modifyItem) {
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
