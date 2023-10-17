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

export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function clearCookie(name) {
    const date = new Date();
    date.setTime(date.getTime() - (24 * 60 * 60 * 1000));
    let expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + expires + "; path=/";
}

export function hasOwnPath(item, path) {
    console.log("path=" + path);
    let paths = path.split(".");
    for (let index = 0; index !== paths.length; index += 1) {
        let subPath = paths[index];
        console.log("subPath=" + subPath + "...." + paths[1] + "----" + item.hasOwnProperty(subPath))
        if (item.hasOwnProperty(subPath)) {
            item = item[subPath]
        } else {
            return false;
        }
    }
    return true;
}