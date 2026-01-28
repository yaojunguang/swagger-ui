/**
 * localStorage 统一管理
 * 提供类型安全的本地存储操作
 */

const STORAGE_KEYS = {
  SWAGGER_URL: 'swaggerUrl',
  HEADERS: 'headers',
  QUERY_PARAMS: 'queryParams',
  PATH_PARAMS: 'pathParams',
  BODY_PARAMS: 'bodyParams',
  FORM_DATA: 'formData',
  SELECTED_TAG: 'selectedTag',
  SELECTED_API: 'selectedApi'
};

export function useLocalStorage() {
  /**
   * 获取存储的值
   * @param {string} key - 存储键
   * @param {*} defaultValue - 默认值
   * @returns {*} 存储的值或默认值
   */
  const getItem = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`读取 localStorage 失败: ${key}`, error);
      return defaultValue;
    }
  };

  /**
   * 设置存储的值
   * @param {string} key - 存储键
   * @param {*} value - 要存储的值
   */
  const setItem = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`写入 localStorage 失败: ${key}`, error);
    }
  };

  /**
   * 移除存储的值
   * @param {string} key - 存储键
   */
  const removeItem = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`删除 localStorage 失败: ${key}`, error);
    }
  };

  /**
   * 清空所有存储
   */
  const clear = () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('清空 localStorage 失败', error);
    }
  };

  return {
    STORAGE_KEYS,
    getItem,
    setItem,
    removeItem,
    clear
  };
}
