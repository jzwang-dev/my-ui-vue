<template>
  <div class="column-edit-control" v-if="inner.editItem">
    <template
      v-if="
        column.control.type && column.control.type.toLowerCase() === 'input'
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
        :name="`${idPrefix}${column.key}`"
        :id="`${idPrefix}${column.key}`"
        v-model="inner.editItem[column.key]"
        :placeholder="column.header"
        class="form-control"
        :class="[
          column.control.cssClass,
          { 'is-invalid': column.errors.length }
        ]"
        :style="column.control.style"
        @input="_onModelChange($event.target.value, column)"
      />
    </template>
    <template
      v-else-if="
        column.control.type && column.control.type.toLowerCase() === 'select'
      "
    >
      <select
        :name="`${idPrefix}${column.key}`"
        :id="`${idPrefix}${column.key}`"
        v-model="inner.editItem[column.key]"
        class="form-control"
        :class="[
          column.control.cssClass,
          { 'is-invalid': column.errors.length }
        ]"
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
    </template>
    <template
      v-else-if="
        column.control.type &&
        column.control.type.toLowerCase() === 'radiobuttonlist'
      "
    >
      <my-radio-button-list
        :name="`${idPrefix}${column.key}`"
        v-model="inner.editItem[column.key]"
        :dataSource="column.control.dataSource"
        :dataValueField="column.control.dataValueField"
        :dataTextField="column.control.dataTextField"
        :inline="column.control.inline"
        :class="[
          column.control.cssClass,
          { 'in-invalid': column.errors.length }
        ]"
        :style="column.control.style"
        @change="_onModelChange($event, column)"
      />
    </template>
    <template
      v-else-if="
        column.control.type && column.control.type.toLowerCase() === 'checkbox'
      "
    >
      <my-check-box
        :name="`${idPrefix}${column.key}`"
        v-model="inner.editItem[column.key]"
        :trueValue="column.control.trueValue"
        :falseValue="column.control.falseValue"
        :label="column.header"
        :class="[
          column.control.cssClass,
          { 'in-invalid': column.errors.length }
        ]"
        :style="column.control.style"
        @change="_onModelChange($event, column)"
      />
    </template>
    <template
      v-else-if="
        column.control.type &&
        column.control.type.toLowerCase() === 'checkboxlist'
      "
    >
      <my-check-box-list
        :name="`${idPrefix}${column.key}`"
        v-model="inner.editItem[column.key]"
        :dataSource="column.control.dataSource"
        :dataValueField="column.control.dataValueField"
        :dataTextField="column.control.dataTextField"
        :inline="column.control.inline"
        :class="[
          column.control.cssClass,
          { 'in-invalid': column.errors.length }
        ]"
        :style="column.control.style"
        @change="_onModelChange($event, column)"
      />
    </template>
    <template
      v-else-if="
        column.control.type && column.control.type.toLowerCase() === 'textarea'
      "
    >
      <textarea
        :name="`${idPrefix}${column.key}`"
        :id="`${idPrefix}${column.key}`"
        v-model="inner.editItem[column.key]"
        :placeholder="column.header"
        class="form-control"
        :class="[
          column.control.cssClass,
          { 'is-invalid': column.errors.length }
        ]"
        :style="column.control.style"
        @input="_onModelChange($event.target.value, column)"
      ></textarea>
    </template>
  </div>
</template>

<script>
import MyRadioButtonList from '../../controls/MyRadioButtonList';
import MyCheckBox from '../../controls/MyCheckBox';
import MyCheckBoxList from '../../controls/MyCheckBoxList';

export default {
  name: 'ColumnEditControl',

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
