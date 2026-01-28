<template>
  <div class="code-example">
    <el-card shadow="never">
      <template #header>
        <div class="code-header">
          <span class="header-title">代码示例</span>
          <el-select
            v-model="selectedLanguage"
            size="small"
            style="width: 150px"
          >
            <el-option label="cURL" value="curl" />
            <el-option label="JavaScript" value="javascript" />
            <el-option label="Java" value="java" />
            <el-option label="Python" value="python" />
          </el-select>
        </div>
      </template>

      <div class="code-container">
        <div class="code-actions">
          <el-button
            size="small"
            @click="copyCode"
          >
            复制代码
          </el-button>
        </div>
        <pre class="code-content"><code>{{ generatedCode }}</code></pre>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useCodeGenerator } from '@/composables/useCodeGenerator';

const props = defineProps({
  // 请求配置
  requestConfig: {
    type: Object,
    default: () => ({})
  }
});

const { generateCode } = useCodeGenerator();

const selectedLanguage = ref('curl');

// 生成的代码
const generatedCode = computed(() => {
  if (!props.requestConfig.url) {
    return '// 请先配置请求参数';
  }
  return generateCode(selectedLanguage.value, props.requestConfig);
});

/**
 * 复制代码
 */
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
    ElMessage.success('已复制到剪贴板');
  } catch (err) {
    ElMessage.error('复制失败');
  }
};
</script>

<style scoped>
.code-example {
  height: 100%;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-weight: bold;
  font-size: 16px;
}

.code-container {
  position: relative;
}

.code-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.code-content {
  margin: 0;
  padding: 20px;
  background-color: #282c34;
  color: #abb2bf;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 500px;
  overflow-y: auto;
}

.code-content code {
  color: inherit;
}
</style>
