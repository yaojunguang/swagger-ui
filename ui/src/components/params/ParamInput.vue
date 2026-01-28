<template>
  <el-form-item v-if="editable" :prop="formProp" :rules="rules">
    <!-- 整数类型 -->
    <el-input-number
      v-if="paramType === 'integer' || paramType === 'byte'"
      :model-value="modelValue"
      :step="1"
      @update:model-value="handleInput"
    />
    <!-- 数字类型 -->
    <el-input-number
      v-else-if="paramType === 'number'"
      :model-value="modelValue"
      @update:model-value="handleInput"
    />
    <!-- 布尔类型 -->
    <el-select
      v-else-if="paramType === 'boolean'"
      :model-value="modelValue"
      placeholder="请选择"
      @update:model-value="handleInput"
    >
      <el-option value="null" label="--">--</el-option>
      <el-option value="true" label="true">true</el-option>
      <el-option value="false" label="false">false</el-option>
    </el-select>
    <!-- 字符串类型 -->
    <el-input
      v-else
      :model-value="modelValue"
      @update:model-value="handleInput"
    />
  </el-form-item>
  <template v-else>
    {{ defaultValue }}
  </template>
</template>

<script setup>
const props = defineProps({
  // 参数类型
  paramType: {
    type: String,
    default: 'string'
  },
  // 是否可编辑
  editable: {
    type: Boolean,
    default: false
  },
  // 表单属性路径
  formProp: {
    type: String,
    default: ''
  },
  // 验证规则
  rules: {
    type: Array,
    default: () => []
  },
  // 默认值
  defaultValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  // v-model 绑定值
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const handleInput = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>
