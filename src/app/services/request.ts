import LocalStorage from "../helpers/localstorage";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  headers?: HeadersInit;
  body?: any;
  params?: Record<string, string | number>;
  retry?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API || "http://192.168.1.4:5000/api";

const PUBLIC_PATHS = ["/users/login", "/users/refresh"];

function isPublicApi(url: string) {
  return PUBLIC_PATHS.some((path) => url.startsWith(path));
}

function buildUrl(url: string, params?: Record<string, string | number>) {
  const query = params
    ? "?" + new URLSearchParams(params as any).toString()
    : "";
  return BASE_URL + url + query;
}

async function refreshToken(): Promise<boolean> {
  const authRaw = LocalStorage.JwtToken.get();
  if (!authRaw) return false;

  try {
    const { refresh } = JSON.parse(authRaw);
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (response.status !== 200) throw new Error("Refresh failed");

    const data = await response.json();
    const { token, refresh: newRefresh } = data;

    LocalStorage.JwtToken.add(JSON.stringify({ token, refresh: newRefresh }))
    return true;
  } catch (e) {
    LocalStorage.JwtToken.remove()
    window.location.href = "/login";
    return false;
  }
}

async function request<T = any>(
  url: string,
  {
    method = "GET",
    headers = {},
    body,
    params,
    retry = false,
  }: RequestOptions = {}
): Promise<T> {
  const fullUrl = buildUrl(url, params);

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const authRaw = LocalStorage.JwtToken.get()

  if (!authRaw && !isPublicApi(url)) {
    window.location.href = "/login";
    return Promise.reject("Chưa đăng nhập");
  }

  if (authRaw) {
    try {
      const { token } = JSON.parse(authRaw);
      (config.headers as any).Authorization = `Bearer ${token}`;
    } catch (e) {
    }
  }

  try {
    const response = await fetch(fullUrl, config);

    if (response.ok) {
      const data = await response.json();
      data.statusCode = response.status;
      return data;
    }

    if (response.status === 401 && !retry && !isPublicApi(url)) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return request<T>(url, {
          method,
          headers,
          body,
          params,
          retry: true,
        });
      }
    }

    const errorData = await response.json();
    throw {
      message: errorData?.message || "Lỗi hệ thống",
      status: response.status,
    };
  } catch (error: any) {
    throw error;
  }
}

export const apiRequest = {
  get: <T = any>(url: string, params?: Record<string, any>) =>
    request<T>(url, { method: "GET", params }),

  post: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: "POST", body }),

  put: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: "PUT", body }),

  patch: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: "PATCH", body }),

  delete: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: "DELETE", body }),
};
