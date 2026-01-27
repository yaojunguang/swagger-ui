export function getCookie(name) {
    let ret, m;
    if (typeof name === 'string' && name !== '') {
        if ((m = String(document.cookie).match(
            new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
            ret = m[1] ? decodeURIComponent(m[1]) : ''
        }
    }
    return ret
}

export function hasOwnPath(item, path) {
    console.log("path=" + path);
    let paths = path.split(".");
    for (let index = 0; index !== paths.length; index += 1) {
        let subPath = paths[index];
        if (item.hasOwnProperty(subPath)) {
            item = item[subPath]
        } else {
            return false;
        }
    }
    return true;
}