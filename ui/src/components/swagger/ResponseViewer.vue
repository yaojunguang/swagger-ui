<template>
  <div class="response-viewer">
    <el-card shadow="never">
      <template #header>
        <div class="response-header">
          <span class="header-title">响应结果</span>
          <div class="response-info">
            <el-tag v-if="response" :type="getStatusType(response.status)">
              {{ response.status }} {{ response.statusText }}
            </el-tag>
            <span v-if="response" class="duration">
              耗时: {{ response.duration }}ms
            </span>
          </div>
        </div>
      </template>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>请求中...</span>
      </div>

      <!-- 错误信息 -->
      <el-alert
        v-else-if="error"
        type="error"
        :title="error.message"
        :closable="false"
        show-icon
      >
        <template v-if="error.data">
          <pre class="error-detail">{{ formatJson(error.data) }}</pre>
        </template>
      </el-alert>

      <!-- 响应内容 -->
      <div v-else-if="response" class="response-content">
        <!-- 响应头 -->
        <el-collapse v-if="response.headers" class="response-section">
          <el-collapse-item title="响应头" name="headers">
            <div class="headers-list">
              <div
                v-for="(value, key) in response.headers"
                :key="key"
                class="header-item"
              >
                <span class="header-key">{{ key }}:</span>
                <span class="header-value">{{ value }}</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>

        <!-- 响应体 -->
        <div class="response-body">
          <div class="body-header">
            <span class="body-title">响应体</span>
            <el-button
              size="small"
              @click="copyResponse"
            >
              复制
            </el-button>
          </div>
          <pre class="body-content">{{ formatJson(response.data) }}</pre>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else
        description="点击「发送请求」按钮执行 API"
      />
    </el-card>
  </div>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 响应数据
  response: {
    type: Object,
    default: null
  },
  // 错误信息
  error: {
    type: Object,
    default: null
  }
});

/**
 * 格式化 JSON
 */
const formatJson = (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (err) {
    return String(data);
  }
};

/**
 * 获取状态码对应的标签类型
 */
const getStatusType = (status) => {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'info';
  if (status >= 400 && status < 500) return 'warning';
  if (status >= 500) return 'danger';
  return '';
};

/**
 * 复制响应内容
 */
const copyResponse = async () => {
  try {
    const text = formatJson(props.response.data);
    await navigator.clipboard.writeText(text);
    ElMessage.success('已复制到剪贴板');
  } catch (err) {
    ElMessage.error('复制失败');
  }
};
</script>

<style scoped>
.response-viewer {
  height: 100%;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-weight: bold;
  font-size: 16px;
}

.response-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.duration {
  font-size: 14px;
  color: #909399;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
}

.loading-container .el-icon {
  font-size: 32px;
  color: #409eff;
}

.error-detail {
  margin-top: 10px;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.response-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.response-section {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.headers-list {
  padding: 10px;
}

.header-item {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

.header-key {
  font-weight: bold;
  color: #606266;
  min-width: 150px;
}

.header-value {
  color: #909399;
  word-break: break-all;
}

.response-body {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.body-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.body-title {
  font-weight: bold;
  font-size: 14px;
}

.body-content {
  padding: 16px;
  margin: 0;
  background-color: #fafafa;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 500px;
  overflow-y: auto;
}
</style>
