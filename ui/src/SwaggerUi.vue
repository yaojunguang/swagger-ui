<template>
  <div class="swagger-ui" v-loading="loading">
    <!-- 顶部工具栏 -->
    <el-header class="header">
      <div class="header-content">
        <h1 class="title">
          {{ swaggerInfo.title }}
          <span v-if="swaggerInfo.version" class="version">{{ swaggerInfo.version }}</span>
        </h1>
        <div class="toolbar">
          <el-input
            v-model="swaggerUrl"
            placeholder="请输入 Swagger 文档 URL"
            style="width: 400px"
            clearable
          >
            <template #append>
              <el-button @click="loadSwagger" :loading="loading">
                加载
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-header>

    <!-- 主体内容 -->
    <el-container v-if="swaggerData" class="main-container">
      <!-- 左侧菜单 -->
      <el-aside :width="leftWidth + 'px'" class="menu-aside">
        <api-menu
          :tags="tags"
          :paths="paths"
          :active-api="activeApiKey"
          @select="handleApiSelect"
        />
      </el-aside>

      <!-- 拖拽分隔条 -->
      <div class="resize-bar" @mousedown="handleResizeStart" />

      <!-- 右侧内容区 -->
      <el-container class="content-container">
        <!-- 标签页 -->
        <el-tabs
          v-if="openedApis.length > 0"
          v-model="activeApiKey"
          type="card"
          closable
          class="api-tabs"
          @tab-remove="handleTabRemove"
        >
          <el-tab-pane
            v-for="api in openedApis"
            :key="api.key"
            :name="api.key"
            :label="api.path"
          >
            <el-row :gutter="20" class="content-row">
              <!-- 左侧：API 详情和参数 -->
              <el-col :span="12">
                <api-detail
                  :api-info="api"
                  :executing="api.executing"
                  @execute="handleExecute"
                />
              </el-col>

              <!-- 右侧：响应和代码示例 -->
              <el-col :span="12">
                <el-tabs v-model="api.rightTab" class="right-tabs">
                  <!-- 响应结果 -->
                  <el-tab-pane label="响应" name="response">
                    <response-viewer
                      :loading="api.executing"
                      :response="api.response"
                      :error="api.error"
                    />
                  </el-tab-pane>

                  <!-- 代码示例 -->
                  <el-tab-pane label="代码示例" name="code">
                    <code-example :request-config="api.requestConfig" />
                  </el-tab-pane>
                </el-tabs>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>

        <!-- 空状态 -->
        <el-empty
          v-else
          description="请从左侧菜单选择一个 API"
          class="empty-state"
        />
      </el-container>
    </el-container>

    <!-- 未加载状态 -->
    <el-empty
      v-else-if="!loading"
      description="请输入 Swagger 文档 URL 并点击加载"
      class="empty-state"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import ApiMenu from './components/swagger/ApiMenu.vue';
import ApiDetail from './components/swagger/ApiDetail.vue';
import ResponseViewer from './components/swagger/ResponseViewer.vue';
import CodeExample from './components/swagger/CodeExample.vue';
import { useSwaggerData } from './composables/useSwaggerData';
import { useApiExecutor } from './composables/useApiExecutor';
import { useLocalStorage } from './composables/useLocalStorage';

// Composables
const { swaggerData, loading, tags, paths, fetchSwaggerData, getApisByTag } = useSwaggerData();
const { executeApi, buildUrl } = useApiExecutor();
const { getItem, setItem, STORAGE_KEYS } = useLocalStorage();

// 状态
const swaggerUrl = ref('/v3/api-docs/swagger-config');
const leftWidth = ref(300);
const activeApiKey = ref('');
const openedApis = ref([]);
const resizing = ref(false);

// 计算属性
const swaggerInfo = computed(() => {
  return {
    title: swaggerData.value?.info?.title || 'Swagger UI',
    version: swaggerData.value?.info?.version || ''
  };
});

/**
 * 加载 Swagger 文档
 */
const loadSwagger = async () => {
  if (!swaggerUrl.value) {
    ElMessage.warning('请输入 Swagger 文档 URL');
    return;
  }

  const data = await fetchSwaggerData(swaggerUrl.value);
  if (data) {
    ElMessage.success('Swagger 文档加载成功');
    setItem(STORAGE_KEYS.SWAGGER_URL, swaggerUrl.value);
    // 清空已打开的标签页
    openedApis.value = [];
    activeApiKey.value = '';
  } else {
    ElMessage.error('Swagger 文档加载失败');
  }
};

