<template>
  <form :id="id" @submit.prevent v-if="inner.modifyItem">
    <div
      class="form-group"
      v-for="column in displayableColumns"
      :key="column.key"
    >
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

    modifyMode: {
      type: String,
      default: 'update'
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
    displayableColumns() {
      return this.inner.columns.filter(
        (column) => column.displayable !== false
      );
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
    }
  },

  watch: {
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
    }
  }
};
</script>
