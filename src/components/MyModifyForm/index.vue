<template>
  <form
    class="my-modify-form"
    :id="_id"
    @submit.prevent
    v-if="inner.modifyItem"
  >
    <template v-for="column in _modifyColumns">
      <slot
        :name="`before-${column.key}`"
        :item="inner.modifyItem"
        :column="column"
      ></slot>
      <slot
        :name="`edit-${column.key}`"
        :item="inner.modifyItem"
        :column="column"
        v-if="
          column.visibleInModifyFormIf
            ? column.visibleInModifyFormIf(inner.modifyItem)
            : true
        "
      >
        <div class="form-group" :key="column.key">
          <label
            :for="`${_id}_modify-${column.key}`"
            v-if="!hideHeaderColumnKeys.includes(column.key)"
            >{{ column.header
            }}{{ _isColumnRequired(column) ? '*' : '' }}</label
          >
          <div
            class="modify-item"
            :class="{ 'is-invalid': column.errors.length }"
          >
            <column-edit-control
              :column="column"
              :editItem.sync="inner.modifyItem"
              :idPrefix="`${_id}_modify-`"
              @model-change="
                (value, event) =>
                  _onColumnEditControlModelChange(value, column, event)
              "
              :disabled="column.editable === false"
            />
          </div>
          <div class="invalid-feedback">
            {{ column.errors.join(column.errorsSeparator || ', ') }}
          </div>
        </div>
      </slot>
      <slot
        :name="`after-${column.key}`"
        :item="inner.modifyItem"
        :column="column"
      ></slot>
    </template>
    <div v-if="showActions">
      <button type="button" class="btn btn-primary" @click="save">儲存</button>
      <button type="button" class="btn btn-secondary" @click="cancel">
        取消
      </button>
    </div>
  </form>
</template>

<script>
import ColumnEditControl from '../MyColumnEditControl';
import _normalizeColumn from '../MyTable/_normalizeColumn';
import columnsUtil from '../../utils/columnsUtil';
import messageUtil from '../../utils/messageUtil';
import myUtil from '../../utils/myUtil';

export default {
  name: 'MyModifyForm',

  components: {
    ColumnEditControl
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

    modifyMode: {
      type: String,
      default: 'update'
    },

    showActions: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      inner: {
        modifyItem: this._normalized_modifyItem(),
        columns: this._normalized_columns()
      }
    };
  },

  computed: {
    _id() {
      return this.$attrs.id ?? myUtil.randomId();
    },

    visibleColumns() {
      return this.inner.columns.filter(
        (column) =>
          column.visibleInModifyForm !== false &&
          !this.invisibleColumnKeys.includes(column.key)
      );
    },

    _modifyColumns() {
      if (this.modifyMode === 'create') {
        return this.visibleColumns.filter(
          (column) => !this.updateOnlyColumnKeys.includes(column.key)
        );
      } else {
        return this.visibleColumns;
      }
    }
  },

  methods: {
    _normalized_modifyItem() {
      if (!this.modifyItem) {
        return null;
      }

      const modifyItem = { ...this.modifyItem };
      for (let column of this._normalized_columns()) {
        if (modifyItem[column.key] === undefined) {
          modifyItem[column.key] = column.defaultValue ?? null;
        } else {
          const valueToEdit = column.valueToEdit(modifyItem);
          if (modifyItem[column.key] !== valueToEdit) {
            modifyItem[`_${column.key}`] = modifyItem[column.key];
            modifyItem[column.key] = valueToEdit ?? null;
          }
        }
      }

      return modifyItem;
    },

    _normalized_columns() {
      return this.columns.map(_normalizeColumn);
    },

    _isColumnRequired(column) {
      return columnsUtil.isColumnRequired(column, this.inner.modifyItem);
    },

    validateModifyItem() {
      return columnsUtil.validateItem(
        this.inner.columns,
        this.inner.modifyItem
      );
    },

    clearErrors() {
      columnsUtil.clearErrors(this.inner.columns);
    },

    getErrors() {
      return columnsUtil.getErrors(this.inner.columns);
    },

    _onColumnEditControlModelChange(value, column, event) {
      // console.log(
      //   '(MyModifyForm)_onColumnEditControlModelChange',
      //   value,
      //   event
      // );

      if (event) {
        columnsUtil.validateColumn(value, column, this.inner.modifyItem);
      }
    },

    save() {
      if (!this.validateModifyItem()) {
        this.$emit('validate-item-failed', {
          errors: this.getErrors(),
          item: this.inner.modifyItem
        });

        this.$nextTick(() => {
          const el = document.querySelector('.is-invalid:first-of-type');
          el?.scrollIntoView();
          messageUtil.toast('請確認輸入是否有誤！？', 'error');
        });

        return;
      }

      const modifyItem = Object.assign({}, this.inner.modifyItem);

      if (this.modifyMode === 'create') {
        delete modifyItem._myui_itemIndex;
        this.$emit('save-create-item', modifyItem);
      } else {
        this.$emit('save-update-item', modifyItem);
      }
    },

    cancel() {
      this.clearErrors();
      const modifyItem = Object.assign({}, this.inner.modifyItem);
      if (modifyItem._myui_itemIndex != null) {
        delete modifyItem._myui_itemIndex;
      }
      this.$emit('cancel-item', modifyItem);
      this.inner.modifyItem = null;
    }
  },

  watch: {
    'inner.modifyItem': {
      deep: true,
      handler() {
        this.$emit('update:modifyItem', this.inner.modifyItem);
      },
      immediate: true
    },

    modifyItem: {
      handler() {
        if (this.inner.modifyItem !== this.modifyItem) {
          this.inner.modifyItem = this._normalized_modifyItem();
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
