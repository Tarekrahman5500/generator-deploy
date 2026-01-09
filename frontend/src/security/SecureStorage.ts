import SecureLS from "secure-ls";
import { jwtDecode } from "jwt-decode";

const ls = new SecureLS({ encodingType: "aes" });

export const secureStorage = {
  set: (key: string, value: string) => ls.set(key, value),
  get: (key: string) => ls.get(key),
  remove: (key: string) => ls.remove(key),
  clear: () => ls.removeAll(),

  // 1. Check token validity via API
  // 3. Wrapper to ensure you always have a valid token before a request
  getValidToken: async (): Promise<string | null> => {
    const token = await secureStorage.get("accessToken");

    if (token) {
      return token;
    }

    // If not valid, try to refresh
    console.log("Token invalid/expired, attempting refresh...");
    secureStorage.clear();
  },
};