/**
 * 处理 API 选择
 */
const handleApiSelect = ({ path, method }) => {
  const key = `${path}|${method}`;

  // 检查是否已打开
  const existingApi = openedApis.value.find(api => api.key === key);
  if (existingApi) {
    activeApiKey.value = key;
    return;
  }

  // 获取 API 详细信息
  const pathItem = paths.value[path];
  const operation = pathItem[method.toLowerCase()];

  // 创建新的 API 标签页
  const newApi = {
    key,
    path,
    method: method.toUpperCase(),
    summary: operation.summary || '',
    description: operation.description || '',
    operationId: operation.operationId || '',
    parameters: operation.parameters || [],
    requestBody: operation.requestBody || null,
    responses: operation.responses || {},
    executing: false,
    response: null,
    error: null,
    rightTab: 'response',
    requestConfig: {}
  };

  openedApis.value.push(newApi);
  activeApiKey.value = key;
};

/**
 * 处理标签页关闭
 */
const handleTabRemove = (targetKey) => {
  const index = openedApis.value.findIndex(api => api.key === targetKey);
  if (index === -1) return;

  openedApis.value.splice(index, 1);

  // 如果关闭的是当前标签页，切换到相邻标签页
  if (activeApiKey.value === targetKey) {
    if (openedApis.value.length > 0) {
      const newIndex = index > 0 ? index - 1 : 0;
      activeApiKey.value = openedApis.value[newIndex].key;
    } else {
      activeApiKey.value = '';
    }
  }
};

/**
 * 处理执行 API
 */
const handleExecute = async (config) => {
  const currentApi = openedApis.value.find(api => api.key === activeApiKey.value);
  if (!currentApi) return;

  // 构建完整 URL
  const fullUrl = buildUrl(
    config.baseUrl,
    config.path,
    config.pathParams,
    config.queryParams
  );

  // 保存请求配置用于代码示例
  currentApi.requestConfig = {
    method: config.method,
    url: fullUrl,
    headers: config.headers,
    data: config.data
  };

  // 执行请求
  currentApi.executing = true;
  currentApi.response = null;
  currentApi.error = null;

  const result = await executeApi(currentApi.requestConfig);

  currentApi.executing = false;

  if (result) {
    currentApi.response = result;
    currentApi.rightTab = 'response';
    ElMessage.success('请求执行成功');
  } else {
    currentApi.error = {
      message: '请求执行失败',
      data: null
    };
    ElMessage.error('请求执行失败');
  }
};

/**
 * 处理拖拽调整左侧宽度
 */
const handleResizeStart = (e) => {
  resizing.value = true;
  const startX = e.clientX;
  const startWidth = leftWidth.value;

  const handleMouseMove = (moveEvent) => {
    if (!resizing.value) return;
    const deltaX = moveEvent.clientX - startX;
    const newWidth = startWidth + deltaX;

    // 限制宽度范围
    if (newWidth >= 200 && newWidth <= 600) {
      leftWidth.value = newWidth;
    }
  };

  const handleMouseUp = () => {
    resizing.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// 初始化
onMounted(() => {
  // 从 localStorage 恢复 URL
  const savedUrl = getItem(STORAGE_KEYS.SWAGGER_URL);
  if (savedUrl) {
    swaggerUrl.value = savedUrl;
    loadSwagger();
  }
});
</script>

<style scoped>
.swagger-ui {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  height: 70px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.version {
  margin-left: 12px;
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-container {
  flex: 1;
  overflow: hidden;
}

.menu-aside {
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
  transition: width 0.1s;
}

.resize-bar {
  width: 6px;
  background-color: #e4e7ed;
  cursor: col-resize;
  transition: background-color 0.2s;
}

.resize-bar:hover {
  background-color: #409eff;
}

.content-container {
  flex: 1;
  overflow: hidden;
  background-color: #f5f7fa;
}

.api-tabs {
  height: 100%;
}

:deep(.api-tabs .el-tabs__content) {
  height: calc(100% - 55px);
  overflow: auto;
  padding: 20px;
}

.content-row {
  height: 100%;
}

.right-tabs {
  height: 100%;
}

:deep(.right-tabs .el-tabs__content) {
  height: calc(100% - 55px);
  overflow: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-row .el-col {
    width: 100% !important;
    margin-bottom: 20px;
  }
}
</style>
