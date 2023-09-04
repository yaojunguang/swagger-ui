import {toSwiftType} from "components/Module2Swift";

export function toObjectMapper(module) {
    let code = '//\n' +
        '//  ' + module.title + '.swift\n' +
        '//  JO\n' +
        '//\n' +
        '//  Created by yaojunguang\n' +
        '//  Copyright © 2020 JO. All rights reserved.\n' +
        '//\n' +
        '\n' +
        'import UIKit\n' +
        'import ObjectMapper \n' +
        '\n' +
        'class ' + module.title + ': Mappable {';

    let init = '\n    func mapping(map: Map) {';
    for (let name in module.properties) {
        if (module.properties.hasOwnProperty(name)) {
            let property = module.properties[name];
            code += '\n    //' + property.description + '\n';
            if (property.type === 'array' && property.items.originalRef !== undefined) {
                code += '    var ' + name + ': [' + property.items.originalRef + ']!';
                init += '\n        ' + name + ' <- map["' + name + '"]'
            } else if (property.type === 'array') {
                code += '    var ' + name + ': [' + toSwiftType(property.items, false, property.format) + ']!';
                init += '\n        ' + name + ' <- map["' + name + '"]'
            } else {
                code += '    var ' + name + ': ' + toSwiftType(property, true, property.format);
                init += '\n        ' + name + ' <- map["' + name + '"]'
            }
        }
    }
    init += '\n    }';
    code += '\n\n    required init?(map: Map){\n' +
        '    }\n';
    code += init;
    code += '\n}';

    return code
}