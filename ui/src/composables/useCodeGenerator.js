/**
 * 代码示例生成器
 * 生成各种语言的 API 调用代码示例
 */
export function useCodeGenerator() {
  /**
   * 生成 cURL 命令
   * @param {Object} config - 请求配置
   * @returns {string} cURL 命令
   */
  const generateCurl = (config) => {
    const { method, url, headers = {}, data } = config;

    let curl = `curl -X ${method.toUpperCase()} '${url}'`;

    // 添加请求头
    Object.keys(headers).forEach(key => {
      curl += ` \\\n  -H '${key}: ${headers[key]}'`;
    });

    // 添加请求体
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      curl += ` \\\n  -d '${dataStr}'`;
    }

    return curl;
  };

  /**
   * 生成 JavaScript (Axios) 代码
   * @param {Object} config - 请求配置
   * @returns {string} JavaScript 代码
   */
  const generateJavaScript = (config) => {
    const { method, url, headers = {}, data } = config;

    let code = `axios({\n`;
    code += `  method: '${method.toLowerCase()}',\n`;
    code += `  url: '${url}',\n`;

    if (Object.keys(headers).length > 0) {
      code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},\n`;
    }

    if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      code += `  data: ${JSON.stringify(data, null, 4).replace(/\n/g, '\n  ')}\n`;
    }

    code += `})\n`;
    code += `  .then(response => {\n`;
    code += `    console.log(response.data);\n`;
    code += `  })\n`;
    code += `  .catch(error => {\n`;
    code += `    console.error(error);\n`;
    code += `  });`;

    return code;
  };

  /**
   * 生成 Java (OkHttp) 代码
   * @param {Object} config - 请求配置
   * @returns {string} Java 代码
   */
  const generateJava = (config) => {
    const { method, url, headers = {}, data } = config;

    let code = `OkHttpClient client = new OkHttpClient();\n\n`;

    // 构建请求体
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      code += `MediaType mediaType = MediaType.parse("application/json");\n`;
      code += `RequestBody body = RequestBody.create(mediaType, "${dataStr.replace(/"/g, '\\"')}");\n\n`;
    }

    // 构建请求
    code += `Request request = new Request.Builder()\n`;
    code += `  .url("${url}")\n`;
    code += `  .method("${method.toUpperCase()}", ${data ? 'body' : 'null'})\n`;

    // 添加请求头
    Object.keys(headers).forEach(key => {
      code += `  .addHeader("${key}", "${headers[key]}")\n`;
    });

    code += `  .build();\n\n`;

    code += `try {\n`;
    code += `  Response response = client.newCall(request).execute();\n`;
    code += `  System.out.println(response.body().string());\n`;
    code += `} catch (IOException e) {\n`;
    code += `  e.printStackTrace();\n`;
    code += `}`;

    return code;
  };

  /**
   * 生成 Python (Requests) 代码
   * @param {Object} config - 请求配置
   * @returns {string} Python 代码
   */
  const generatePython = (config) => {
    const { method, url, headers = {}, data } = config;

    let code = `import requests\n\n`;
    code += `url = "${url}"\n\n`;

    if (Object.keys(headers).length > 0) {
      code += `headers = ${JSON.stringify(headers, null, 2).replace(/"/g, "'")}\n\n`;
    }

    if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      code += `data = ${JSON.stringify(data, null, 2).replace(/"/g, "'")}\n\n`;
    }

    code += `response = requests.${method.toLowerCase()}(url`;
    if (Object.keys(headers).length > 0) {
      code += `, headers=headers`;
    }
    if (data) {
      code += `, json=data`;
    }
    code += `)\n\n`;
    code += `print(response.json())`;

    return code;
  };

  /**
   * 根据语言类型生成代码
   * @param {string} language - 语言类型 (curl, javascript, java, python)
   * @param {Object} config - 请求配置
   * @returns {string} 生成的代码
   */
  const generateCode = (language, config) => {
    switch (language.toLowerCase()) {
      case 'curl':
        return generateCurl(config);
      case 'javascript':
      case 'js':
        return generateJavaScript(config);
      case 'java':
        return generateJava(config);
      case 'python':
      case 'py':
        return generatePython(config);
      default:
        return '不支持的语言类型';
    }
  };

  return {
    generateCurl,
    generateJavaScript,
    generateJava,
    generatePython,
    generateCode
  };
}
