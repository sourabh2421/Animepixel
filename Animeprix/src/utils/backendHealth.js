// Backend health check utility
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://animepixel.onrender.com';
const BACKEND_API = String(RAW_BASE_URL).replace(/\/+$/, '').endsWith('/api')
  ? String(RAW_BASE_URL).replace(/\/+$/, '')
  : `${String(RAW_BASE_URL).replace(/\/+$/, '')}/api`;

let healthCheckCache = {
  status: null,
  lastCheck: null,
  cacheDuration: 30000 // 30 seconds
};

export const checkBackendHealth = async () => {
  // Use cache if recent
  const now = Date.now();
  if (healthCheckCache.status !== null && healthCheckCache.lastCheck && 
      (now - healthCheckCache.lastCheck) < healthCheckCache.cacheDuration) {
    return healthCheckCache.status;
  }

  try {
    const response = await fetch(`${BACKEND_API}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    const isHealthy = response.ok;
    healthCheckCache = {
      status: isHealthy,
      lastCheck: now
    };
    return isHealthy;
  } catch (error) {
    console.warn('Backend health check failed:', error.message);
    healthCheckCache = {
      status: false,
      lastCheck: now
    };
    return false;
  }
};

export const isBackendAvailable = () => {
  return healthCheckCache.status === true;
};

