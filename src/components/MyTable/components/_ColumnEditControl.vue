<template>
  <input
    v-if="
      this.inner.editItem &&
      column.control.type &&
      column.control.type.toLowerCase() === 'input'
    "
    v-bind="$attrs"
    :type="
      column.dataType === Date
        ? 'date'
        : column.dataType === Number
        ? 'number'
        : 'text'
    "
    :name="`${idPrefix}${column.key}`"
    :id="`${idPrefix}${column.key}`"
    v-model="inner.editItem[column.key]"
    :placeholder="column.header"
    class="form-control"
    :class="[column.control.cssClass, { 'is-invalid': column.errors.length }]"
    :style="column.control.style"
    @input="_onModelChange($event.target.value, column)"
  />

  <select
    v-else-if="
      this.inner.editItem &&
      column.control.type &&
      column.control.type.toLowerCase() === 'select'
    "
    v-bind="$attrs"
    :name="`${idPrefix}${column.key}`"
    :id="`${idPrefix}${column.key}`"
    v-model="inner.editItem[column.key]"
    class="form-control"
    :class="[column.control.cssClass, { 'is-invalid': column.errors.length }]"
    :style="column.control.style"
    @change="_onModelChange($event.target.value, column)"
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

  <my-radio-button-list
    v-else-if="
      this.inner.editItem &&
      column.control.type &&
      column.control.type.toLowerCase() === 'radiobuttonlist'
    "
    v-bind="$attrs"
    :name="`${idPrefix}${column.key}`"
    v-model="inner.editItem[column.key]"
    :dataSource="column.control.dataSource"
    :dataValueField="column.control.dataValueField"
    :dataTextField="column.control.dataTextField"
    :inline="column.control.inline"
    :class="[column.control.cssClass, { 'is-invalid': column.errors.length }]"
    :style="column.control.style"
    @change="_onModelChange($event, column)"
  />

  <my-check-box
    v-else-if="
      this.inner.editItem &&
      column.control.type &&
      column.control.type.toLowerCase() === 'checkbox'
    "
    v-bind="$attrs"
    :name="`${idPrefix}${column.key}`"
    v-model="inner.editItem[column.key]"
    :trueValue="column.control.trueValue"
    :falseValue="column.control.falseValue"
    :label="column.header"
    :class="[column.control.cssClass, { 'is-invalid': column.errors.length }]"
    :style="column.control.style"
    @change="_onModelChange($event, column)"
  />

  <my-check-box-list
    v-else-if="
      this.inner.editItem &&
      column.control.type &&
      column.control.type.toLowerCase() === 'checkboxlist'
    "
    v-bind="$attrs"
    :name="`${idPrefix}${column.key}`"
    v-model="inner.editItem[column.key]"
    :dataSource="column.control.dataSource"
    :dataValueField="column.control.dataValueField"
    :dataTextField="column.control.dataTextField"
    :inline="column.control.inline"
    :class="[column.control.cssClass, { 'is-invalid': column.errors.length }]"
    :style="column.control.style"
    @change="_onModelChange($event, column)"
  />

  <textarea
    v-else-if="
      this.inner.editItem &&
      column.control.type &&
      column.control.type.toLowerCase() === 'textarea'
    "
    v-bind="$attrs"
    :name="`${idPrefix}${column.key}`"
    :id="`${idPrefix}${column.key}`"
    v-model="inner.editItem[column.key]"
    :placeholder="column.header"
    class="form-control"
    :class="[column.control.cssClass, { 'is-invalid': column.errors.length }]"
    :style="column.control.style"
    @input="_onModelChange($event.target.value, column)"
  ></textarea>
</template>

<script>
import MyRadioButtonList from '../../controls/MyRadioButtonList';
import MyCheckBox from '../../controls/MyCheckBox';
import MyCheckBoxList from '../../controls/MyCheckBoxList';

export default {
  name: 'ColumnEditControl',

  inheritAttrs: false,

  components: {
    MyRadioButtonList,
    MyCheckBox,
    MyCheckBoxList
  },

  props: {
    column: {
      type: Object,
      required: true
    },

    editItem: {
      type: Object,
      required: true
    },

    idPrefix: {
      type: String,
      default: 'column-edit-'
    }
  },

  data() {
    return {
      inner: {
        editItem: this.editItem
      }
    };
  },

  methods: {
    _onModelChange(value, column) {
      this.$emit('model-change', value, column);
    }
  },

  watch: {
    'inner.editItem': {
      deep: true,
      handler() {
        this.$emit('update:editItem', this.inner.editItem);
      }
    },

    editItem: {
      handler() {
        if (this.inner.editItem !== this.editItem) {
          this.inner.editItem = this.editItem;
        }
      }
    }
  }
};
</script>
