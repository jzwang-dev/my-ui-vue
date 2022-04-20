<template>
  <form :id="id" @submit.prevent v-if="inner.modifyItem">
    <template v-for="column in _modifyColumns">
      <slot
        :name="`edit-${column.key}`"
        :item="inner.modifyItem"
        :column="column"
      >
        <div class="form-group" :key="column.key">
          <label :for="`modify-${column.key}`"
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
              :idPrefix="'`modify-'"
              @model-change="
                (value, column) =>
                  _onColumnEditControlModelChange(value, column)
              "
              :disabled="column.editable === false"
            />
          </div>
          <div class="invalid-feedback">
            {{ column.errors.join(column.errorsSeparator || ', ') }}
          </div>
        </div>
      </slot>
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
import ColumnEditControl from '../MyTable/components/_ColumnEditControl.vue';
import _normalizeColumn from '../MyTable/_normalizeColumn';
import columnsUtil from '../MyTable/utils/columnsUtil';
import messageUtil from '../../utils/messageUtil';

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

    modifyMode: {
      type: String,
      default: 'update'
    },

    showActions: {
      type: Boolean,
      default: true
    },

    id: {
      type: String,
      default: 'modifyForm'
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
    visibleColumns() {
      return this.inner.columns.filter(
        (column) =>
          column.visible !== false &&
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
      return column.validators
        ?.map((validator) => validator.validatorName)
        .includes('required');
    },

    _validateModifyItemField(value, column) {
      return columnsUtil.validateItemField(
        value,
        column,
        this.inner.modifyItem
      );
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

    _onColumnEditControlModelChange(value, column) {
      //console.log('_onColumnEditControlModelChange', value);

      columnsUtil.handleColumnModelChange(value, column, this.inner.modifyItem);
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
        delete modifyItem._itemIndex;
        this.$emit('save-create-item', modifyItem);
      } else {
        this.$emit('save-update-item', modifyItem);
      }
    },

    cancel() {
      this.clearErrors();
      const modifyItem = Object.assign({}, this.inner.modifyItem);
      if (modifyItem._itemIndex != null) {
        delete modifyItem._itemIndex;
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
