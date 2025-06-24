import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  
});

// Flag ca să nu intrăm în buclă infinită
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


export function fetchNotifications() {
  return api.get('notifications/');
}
export function markNotificationRead(id) {
  return api.post(`notifications/${id}/mark_read/`);
}

export function clearReadNotifications() {
  return api.delete('notifications/clear_read/');
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh');

      if (!refreshToken) {
        // Nu avem refresh token, forțăm logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        axios.post('http://localhost:8000/api/token/refresh/', { refresh: refreshToken })
          .then(({ data }) => {
            localStorage.setItem('access', data.access);
            api.defaults.headers.common['Authorization'] = 'Bearer ' + data.access;
            originalRequest.headers['Authorization'] = 'Bearer ' + data.access;
            processQueue(null, data.access);
            resolve(api(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            localStorage.clear();
            window.location.href = '/login';
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
