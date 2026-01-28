import { ref } from 'vue';
import axios from 'axios';

/**
 * API 执行器
 * 负责执行 API 请求并处理响应
 */
export function useApiExecutor() {
  const executing = ref(false);
  const response = ref(null);
  const error = ref(null);

  /**
   * 构建完整的 URL
   * @param {string} baseUrl - 基础 URL
   * @param {string} path - 路径
   * @param {Object} pathParams - 路径参数
   * @param {Object} queryParams - 查询参数
   * @returns {string} 完整 URL
   */
  const buildUrl = (baseUrl, path, pathParams = {}, queryParams = {}) => {
    let url = baseUrl + path;

    // 替换路径参数
    Object.keys(pathParams).forEach(key => {
      url = url.replace(`{${key}}`, encodeURIComponent(pathParams[key]));
    });

    // 添加查询参数
    const queryString = Object.keys(queryParams)
      .filter(key => queryParams[key] !== undefined && queryParams[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
      .join('&');

    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }

    return url;
  };

  /**
   * 执行 API 请求
   * @param {Object} config - 请求配置
   * @param {string} config.method - 请求方法
   * @param {string} config.url - 请求 URL
   * @param {Object} config.headers - 请求头
   * @param {Object} config.data - 请求体数据
   * @param {Object} config.params - 查询参数
   * @returns {Promise<Object>} 响应数据
   */
  const executeApi = async (config) => {
    executing.value = true;
    error.value = null;
    response.value = null;

    const startTime = Date.now();

    try {
      const axiosConfig = {
        method: config.method.toLowerCase(),
        url: config.url,
        headers: config.headers || {},
        timeout: 30000 // 30秒超时
      };

      // 根据请求方法添加数据
      if (['post', 'put', 'patch'].includes(axiosConfig.method)) {
        if (config.contentType === 'multipart/form-data') {
          // FormData 类型
          const formData = new FormData();
          Object.keys(config.data || {}).forEach(key => {
            formData.append(key, config.data[key]);
          });
          axiosConfig.data = formData;
          axiosConfig.headers['Content-Type'] = 'multipart/form-data';
        } else {
          // JSON 类型
          axiosConfig.data = config.data;
          axiosConfig.headers['Content-Type'] = 'application/json';
        }
      }

      const res = await axios(axiosConfig);
      const endTime = Date.now();

      response.value = {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        data: res.data,
        duration: endTime - startTime
      };

      return response.value;
    } catch (err) {
      const endTime = Date.now();

      error.value = {
        message: err.message || '请求失败',
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        duration: endTime - startTime
      };

      console.error('API 请求失败:', err);
      return null;
    } finally {
      executing.value = false;
    }
  };

  /**
   * 格式化响应数据为 JSON 字符串
   * @param {*} data - 响应数据
   * @returns {string} 格式化后的 JSON 字符串
   */
  const formatResponse = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (err) {
      return String(data);
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    executing.value = false;
    response.value = null;
    error.value = null;
  };

  return {
    executing,
    response,
    error,
    buildUrl,
    executeApi,
    formatResponse,
    reset
  };
}
