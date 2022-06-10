<template>
  <div class="my-check-box custom-control custom-checkbox">
    <input
      v-bind="$attrs"
      type="checkbox"
      :name="name"
      :id="_id"
      :value="trueValue"
      :checked="checked === trueValue"
      @change="$emit('change', $event.target.checked ? trueValue : falseValue)"
      class="custom-control-input"
      :class="inputClass"
      :style="inputStyle"
    />
    <label class="custom-control-label" :for="_id">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: "MyCheckBox",

  inheritAttrs: false,

  model: {
    prop: "checked",
    event: "change",
  },

  props: {
    checked: {
      type: [Boolean, String, Number],
      default: false,
    },

    name: {
      type: String,
      required: true,
    },

    trueValue: {
      type: [Boolean, String, Number],
      default: true,
    },

    falseValue: {
      type: [Boolean, String, Number],
      default: false,
    },

    label: {
      type: String,
      default: "",
    },

    inputClass: null,

    inputStyle: null,
  },

  computed: {
    _id() {
      return this.$attrs.id ?? this.name;
    },
  },
};
</script>
