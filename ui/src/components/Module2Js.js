function toJsonType(property) {
    if (property.type === undefined) {
        return property
    }
    switch (property.type) {
        case 'integer':
            return 0;
        case 'number':
            return 0;
        case 'byte':
            return 0;
        case 'string':
            if (property.format === 'date-time') {
                return '0';
            } else if (property.format === 'byte') {
                return '0';
            }
            return '\'\'';
        case 'boolean':
            return 'false';
        case 'array':
            return '[]';
        default:
            return null;
    }
}

export function toJson(module) {
    let code = '{\n';
    for (let name in module.properties) {
        if (module.properties.hasOwnProperty(name)) {
            let property = module.properties[name];
            code += '    //' + property.description + '\n';
            if (property.type === 'array' && property.items.originalRef !== undefined) {
                code += '    ' + name + ':[' + toJsonType(property.items.originalRef) + '],\n'
            } else if (property.type === 'array') {
                code += '    ' + name + ':[' + toJsonType(property.items) + '],\n'
            } else {
                code += '    ' + name + ':' + toJsonType(property) + ',\n'
            }
        }
    }
    code += '\n}';
    return code
}

export function jsCallExample(method) {

    let url = method.path;
    let axiosParam = '';

    if (method.private !== undefined) {
        for (let m = 0; m !== method.private.length; ++m) {
            if (method.private[m].in === 'path') {
                url = url.replace('{' + method.private[m].name + '}', '\\(' + method.private[m].name + ')');
            } else {
                axiosParam += '        ' + method.private[m].name + ': "",//' + (method.private[m].required ? '(*)' : '') + method.private[m].description + '\n';
            }
        }
    }

    let axios = '//' + method["summary"] + '\n';
    if (method.description) {
        axios += '// ' + method.description + '\n'
    }
    axios += 'this.axios({\n';
    axios += "    method: '" + method.method.toUpperCase() + "',\n"
    axios += "    url: `" + method.path + "`,\n"
    if (axiosParam !== '') {
        axios += "    params: {\n"
        axios += axiosParam;
        axios += "    }\n"
    }
    axios += "}).then(res => {\n"
    axios += "    if (res.code === 0) {\n"
    axios += "      //this.$message.success('保存成功');\n"
    axios += "    } else {\n"
    axios += "      //this.$message.error(`保存失败, 错误：${res.message}`);\n"
    axios += "    }\n"
    axios += "}).catch(error => {\n       console.log(error);\n});\n";
    return axios;
}