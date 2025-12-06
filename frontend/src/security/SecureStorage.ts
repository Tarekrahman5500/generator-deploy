import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });
export const secureStorage = {
  set: (key: string, value: string) => ls.set(key, value),
  get: (key: string) => ls.get(key),
  remove: (key: string) => ls.remove(key),
  clear: () => ls.removeAll(),
};
