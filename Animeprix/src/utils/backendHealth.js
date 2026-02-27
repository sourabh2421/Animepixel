// Backend health check utility
const BACKEND_API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

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

