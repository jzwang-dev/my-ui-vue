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
    :class="[
      column.control.cssClass,
      { 'is-invalid': column.errors.length },
      `form-control-${size}`
    ]"
    :style="column.control.style"
    @input="_onModelChange($event.target.value, $event)"
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
    :class="[
      column.control.cssClass,
      { 'is-invalid': column.errors.length },
      `form-control-${size}`
    ]"
    :style="column.control.style"
    @change="_onModelChange($event.target.value, $event)"
  >
    <option
      :value="column.control.emptyOptionValue"
      v-if="column.control.showEmptyOption"
    >
      {{ column.control.emptyOptionText }}
    </option>
    <option
      v-for="dataItem in normalizeDataSource(column)"
      :key="dataItem[column.control.dataValueField]"
      :value="dataItem[column.control.dataValueField]"
      :disabled="dataItem.disabled === true"
    >
      {{ dataItem[column.control.dataTextField] }}
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
    :inputClass="{ 'is-invalid': column.errors.length }"
    @change="(checked) => _onModelChange(checked)"
    @change.native="_onModelChange(inner.editItem[column.key], $event)"
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
    :inputClass="{ 'is-invalid': column.errors.length }"
    @change="(checked) => _onModelChange(checked)"
    @change.native="_onModelChange(inner.editItem[column.key], $event)"
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
    :inputClass="{ 'is-invalid': column.errors.length }"
    @change="(checked) => _onModelChange(checked)"
    @change.native="_onModelChange(inner.editItem[column.key], $event)"
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
    :class="[
      column.control.cssClass,
      { 'is-invalid': column.errors.length },
      `form-control-${size}`
    ]"
    :style="column.control.style"
    @input="_onModelChange($event.target.value, $event)"
  ></textarea>
</template>

<script>
import MyRadioButtonList from '../MyRadioButtonList';
import MyCheckBox from '../MyCheckBox';
import MyCheckBoxList from '../MyCheckBoxList';
import columnUtil from '../../utils/columnsUtil';

export default {
  name: 'MyColumnEditControl',

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
    },

    size: {
      type: String,
      default: 'md',
      validator(value) {
        return ['sm', 'md', 'lg', 'xl'].indexOf(value) !== -1;
      }
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
    _onModelChange(value, event) {
      this.$emit('model-change', value, event);
    },

    normalizeDataSource(column) {
      return columnUtil.normalizeDataSource(
        column.control.dataSource,
        column.control.dataValueField,
        column.control.dataTextField
      );
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
