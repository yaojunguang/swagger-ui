<template>
  <div class="api-menu">
    <el-menu
      :default-active="activeApi"
      class="menu-container"
      @select="handleSelect"
    >
      <el-sub-menu
        v-for="tag in tags"
        :key="tag.name"
        :index="tag.name"
      >
        <template #title>
          <span class="tag-title">{{ tag.name }}</span>
          <span v-if="tag.description" class="tag-description">
            {{ tag.description }}
          </span>
        </template>

        <el-menu-item
          v-for="api in getApisByTag(tag.name)"
          :key="api.path + api.method"
          :index="api.path + '|' + api.method"
        >
          <div class="api-item">
            <el-tag
              :type="getMethodType(api.method)"
              size="small"
              class="method-tag"
            >
              {{ api.method }}
            </el-tag>
            <span class="api-path">{{ api.path }}</span>
            <span v-if="api.summary" class="api-summary">
              {{ api.summary }}
            </span>
          </div>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 标签列表
  tags: {
    type: Array,
    default: () => []
  },
  // API 路径对象
  paths: {
    type: Object,
    default: () => ({})
  },
  // 当前激活的 API
  activeApi: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['select']);

/**
 * 根据标签获取 API 列表
 */
const getApisByTag = (tagName) => {
  const apis = [];
  Object.keys(props.paths).forEach(path => {
    const pathItem = props.paths[path];
    Object.keys(pathItem).forEach(method => {
      const operation = pathItem[method];
      if (operation.tags && operation.tags.includes(tagName)) {
        apis.push({
          path,
          method: method.toUpperCase(),
          summary: operation.summary || '',
          operationId: operation.operationId || ''
        });
      }
    });
  });
  return apis;
};

/**
 * 获取请求方法对应的标签类型
 */
const getMethodType = (method) => {
  const typeMap = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info',
    HEAD: 'info',
    OPTIONS: 'info'
  };
  return typeMap[method.toUpperCase()] || '';
};

/**
 * 处理菜单选择
 */
const handleSelect = (index) => {
  if (index.includes('|')) {
    const [path, method] = index.split('|');
    emit('select', { path, method });
  }
};
</script>

<style scoped>
.api-menu {
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #e4e7ed;
}

.menu-container {
  border-right: none;
}

.tag-title {
  font-weight: bold;
  font-size: 14px;
}

.tag-description {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.api-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.method-tag {
  min-width: 60px;
  text-align: center;
  font-weight: bold;
}

.api-path {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.api-summary {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item) {
  height: auto;
  min-height: 45px;
  line-height: 1.5;
  padding: 8px 20px;
}

:deep(.el-menu-item:hover) {
  background-color: #ecf5ff;
}
</style>
