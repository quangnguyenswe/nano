import Cookies from "js-cookie";

const defaultOptions: Cookies.CookieAttributes = {
  path: "/",
  expires: 1,
  sameSite: "lax",
  secure: true,
  domain: window.location.hostname,
};

export const cookieStore = {
  get: (name: string) => {
    const value = Cookies.get(name);
    return value ? { name, value } : undefined;
  },
  set: (
    name: string,
    value: string,
    options: Cookies.CookieAttributes = defaultOptions,
  ) => {
    Cookies.set(name, value, options);
  },
  remove: (
    name: string,
    options: Cookies.CookieAttributes = defaultOptions,
  ) => {
    Cookies.remove(name, options);
  },
};
