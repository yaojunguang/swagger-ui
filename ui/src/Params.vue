<template>
  <div class="params-container">
    <!-- Header 参数 -->
    <el-card v-if="hasHeaders" shadow="never" class="param-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">Header 参数</span>
          <el-button
            v-if="!isPublicParams"
            type="primary"
            size="small"
            @click="addHeader"
          >
            添加
          </el-button>
        </div>
      </template>

      <el-form :model="formData" label-width="150px">
        <div
          v-for="(header, index) in headers"
          :key="header.name || index"
          class="param-row"
        >
          <el-form-item :label="header.name">
            <el-input
              v-if="header.editable"
              v-model="header.value"
              :placeholder="header.description || '请输入值'"
              @input="handleHeaderChange"
            />
            <span v-else class="readonly-value">{{ header.value }}</span>
          </el-form-item>

          <el-button
            v-if="header.editable && !isPublicParams"
            type="danger"
            size="small"
            @click="deleteHeader(index)"
          >
            删除
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- Query 参数 -->
    <el-card v-if="hasQueryParams" shadow="never" class="param-card">
      <template #header>
        <span class="header-title">Query 参数</span>
      </template>

      <el-form :model="formData" label-width="150px">
        <el-form-item
          v-for="param in queryParams"
          :key="param.name"
          :label="param.name"
          :required="param.required"
        >
          <param-input
            v-model="param.value"
            :param-type="param.schema?.type || param.type"
            :editable="true"
            :default-value="param.schema?.default"
            @change="handleQueryChange"
          />
          <span v-if="param.description" class="param-description">
            {{ param.description }}
          </span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Path 参数 -->
    <el-card v-if="hasPathParams" shadow="never" class="param-card">
      <template #header>
        <span class="header-title">Path 参数</span>
      </template>

      <el-form :model="formData" label-width="150px">
        <el-form-item
          v-for="param in pathParams"
          :key="param.name"
          :label="param.name"
          :required="param.required"
        >
          <param-input
            v-model="param.value"
            :param-type="param.schema?.type || param.type"
            :editable="true"
            :default-value="param.schema?.default"
            @change="handlePathChange"
          />
          <span v-if="param.description" class="param-description">
            {{ param.description }}
          </span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Body 参数 (JSON) -->
    <el-card v-if="hasBodyParams" shadow="never" class="param-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">Body 参数 (JSON)</span>
          <el-button
            type="primary"
            size="small"
            @click="formatJson"
          >
            格式化
          </el-button>
        </div>
      </template>

      <el-input
        v-model="bodyJson"
        type="textarea"
        :rows="10"
        placeholder="请输入 JSON 格式的请求体"
        @input="handleBodyChange"
      />
    </el-card>

    <!-- FormData 参数 -->
    <el-card v-if="hasFormData" shadow="never" class="param-card">
      <template #header>
        <span class="header-title">FormData 参数</span>
      </template>

      <el-form :model="formData" label-width="150px">
        <el-form-item
          v-for="param in formDataParams"
          :key="param.name"
          :label="param.name"
          :required="param.required"
        >
          <!-- 文件上传 -->
          <el-upload
            v-if="param.schema?.type === 'string' && param.schema?.format === 'binary'"
            :auto-upload="false"
            :on-change="(file) => handleFileChange(param, file)"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
          <!-- 普通输入 -->
          <param-input
            v-else
            v-model="param.value"
            :param-type="param.schema?.type || param.type"
            :editable="true"
            :default-value="param.schema?.default"
            @change="handleFormDataChange"
          />
          <span v-if="param.description" class="param-description">
            {{ param.description }}
          </span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ParamInput from './components/params/ParamInput.vue';

const props = defineProps({
  // 参数配置
  parameters: {
    type: Array,
    default: () => []
  },
  // 请求体配置
  requestBody: {
    type: Object,
    default: () => null
  },
  // 是否为公共参数
  isPublicParams: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'headerChanged',
  'queryChanged',
  'pathChanged',
  'bodyChanged',
  'formDataChanged'
]);

// 表单数据
const formData = ref({});
const bodyJson = ref('');

// 分类参数
const headers = computed(() => {
  return props.parameters
    .filter(p => p.in === 'header')
    .map(p => ({
      ...p,
      value: p.value || p.schema?.default || '',
      editable: p.editable !== false
    }));
});

const queryParams = computed(() => {
  return props.parameters
    .filter(p => p.in === 'query')
    .map(p => ({
      ...p,
      value: p.value || p.schema?.default || ''
    }));
});

