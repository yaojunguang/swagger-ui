import { ref, computed } from 'vue';
import axios from 'axios';

/**
 * Swagger 数据管理
 * 负责获取和解析 Swagger 文档
 */
export function useSwaggerData() {
  const swaggerData = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // 计算属性：标签列表
  const tags = computed(() => {
    if (!swaggerData.value?.tags) return [];
    return swaggerData.value.tags;
  });

  // 计算属性：API 路径列表
  const paths = computed(() => {
    if (!swaggerData.value?.paths) return {};
    return swaggerData.value.paths;
  });

  // 计算属性：组件定义
  const components = computed(() => {
    if (!swaggerData.value?.components) return {};
    return swaggerData.value.components;
  });

  /**
   * 获取 Swagger 文档
   * @param {string} url - Swagger 文档 URL
   * @returns {Promise<Object>} Swagger 数据
   */
  const fetchSwaggerData = async (url) => {
    if (!url) {
      error.value = 'Swagger URL 不能为空';
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(url);
      swaggerData.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message || '获取 Swagger 文档失败';
      console.error('获取 Swagger 文档失败:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 根据标签获取 API 列表
   * @param {string} tagName - 标签名称
   * @returns {Array} API 列表
   */
  const getApisByTag = (tagName) => {
    if (!paths.value) return [];

    const apis = [];
    Object.keys(paths.value).forEach(path => {
      const pathItem = paths.value[path];
      Object.keys(pathItem).forEach(method => {
        const operation = pathItem[method];
        if (operation.tags && operation.tags.includes(tagName)) {
          apis.push({
            path,
            method: method.toUpperCase(),
            summary: operation.summary || '',
            description: operation.description || '',
            operationId: operation.operationId || '',
            operation
          });
        }
      });
    });

    return apis;
  };

  /**
   * 解析 Schema 引用
   * @param {Object} schema - Schema 对象
   * @returns {Object} 解析后的 Schema
   */
  const resolveSchema = (schema) => {
    if (!schema) return null;

    // 处理 $ref 引用
    if (schema.$ref) {
      const refPath = schema.$ref.replace('#/components/schemas/', '');
      return components.value.schemas?.[refPath] || null;
    }

    // 处理数组类型
    if (schema.type === 'array' && schema.items) {
      return {
        ...schema,
        items: resolveSchema(schema.items)
      };
    }

    return schema;
  };

  /**
   * 获取请求体 Schema
   * @param {Object} operation - API 操作对象
   * @returns {Object|null} 请求体 Schema
   */
  const getRequestBodySchema = (operation) => {
    if (!operation?.requestBody?.content) return null;

    const contentType = Object.keys(operation.requestBody.content)[0];
    const mediaType = operation.requestBody.content[contentType];

    return mediaType?.schema ? resolveSchema(mediaType.schema) : null;
  };

  /**
   * 获取响应 Schema
   * @param {Object} operation - API 操作对象
   * @param {string} statusCode - 状态码，默认 '200'
   * @returns {Object|null} 响应 Schema
   */
  const getResponseSchema = (operation, statusCode = '200') => {
    if (!operation?.responses?.[statusCode]?.content) return null;

    const contentType = Object.keys(operation.responses[statusCode].content)[0];
    const mediaType = operation.responses[statusCode].content[contentType];

    return mediaType?.schema ? resolveSchema(mediaType.schema) : null;
  };

  return {
    swaggerData,
    loading,
    error,
    tags,
    paths,
    components,
    fetchSwaggerData,
    getApisByTag,
    resolveSchema,
    getRequestBodySchema,
    getResponseSchema
  };
}
