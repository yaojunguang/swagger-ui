<template>
  <div class="api-detail">
    <el-card v-if="apiInfo" shadow="never" class="detail-card">
      <template #header>
        <div class="detail-header">
          <div class="api-title">
            <el-tag
              :type="getMethodType(apiInfo.method)"
              size="large"
              class="method-tag"
            >
              {{ apiInfo.method }}
            </el-tag>
            <span class="api-path">{{ apiInfo.path }}</span>
          </div>
          <el-button
            type="primary"
            :loading="executing"
            @click="handleExecute"
          >
            {{ executing ? '请求中...' : '发送请求' }}
          </el-button>
        </div>
      </template>

      <!-- API 基本信息 -->
      <div class="api-info">
        <h3 v-if="apiInfo.summary" class="info-title">{{ apiInfo.summary }}</h3>
        <p v-if="apiInfo.description" class="info-description">
          {{ apiInfo.description }}
        </p>
        <div v-if="apiInfo.operationId" class="info-item">
          <span class="info-label">Operation ID:</span>
          <span class="info-value">{{ apiInfo.operationId }}</span>
        </div>
      </div>

      <!-- 请求 URL 配置 -->
      <div class="url-config">
        <el-form label-width="100px">
          <el-form-item label="Base URL">
            <el-input
              v-model="baseUrl"
              placeholder="请输入 Base URL"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 参数配置 -->
      <div class="params-section">
        <params
          :parameters="apiInfo.parameters"
          :request-body="apiInfo.requestBody"
          @header-changed="handleHeaderChanged"
          @query-changed="handleQueryChanged"
          @path-changed="handlePathChanged"
          @body-changed="handleBodyChanged"
          @form-data-changed="handleFormDataChanged"
        />
      </div>
    </el-card>

    <el-empty
      v-else
      description="请从左侧菜单选择一个 API"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Params from '@/Params.vue';

const props = defineProps({
  // API 信息
  apiInfo: {
    type: Object,
    default: null
  },
  // 是否执行中
  executing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['execute']);

// Base URL
const baseUrl = ref('');

// 参数数据
const headers = ref({});
const queryParams = ref({});
const pathParams = ref({});
const bodyData = ref(null);
const formData = ref({});

/**
 * 获取请求方法对应的标签类型
 */
const getMethodType = (method) => {
  const typeMap = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info'
  };
  return typeMap[method?.toUpperCase()] || '';
};

/**
 * 处理执行请求
 */
const handleExecute = () => {
  const config = {
    method: props.apiInfo.method,
    baseUrl: baseUrl.value,
    path: props.apiInfo.path,
    headers: headers.value,
    queryParams: queryParams.value,
    pathParams: pathParams.value,
    data: bodyData.value || formData.value
  };
  emit('execute', config);
};

// 参数变化处理
const handleHeaderChanged = (data) => {
  headers.value = data;
};

const handleQueryChanged = (data) => {
  queryParams.value = data;
};

const handlePathChanged = (data) => {
  pathParams.value = data;
};

const handleBodyChanged = (data) => {
  bodyData.value = data;
};

const handleFormDataChanged = (data) => {
  formData.value = data;
};

// 监听 API 变化，重置参数
watch(() => props.apiInfo, () => {
  headers.value = {};
  queryParams.value = {};
  pathParams.value = {};
  bodyData.value = null;
  formData.value = {};
});
</script>

<style scoped>
.api-detail {
  height: 100%;
  overflow-y: auto;
}

.detail-card {
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.api-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.method-tag {
  min-width: 80px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}

.api-path {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: 500;
  word-break: break-all;
}

.api-info {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.info-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 8px;
}

.info-label {
  font-weight: 600;
  color: #606266;
}

.info-value {
  color: #909399;
  font-family: 'Courier New', monospace;
}

.url-config {
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.params-section {
  padding-top: 20px;
}
</style>
