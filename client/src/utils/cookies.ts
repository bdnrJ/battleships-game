

export const setCookie = (name: string, value: any, days = 7, path = "/") => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const cookieOptions = `expires=${expires}; path=${path}; SameSite=Strict`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions}`;
};

export const getCookie = (name: string) => {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, "");

};

export const deleteCookie = (name: string, path: string) => {
    setCookie(name, "", -1, path);
};
