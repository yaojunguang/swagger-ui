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