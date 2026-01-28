function toArkTsBaseType(property, format) {
    switch (property) {
        case 'integer':
            if (format !== undefined) {
                if (format === 'int64') {
                    return 'Long'
                }
            }
            return 'number';
        case 'byte':
            return "number";
        case 'number':
            return 'number';
        case 'string':
            if (format === 'date-time') {
                return 'number';
            } else if (format === 'byte') {
                return 'number';
            }
            return 'string';
        case 'boolean':
            return 'boolean';
        default:
            return property;
    }
}

function toArkTsType(property) {
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
                return 0;
            } else if (property.format === 'byte') {
                return 0;
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

export function toArkTs(module) {
    let code = '{\n';
    for (let name in module.properties) {
        if (module.properties.hasOwnProperty(name)) {
            let property = module.properties[name];
            code += '    //' + property.description + '\n';
            if (property.type === 'array' && property.items.originalRef !== undefined) {
                code += '    ' + name + ':[' + toArkTsBaseType(property.items.originalRef) + '] = [],\n'
            } else if (property.type === 'array') {
                code += '    ' + name + ':[' + toArkTsBaseType(property.items) + '] = [],\n'
            } else {
                code += '    ' + name + ':' + toArkTsBaseType(property.type,property.format) + ' = '+toArkTsType(property)+',\n'
            }
        }
    }
    code += '\n}';
    return code
}

export function arkTsCallExample(method) {
    //swift 调用
    let javaUrl = method.path;
    let javaParam = null;
    if (method.private !== undefined) {
        javaParam = '    const params: Record<string, string | number> = {\n';
        for (let m = 0; m !== method.private.length; ++m) {

            if (method.private[m].in === 'path') {
                javaUrl = javaUrl.replace('{' + method.private[m].name + '}', '\"+' + method.private[m].name + '+\"')
            } else {
                javaParam += '      \"' + method.private[m].name + '\":' + method.private[m].name + ',//' + method.private[m].description + '\n';
            }
        }
        javaParam+='    }\n'
    }
    let javaCode =javaParam??'';
    javaCode += '    //' + method["summary"] + '\n';
    if (method.description) {
        javaCode += '    // ' + method.description + '\n'
    }
    let ref = method["responses"]['200']["content"]["*/*"].schema.originalRef;
    javaCode +=`    const res = await HttpUtils.${method.method}<${ref}>('${javaUrl}'`+(javaParam?`, params)\n`:`)\n`)
    javaCode +='    if (res.code == 0 && res.data) {\n' +
        '    }'
    return javaCode;
}