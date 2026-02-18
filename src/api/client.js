const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const messages = {
      404: '소환사를 찾을 수 없습니다.',
      429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      403: 'API 키가 유효하지 않습니다.',
      500: '서버 오류가 발생했습니다.',
    };

    throw new ApiError(
      messages[response.status] || `요청 실패 (${response.status})`,
      response.status,
      data,
    );
  }

  return response.json();
}

export { ApiError };
