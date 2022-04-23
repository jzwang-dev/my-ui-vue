<template>
  <div class="my-radio-button-list">
    <div
      class="custom-control custom-radio"
      :class="{ 'custom-control-inline': inline }"
      v-for="item in dataSource"
      :key="item[dataValueField]"
    >
      <input
        v-bind="$attrs"
        type="radio"
        :name="name"
        :id="`${_id}_${item[dataValueField]}`"
        :value="item[dataValueField]"
        v-model="innerChecked"
        class="custom-control-input"
        :class="inputClass"
        :style="inputStyle"
        :disabled="item.disabled === true || $attrs.disabled"
      />
      <label
        class="custom-control-label"
        :for="`${_id}_${item[dataValueField]}`"
        >{{ item[dataTextField] }}</label
      >
    </div>
  </div>
</template>

<script>
import dataSourceMixin from '../../mixins/dataSourceMixin';

export default {
  name: 'MyRadioButtonList',

  inheritAttrs: false,

  mixins: [dataSourceMixin],

  model: {
    prop: 'checked',
    event: 'change'
  },

  props: {
    checked: {
      type: [String, Number],
      default: ''
    },

    name: {
      type: String,
      required: true
    },

    id: {
      type: String
    },

    inline: {
      type: Boolean
    },

    inputClass: null,

    inputStyle: null
  },

  data() {
    return {
      innerChecked: this.checked
    };
  },

  computed: {
    _id() {
      return this.id ?? this.name;
    }
  },

  watch: {
    innerChecked() {
      this.$emit('change', this.innerChecked);
    }
  }
};
</script>
