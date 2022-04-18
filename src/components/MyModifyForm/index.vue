<template>
  <form :id="id" @submit.prevent v-if="inner.modifyItem">
    <div v-for="column in displayableColumns" :key="column.key">
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
          <template
            v-if="
              column.control.type &&
              column.control.type.toLowerCase() === 'input'
            "
          >
            <input
              :type="
                column.dataType === Date
                  ? 'date'
                  : column.dataType === Number
                  ? 'number'
                  : 'text'
              "
              :name="`modify-${column.key}`"
              :id="`modify-${column.key}`"
              v-model="inner.modifyItem[column.key]"
              :placeholder="column.header"
              class="form-control"
              :class="[
                column.control.cssClass,
                { 'is-invalid': column.errors.length }
              ]"
              :style="column.control.style"
              @input="_onEditControlModelChange($event.target.value, column)"
            />
          </template>
          <template
            v-else-if="
              column.control.type &&
              column.control.type.toLowerCase() === 'select'
            "
          >
            <select
              :name="`modify-${column.key}`"
              :id="`modify-${column.key}`"
              v-model="inner.modifyItem[column.key]"
              class="form-control"
              :class="[
                column.control.cssClass,
                { 'is-invalid': column.errors.length }
              ]"
              :style="column.control.style"
              @change="_onEditControlModelChange($event.target.value, column)"
            >
              <option
                :value="column.control.emptyOptionValue"
                v-if="column.control.showEmptyOption"
              >
                {{ column.control.emptyOptionText }}
              </option>
              <option
                v-for="item in column.control.dataSource"
                :key="item[column.control.dataValueField]"
                :value="item[column.control.dataValueField]"
                :disabled="item.disabled === true"
              >
                {{ item[column.control.dataTextField] }}
              </option>
            </select>
          </template>
          <template
            v-else-if="
              column.control.type &&
              column.control.type.toLowerCase() === 'radiobuttonlist'
            "
          >
            <my-radio-button-list
              :name="`modify-${column.key}`"
              v-model="inner.modifyItem[column.key]"
              :dataSource="column.control.dataSource"
              :dataValueField="column.control.dataValueField"
              :dataTextField="column.control.dataTextField"
              :inline="column.control.inline"
              :class="[
                column.control.cssClass,
                { 'in-invalid': column.errors.length }
              ]"
              :style="column.control.style"
              @change="_onEditControlModelChange($event, column)"
            />
          </template>
          <template
            v-else-if="
              column.control.type &&
              column.control.type.toLowerCase() === 'checkbox'
            "
          >
            <my-check-box
              :name="`modify-${column.key}`"
              v-model="inner.modifyItem[column.key]"
              :trueValue="column.control.trueValue"
              :falseValue="column.control.falseValue"
              :label="column.header"
              :class="[
                column.control.cssClass,
                { 'in-invalid': column.errors.length }
              ]"
              :style="column.control.style"
              @change="_onEditControlModelChange($event, column)"
            />
          </template>
          <template
            v-else-if="
              column.control.type &&
              column.control.type.toLowerCase() === 'checkboxlist'
            "
          >
            <my-check-box-list
              :name="`modify-${column.key}`"
              v-model="inner.modifyItem[column.key]"
              :dataSource="column.control.dataSource"
              :dataValueField="column.control.dataValueField"
              :dataTextField="column.control.dataTextField"
              :inline="column.control.inline"
              :class="[
                column.control.cssClass,
                { 'in-invalid': column.errors.length }
              ]"
              :style="column.control.style"
              @change="_onEditControlModelChange($event, column)"
            />
          </template>
          <template
            v-else-if="
              column.control.type &&
              column.control.type.toLowerCase() === 'textarea'
            "
          >
            <textarea
              :name="`modify-${column.key}`"
              :id="`modify-${column.key}`"
              v-model="inner.modifyItem[column.key]"
              :placeholder="column.header"
              class="form-control"
              :class="[
                column.control.cssClass,
                { 'is-invalid': column.errors.length }
              ]"
              :style="column.control.style"
              @input="_onEditControlModelChange($event.target.value, column)"
            ></textarea>
          </template>
        </div>
      </slot>
    </div>
  </form>
</template>

<script>
import MyRadioButtonList from '../controls/MyRadioButtonList';
import MyCheckBox from '../controls/MyCheckBox';
import MyCheckBoxList from '../controls/MyCheckBoxList';
import _normalizeColumn from '../MyTable/_normalizeColumn';

export default {
  name: 'MyModifyForm',

  components: {
    MyRadioButtonList,
    MyCheckBox,
    MyCheckBoxList
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

    _onEditControlModelChange(value, column) {
      console.log('_onEditControlModelChange', value);

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
