export function toSwiftJson(module) {
    let code = '//\n' +
        '//  ' + module.title + '.swift\n' +
        '//  JO\n' +
        '//\n' +
        '//  Created by yaojunguang\n' +
        '//  Copyright © 2020 JO. All rights reserved.\n' +
        '//\n' +
        '\n' +
        'import UIKit\n' +
        'import SwiftyJSON \n' +
        '\n' +
        'class ' + module.title + ' {';

    let init = '\n\n    init(json: JSON) {';
    for (let name in module.properties) {
        if (module.properties.hasOwnProperty(name)) {
            let property = module.properties[name];
            code += '\n    //' + property.description + '\n';
            if (property.type === 'array' && property.items.originalRef !== undefined) {
                code += '    var ' + name + ': [' + property.items.originalRef + ']!';
                init += '\n       ' + name + ' = json["' + name + '"].arrayValue.map({ (json) -> ' + property.items.originalRef + ' in\n' +
                    '            return ' + property.items.originalRef + '(json: json)\n' +
                    '       })'
            } else if (property.type === 'array') {
                code += '    var ' + name + ': [' + toSwiftType(property.items, false, property.format) + ']!';
                init += '\n       ' + name + ' = json["' + name + '"].arrayObject as! [' + toSwiftType(property.items, false, property.format) + ']'
                //
            } else {
                code += '    var ' + name + ': ' + toSwiftType(property, true, property.format);
                init += '\n       ' + name + ' = json["' + name + '"]' + toSwiftJsonValue(property.type, property.format)
            }
        }
    }
    init += '\n    }';
    code += init;
    code += '\n}';

    return code
}

export function toSwiftJsonValue(type, format) {
    switch (type) {
        case 'integer':
            if (format !== undefined) {
                if (format === 'int64') {
                    return '.int64Value';
                }
            }
            return '.intValue';
        case 'byte':
            return ".int8Value";
        case 'number':
            return '.doubleValue';
        case 'string':
            if (format === 'date-time') {
                return '.int64Value';
            } else if (format === 'byte') {
                return '.int8Value';
            }
            return '.stringValue';
        case 'boolean':
            return '.boolValue';
        default:
            return ''
    }
}

export function toSwiftType(property, init, format) {
    if (property.type === undefined) {
        return property
    }
    switch (property.type) {
        case 'integer':
            if (format !== undefined) {
                if (format === 'int64') {
                    return 'Int64' + (init ? ' = 0' : '');
                }
            }
            return 'Int' + (init ? ' = 0' : '');
        case 'byte':
            return 'Int8' + (init ? ' = 0' : '');
        case 'number':
            return 'Double' + (init ? ' = 0.0' : '');
        case 'string':
            if (format === 'date-time') {
                return 'Int64' + (init ? ' = 0' : '');
            } else if (format === 'byte') {
                return 'Int8' + (init ? ' = 0' : '');
            }
            return 'String' + (init ? ' = ""' : '');
        case 'boolean':
            return 'Bool' + (init ? ' = false' : '');
        case 'array':
            return '[' + toSwiftType(property.items.originalRef, false, property.items.format) + ']';
        default:
            return property.type + '!';
    }
}

export function swiftCallExample(method) {
    let url = method.path;
    let comment = '    /// ' + method["summary"] + '\n';
    if (method.description) {
        comment += '    /// ' + method.description + '\n';
    }
    comment += '    ///\n    /// - Parameters:';
    let funStr = '    class func ' + method["operationId"] + '(';
    let req = '';
    if (method.private !== undefined) {
        for (let m = 0; m !== method.private.length; ++m) {
            comment += '\n    ///   - ' + method.private[m].name + ': ' + method.private[m].description;
            funStr += '_ ' + method.private[m].name + ':' + toSwiftType(method.private[m], false, method.private[m].format);
            if (method.private[m].required) {
                funStr += ','
            } else {
                funStr += '!,'
            }

            if (method.private[m].in === 'path') {
                url = url.replace('{' + method.private[m].name + '}', '\\(' + method.private[m].name + ')');
            } else {
                req += '"' + method.private[m].name + '":' + method.private[m].name + ','
            }
        }
    }

    let entity;
    let ref = method["responses"]['200']["content"]["*/*"].schema.originalRef;
    let index = ref.indexOf('«');
    let arr = false;
    if (ref.startsWith('RespEntity«List«')) {
        entity = ref.substring('RespEntity«List«'.length, ref.indexOf('»'));
        arr = true
    } else if (ref.startsWith('RespEntity«')) {
        entity = ref.substring('RespEntity«'.length, ref.indexOf('»'));
    } else if (index > 0) {
        entity = ref.substring(0, index);
    } else {
        entity = ref;
    }

    if (arr) {
        funStr += '/*imgData: [Data]?,*/_ callback:(([' + entity + ']?) -> Void)?){\n'
    } else {
        funStr += '/*imgData: [Data]?,*/_ callback:((' + entity + '?) -> Void)?){\n'
    }

    if (req !== '') {
        req = req.substring(0, req.length - 1);
        funStr += '        let req:[String:Any]=[' + req + ']\n';
        funStr += '        request(url: "' + url + '", method: .' + method.method + ', params: req/*, imgData*/) { (code, message, jsonString) in\n'
    } else {
        funStr += '        request(url: "' + url + '", method: .' + method.method + ', params: nil/*, imgData*/) { (code, message, jsonString) in\n'
    }

    funStr += '            DispatchQueue.main.async(){\n' +
        '                if code == 0,let json = jsonString {\n';
    if (arr) {
        funStr += '                    callback?(Mapper<' + entity + '>().mapArray(JSONString:json))\n'
    } else {
        funStr += '                    callback?(Mapper<' + entity + '>().map(JSONString:json))\n'
    }
    funStr += '                }else{\n' +
        '                    callback?(nil)\n' +
        '                }\n' +
        '            }\n' +
        '        }\n' +
        '    }';
    return comment + '\n' + funStr;
}