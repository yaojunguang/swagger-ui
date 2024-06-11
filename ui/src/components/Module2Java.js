function toJavaBaseType(property, format) {
    switch (property) {
        case 'integer':
            if (format !== undefined) {
                if (format === 'int64') {
                    return 'Long'
                }
            }
            return 'Integer';
        case 'byte':
            return "Byte";
        case 'number':
            return 'Double';
        case 'string':
            if (format === 'date-time') {
                return 'DateTime';
            } else if (format === 'byte') {
                return 'Byte';
            }
            return 'String';
        case 'boolean':
            return 'Boolean';
        default:
            return property;
    }
}

export function toJavaType(property, format) {
    if (property.type === undefined) {
        return toJavaBaseType(property, format)
    }
    switch (property.type) {
        case 'integer':
            if (format !== undefined) {
                if (format === 'int64') {
                    return 'Long';
                }
            }
            return 'Integer';
        case 'byte':
            return "Byte";
        case 'number':
            return 'Double';
        case 'string':
            if (format === 'date-time') {
                return 'DateTime';
            } else if (format === 'byte') {
                return 'Byte';
            }
            return 'String';
        case 'boolean':
            return 'Boolean';
        case 'array':
            return 'List<' + toJavaType(property.items.originalRef, property.items.format) + '>';
        default:
            return property.type;
    }
}

export function toJava(module) {
    let code =
        '\n\nimport lombok.Data;\n\n' +
        'import java.util.List;\n' +
        '\n' +
        '/**\n' +
        ' * Created by @author yaojunguang\n' +
        ' * Copyright © 2020 JO. All rights reserved.\n' +
        ' */\n' +
        '@Data\n' +
        'public class ' + module.title + ' {';

    for (let name in module.properties) {
        if (module.properties.hasOwnProperty(name)) {
            let property = module.properties[name];
            code += '\n    /**\n' +
                '     *' + property.description +
                '\n     */\n';
            if (property.type === 'array' && property.items.originalRef !== undefined) {
                code += '    private List<' + property.items.originalRef + '> ' + name + ';'
            } else if (property.type === 'array') {
                code += '    private List<' + toJavaType(property.items, property.format) + '> ' + name + ';'
            } else {
                code += '    private ' + toJavaType(property, property.format) + ' ' + name + ';'
            }
        }
    }
    code += '\n}';
    return code
}

export function javaCallExample(method) {
    //swift 调用
    let javaUrl = method.path;
    let javaParam = null;
    if (method.private !== undefined) {
        javaParam = '    Map<String, Object> parameters = new HashMap<>();\n';
        for (let m = 0; m !== method.private.length; ++m) {

            if (method.private[m].in === 'path') {
                javaUrl = javaUrl.replace('{' + method.private[m].name + '}', '\"+' + method.private[m].name + '+\"')
            } else {
                javaParam += '    //' + method.private[m].description + '\n';
                javaParam += '    parameters.put("' + method.private[m].name + '", ' + method.private[m].name + ');\n';
            }
        }
    }
    let javaCode = '//' + method["summary"] + '\n';
    if (method.description) {
        javaCode += '// ' + method.description + '\n'
    }
    javaCode += 'if (NetWorkHelper.isNetworkAvailable(getApplicationContext())) {\n' + (javaParam ? javaParam : '');
    javaCode += '    HttpUtil.getInstance().' + method.method + '(Url.getCollectionUrl(true) + "' + javaUrl + '", ' + (javaParam ? 'parameters' : 'null') + ', new HttpUtil.HttpCallback() {\n' +
        '        @Override\n' +
        '        public void onSuccess(String data) {\n' +
        '            \n' +
        '        }\n' +
        '\n' +
        '        @Override\n' +
        '        public void onError(String msg) {\n' +
        '            super.onError(msg);\n' +
        '            errorResponse(msg);\n' +
        '        }\n' +
        '    }, this);\n' +
        '}';
    return javaCode;
}

export function retrofitCallExample(method) {
    let retrofitParam = '';
    let retrofit = '        /**\n' +
        '         * ' + method["summary"] + '\n';
    if (method.description) {
        retrofit += '         * ' + method.description + '\n'
    }
    retrofit += '         *\n';
    if (method.private !== undefined) {
        for (let m = 0; m !== method.private.length; ++m) {
            retrofit += '         * @param ' + method.private[m].name + ' ' + method.private[m].description + '\n';
            if (method.private[m].in === 'path') {
                retrofitParam += '@Path("' + method.private[m].name + '") ' + toJavaType(method.private[m].type, method.private[m].format) + ' ' + method.private[m].name + ',';
            } else {
                retrofitParam += '@Query("' + method.private[m].name + '") ' + toJavaType(method.private[m].type, method.private[m].format) + ' ' + method.private[m].name + ',';
            }
        }
    }
    retrofit += '         * @return 结果\n         */\n';
    let ref = method["responses"]['200']["content"]["*/*"].schema.originalRef;
    retrofit += '        @' + method.method.toUpperCase() + '("' + method.path + '")\n';
    retrofit += '        Observable<' + (ref.replaceAll('«', '<').replaceAll('»', '>')) + '> ' + method["operationId"] + '('
    if (retrofitParam !== '') {
        retrofit += retrofitParam.substring(0, retrofitParam.length - 1)
    }
    retrofit += ');';
    return retrofit;
}