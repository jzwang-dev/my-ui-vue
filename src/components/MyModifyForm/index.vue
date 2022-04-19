<template>
  <form :id="id" @submit.prevent v-if="inner.modifyItem">
    <div class="form-group" v-for="column in _modifyColumns" :key="column.key">
      <slot
        :name="`edit-${column.key}`"
        :item="inner.modifyItem"
        :column="column"
      >
        <label :for="`modify-${column.key}`"
          >{{ column.header }}{{ _isColumnRequired(column) ? '*' : '' }}</label
        >
        <div
          class="modify-item"
          :class="{ 'is-invalid': column.errors.length }"
        >
          <column-edit-control
            :column="column"
            :editItem.sync="inner.modifyItem"
            :idPrefix="'`modify-'"
            @model-change="_onColumnEditControlModelChange"
            :disabled="column.editable === false"
          />
        </div>
        <div class="invalid-feedback">
          {{ column.errors.join(column.errorsSeparator || ', ') }}
        </div>
      </slot>
    </div>
    <div>
      <button type="button" class="btn btn-primary" @click="_onSave">
        儲存
      </button>
      <button type="button" class="btn btn-secondary" @click="_onCancel">
        取消
      </button>
    </div>
  </form>
</template>

<script>
import ColumnEditControl from '../MyTable/components/_ColumnEditControl.vue';
import _normalizeColumn from '../MyTable/_normalizeColumn';

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

    visibleColumnKeys: {
      type: Array
    },

    modifyMode: {
      type: String,
      default: 'update'
    },

    updateOnlyKeys: {
      type: Array,
      default() {
        return [];
      }
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
    },

    _modifyColumns() {
      if (this.modifyMode === 'create') {
        return this.visibleColumns.filter(
          (column) => !this.updateOnlyKeys.includes(column.key)
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
          modifyItem[column.key] = column.defaultValue;
        } else {
          const valueToEdit = column.valueToEdit(modifyItem);
          if (modifyItem[column.key] !== valueToEdit) {
            modifyItem[`_${column.key}`] = modifyItem[column.key];
            modifyItem[column.key] = valueToEdit;
          }
        }
      }

      return modifyItem;
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

    _isColumnRequired(column) {
      return column.validators
        ?.map((validator) => validator.validatorName)
        .includes('required');
    },

    _validateModifyItemField(value, column) {
      column.errors = [];
      for (let validator of column.validators ?? []) {
        const result = validator(value, this.inner.modifyItem);
        if (result !== true) {
          column.errors.push(result);
          if (column.validationMode.greedy !== true) {
            break;
          }
        }
      }
      return column.errors.length === 0;
    },

    validateModifyItem() {
      this.clearErrors();
      if (!this.inner.modifyItem) {
        return true;
      }
      let valid = true;
      for (let column of this.inner.columns) {
        if (
          !this._validateModifyItemField(
            this.inner.modifyItem[column.key],
            column
          )
        ) {
          valid = false;
        }
      }
      return valid;
    },

    clearErrors() {
      for (let column of this.inner.columns) {
        column.errors = [];
      }
    },

    getErrors() {
      return this.inner.columns.map((column) => {
        const errors = column.errors ?? [];
        return {
          key: column.key,
          errors,
          errMsg: errors.join(column.errorsSeparator || ', ')
        };
      });
    },

    _onColumnEditControlModelChange(value, column) {
      //console.log('_onColumnEditControlModelChange', value);

      if (column.validationMode.lazy !== true) {
        this._validateModifyItemField(value, column);
      }
    },

    _onSave() {
      if (!this.validateModifyItem()) {
        this.$emit('validate-item-failed', {
          errors: this.getErrors(),
          item: this.inner.modifyMode
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

    _onCancel() {
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