const pathParams = computed(() => {
  return props.parameters
    .filter(p => p.in === 'path')
    .map(p => ({
      ...p,
      value: p.value || p.schema?.default || ''
    }));
});

const formDataParams = computed(() => {
  if (!props.requestBody?.content?.['multipart/form-data']) return [];

  const schema = props.requestBody.content['multipart/form-data'].schema;
  if (!schema?.properties) return [];

  return Object.keys(schema.properties).map(key => ({
    name: key,
    schema: schema.properties[key],
    required: schema.required?.includes(key) || false,
    value: '',
    description: schema.properties[key].description || ''
  }));
});

// 判断是否有各类参数
const hasHeaders = computed(() => headers.value.length > 0);
const hasQueryParams = computed(() => queryParams.value.length > 0);
const hasPathParams = computed(() => pathParams.value.length > 0);
const hasFormData = computed(() => formDataParams.value.length > 0);

const hasBodyParams = computed(() => {
  if (!props.requestBody?.content) return false;
  return !!(
    props.requestBody.content['application/json'] ||
    props.requestBody.content['application/*+json']
  );
});

// 初始化 Body JSON
watch(() => props.requestBody, (newVal) => {
  if (newVal?.content?.['application/json']?.schema) {
    const schema = newVal.content['application/json'].schema;
    bodyJson.value = generateDefaultJson(schema);
  }
}, { immediate: true });

/**
 * 根据 Schema 生成默认 JSON
 */
const generateDefaultJson = (schema) => {
  if (!schema) return '{}';

  const obj = {};
  if (schema.properties) {
    Object.keys(schema.properties).forEach(key => {
      const prop = schema.properties[key];
      if (prop.default !== undefined) {
        obj[key] = prop.default;
      } else if (prop.type === 'string') {
        obj[key] = '';
      } else if (prop.type === 'number' || prop.type === 'integer') {
        obj[key] = 0;
      } else if (prop.type === 'boolean') {
        obj[key] = false;
      } else if (prop.type === 'array') {
        obj[key] = [];
      } else if (prop.type === 'object') {
        obj[key] = {};
      }
    });
  }

  return JSON.stringify(obj, null, 2);
};

/**
 * 格式化 JSON
 */
const formatJson = () => {
  try {
    const parsed = JSON.parse(bodyJson.value);
    bodyJson.value = JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.error('JSON 格式错误:', error);
  }
};

/**
 * 添加 Header
 */
const addHeader = () => {
  const newHeader = {
    name: '',
    value: '',
    editable: true,
    in: 'header'
  };
  headers.value.push(newHeader);
  handleHeaderChange();
};

/**
 * 删除 Header
 */
const deleteHeader = (index) => {
  headers.value.splice(index, 1);
  handleHeaderChange();
};

/**
 * Header 变化处理
 */
const handleHeaderChange = () => {
  const headerObj = {};
  headers.value.forEach(h => {
    if (h.name && h.value) {
      headerObj[h.name] = h.value;
    }
  });
  emit('headerChanged', headerObj);
};

/**
 * Query 参数变化处理
 */
const handleQueryChange = () => {
  const queryObj = {};
  queryParams.value.forEach(p => {
    if (p.value !== undefined && p.value !== '') {
      queryObj[p.name] = p.value;
    }
  });
  emit('queryChanged', queryObj);
};

/**
 * Path 参数变化处理
 */
const handlePathChange = () => {
  const pathObj = {};
  pathParams.value.forEach(p => {
    if (p.value !== undefined && p.value !== '') {
      pathObj[p.name] = p.value;
    }
  });
  emit('pathChanged', pathObj);
};

/**
 * Body 参数变化处理
 */
const handleBodyChange = () => {
  try {
    const parsed = JSON.parse(bodyJson.value);
    emit('bodyChanged', parsed);
  } catch (error) {
    // JSON 格式错误时不触发事件
    console.warn('JSON 格式错误，等待用户修正');
  }
};

/**
 * FormData 参数变化处理
 */
const handleFormDataChange = () => {
  const formDataObj = {};
  formDataParams.value.forEach(p => {
    if (p.value !== undefined && p.value !== '') {
      formDataObj[p.name] = p.value;
    }
  });
  emit('formDataChanged', formDataObj);
};

/**
 * 文件变化处理
 */
const handleFileChange = (param, file) => {
  param.value = file.raw;
  handleFormDataChange();
};
</script>

<style scoped>
.params-container {
  padding: 20px;
}

.param-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-weight: bold;
  font-size: 16px;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.param-description {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.readonly-value {
  color: #606266;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
