import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Base URL for API requests
const URL_GATEWAY = process.env.VITE_API_BASE_URL;

// Extend AxiosRequestConfig interface to include custom properties
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    fileFlag?: boolean;
    noTokenFlag?: boolean;
  }
}

// Create Axios instance with default configuration
const instance: AxiosInstance = axios.create({
  baseURL: URL_GATEWAY,
  timeout: 60000,
});

// Set default headers
instance.defaults.headers.common.Accept = 'application/json';
instance.defaults.headers.common['Content-Type'] = 'application/json; charset=UTF-8';

// Variables for token refresh mechanism
const isRefreshing = false;
let failedQueue: any[] = [];

/**
 * Process the queue of failed requests after token refresh
 * @param error - Error object if token refresh failed
 * @param token - New access token if refresh was successful
 */
const processQueue = (error: any, token: null | string = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// /**
//  * Helper that waits until token is ready
//  * @param timeout - timeout of waiting for token, default is 15 seconds
//  * @returns token or null if timeout
//  */
// async function ensureTokenReady(timeout = 15000): Promise<null | string> {
//   return new Promise((resolve, reject) => {
//     const { accessToken, isReady } = getStore().getState();
//     if (isReady) return resolve(accessToken ?? null);

//     const unsub = getStore().subscribe((state) => {
//       if (state.isReady) {
//         clearTimeout(timer);
//         resolve(state.accessToken);
//         unsub(); // stop listening after success
//       }
//     });

//     const timer = setTimeout(() => {
//       unsub?.(); // stop listening after timeout
//       reject(new Error('Token not available within timeout'));
//     }, timeout);
//   });
// }

// Request interceptor
instance.interceptors.request.use(
  async (config) => {
    // Handle file upload requests
    if (config.fileFlag === true) {
      config.headers['Content-Type'] = 'multipart/form-data';
      delete config.fileFlag;
    }
    // Add authorization token to headers
    // const accessToken = await ensureTokenReady();
    // if (accessToken) {
    //   config.headers['Authorization'] = `Bearer ${accessToken}`;
    // }

    return config;
  },
  (error) => Promise.reject(error)
);

// // Response interceptor
// instance.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError<IErrorResponse>) => {
//     const originalRequest = error.config;

//     if (
//       getStore().getState().isLoggedIn &&
//       error?.response?.data?.error?.code === ERROR_CODE.USER_NOT_FOUND
//     ) {
//       const t = getTranslations();
//       getQueryClient().clear();
//       getStore().getState().initAccount();
//       toast.error(
//         t?.('ErrorMessage.your_account_has_been_deleted') || 'Your account has been deleted'
//       );
//       setTimeout(() => {
//         logout('/sign-in');
//       }, 500);
//       return Promise.reject(error);
//     }

//     if (
//       getStore().getState().isLoggedIn &&
//       originalRequest?.headers.Authorization &&
//       (error?.response?.status === HTTP_STATUS_CODE.UNAUTHORIZED ||
//         error?.response?.data?.error?.code === ERROR_CODE.TOKEN_EXPIRED) &&
//       !originalRequest._retry
//     ) {
//       if (isRefreshing) {
//         // If a refresh is already in progress, queue the request
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ reject, resolve });
//         })
//           .then((token) => {
//             originalRequest.headers['Authorization'] = `Bearer ${token}`;
//             return instance(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }
//       originalRequest._retry = true;
//       isRefreshing = true;
//       try {
//         // Attempt to refresh the token
//         const response = await axios.post<IDataResponse<LoginResponse>>(
//           config.apiUrl + '/auth/refresh',
//           {
//             refreshToken: getStore().getState().refreshToken,
//           }
//         );
//         const { accessToken, refreshToken, user } = response.data.data;

//         // update memory state
//         getStore().getState().setAccount({
//           accessToken,
//           isLoggedIn: true,
//           refreshToken,
//           user,
//         });
//         // update session state
//         refresh({
//           accessToken,
//           refreshToken,
//           user,
//         });
//         instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//         // Process queued requests with new token
//         processQueue(null, accessToken);
//         return instance(originalRequest);
//       } catch (refreshError) {
//         const t = getTranslations();
//         // Handle refresh failure
//         processQueue(refreshError, null);
//         getQueryClient().clear();
//         getStore().getState().initAccount();
//         toast.error(
//           t?.('ErrorMessage.token_expired') || 'Your session has expired. Please login again'
//         );
//         setTimeout(() => {
//           logout('/sign-in');
//         }, 500);
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// add a second `options` argument here if you want to pass extra options to each generated query
export const axiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = instance<IDataResponse<T>>({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data.data);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export interface IDataResponse<T = null> {
  data: T;
  error: IErrorResponse | null;
  message: string;
  success: boolean;
}

export interface IErrorResponse {
  error: { code: string; message: string };
  success: boolean;
}

export type IInfiniteDataResponse<T> = {
  limit: number;
  page: number;
  pageCount: number;
  total: number;
} & T;

export interface IParams {
  limit?: number;
  page?: number;
  search?: string;
}

export type BodyType<BodyData> = BodyData;

// In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this
export type ErrorType<Error> = AxiosError<IErrorResponse>;
