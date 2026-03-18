

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_URL: string = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

type HttpOptionsType = RequestInit | { headers: Record<string, any> };

type AppResponse = Record<string, any>;

export type FetchError = {
  statusCode: number;
  message: string;
};

export type AppError = {
  statusCode: number;
  message: string;
  errors?: { message: string; location: string }[];
};

type ApiResponse<ResponseType, ErrorType> = {
  response?: ResponseType;
  error?: ErrorType | FetchError;
};

/**
 * Wrapper around fetch to make it easy to handle errors
 *
 * @param url
 * @param options
 */
export async function httpCall<
  ResponseType = AppResponse,
  ErrorType = AppError,
>(
  url: string,
  options?: HttpOptionsType,
): Promise<ApiResponse<ResponseType, ErrorType>> {
  let statusCode: number = 0;
  try {

    const response = await fetch(`${API_URL}${url}`, {
      credentials: 'include',
      ...options,
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options?.headers ?? {}),
      }),
    });
    statusCode = response.status;

    // @ts-ignore
    const acceptsHtml = options?.headers?.['Accept'] === 'text/html';

    const data = acceptsHtml ? await response.text() : await response.json();

    if (response.ok) {
      return {
        response: data as ResponseType,
        error: undefined,
      };
    }

    // Logout user if token is invalid
    if (data.statusCode === 401) {
      window.location.reload();
      return { response: undefined, error: data as ErrorType };
    }

    if (data.statusCode === 403) {
      // window.location.href = '/forbidden'; // @fixme redirect option should be configurable
      return { response: undefined, error: data as ErrorType };
    }

    return {
      response: undefined,
      error: data as ErrorType,
    };
  } catch (error: any) {
    return {
      response: undefined,
      error: {
        statusCode: statusCode,
        message: error.message,
      },
    };
  }
}

export async function httpPost<
  ResponseType = AppResponse,
  ErrorType = AppError,
>(
  url: string,
  body: Record<string, any>,
  options?: HttpOptionsType,
): Promise<ApiResponse<ResponseType, ErrorType>> {
  return httpCall<ResponseType, ErrorType>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function httpGet<ResponseType = AppResponse, ErrorType = AppError>(
  url: string,
  queryParams?: Record<string, any>,
  options?: HttpOptionsType,
): Promise<ApiResponse<ResponseType, ErrorType>> {
  const searchParams = new URLSearchParams(queryParams).toString();
  const queryUrl = searchParams ? `${url}?${searchParams}` : url;

  return httpCall<ResponseType, ErrorType>(queryUrl, {
    credentials: 'include',
    method: 'GET',
    ...options,
  });
}

export async function httpPatch<
  ResponseType = AppResponse,
  ErrorType = AppError,
>(
  url: string,
  body: Record<string, any>,
  options?: HttpOptionsType,
): Promise<ApiResponse<ResponseType, ErrorType>> {
  return httpCall<ResponseType, ErrorType>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function httpPut<ResponseType = AppResponse, ErrorType = AppError>(
  url: string,
  body: Record<string, any>,
  options?: HttpOptionsType,
): Promise<ApiResponse<ResponseType, ErrorType>> {
  return httpCall<ResponseType, ErrorType>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function httpDelete<
  ResponseType = AppResponse,
  ErrorType = AppError,
>(
  url: string,
  options?: HttpOptionsType,
): Promise<ApiResponse<ResponseType, ErrorType>> {
  return httpCall<ResponseType, ErrorType>(url, {
    ...options,
    method: 'DELETE',
  });
}
