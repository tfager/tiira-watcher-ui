// Service Worker for Tiira Watcher
// Handles background location tracking and continuous searches

const SEARCH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const LOCATION_CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds - minimum interval between location updates
const AUTO_STOP_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_REFRESH_INTERVAL_MS = 45 * 60 * 1000; // 45 minutes (tokens expire in 1 hour)
const SEARCH_RADIUS_KM = 3;

let lastInteractionTime = Date.now();
let searchTimer = null;
let autoStopTimer = null;
let tokenRefreshTimer = null;
let lastLocation = null;
let currentApiUrl = null;
let currentToken = null;

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'START_TRACKING') {
    startTracking(event.data.apiUrl, event.data.token, event.data.userId);
  } else if (event.data.type === 'STOP_TRACKING') {
    stopTracking();
  } else if (event.data.type === 'UPDATE_INTERACTION') {
    updateInteractionTime();
  } else if (event.data.type === 'LOCATION_UPDATE') {
    lastLocation = event.data.location;
    console.log('[Service Worker] Location updated:', lastLocation);
  } else if (event.data.type === 'TOKEN_REFRESH') {
    currentToken = event.data.token;
    console.log('[Service Worker] Token refreshed');
  }
});

function startTracking(apiUrl, token, userId) {
  console.log('[Service Worker] Starting tracking');
  lastInteractionTime = Date.now();
  currentApiUrl = apiUrl;
  currentToken = token;
  
  // Start watchPosition on the main thread (only send message once, not on a timer)
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'START_WATCH_POSITION'
      });
    });
  });
  
  // Start search interval
  if (!searchTimer) {
    searchTimer = setInterval(() => {
      performSearch();
    }, SEARCH_INTERVAL_MS);
    performSearch(); // Search immediately
  }
  
  // Start auto-stop timer
  if (!autoStopTimer) {
    autoStopTimer = setInterval(() => {
      checkAutoStop();
    }, 60 * 1000); // Check every minute
  }
  
  // Start token refresh timer
  if (!tokenRefreshTimer) {
    tokenRefreshTimer = setInterval(() => {
      requestTokenRefresh();
    }, TOKEN_REFRESH_INTERVAL_MS);
  }
}

function stopTracking() {
  console.log('[Service Worker] Stopping tracking');
  
  // Stop watchPosition on the main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'STOP_WATCH_POSITION'
      });
    });
  });
  
  if (searchTimer) {
    clearInterval(searchTimer);
    searchTimer = null;
  }
  
  if (autoStopTimer) {
    clearInterval(autoStopTimer);
    autoStopTimer = null;
  }
  
  if (tokenRefreshTimer) {
    clearInterval(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  
  lastLocation = null;
  currentToken = null;
  currentApiUrl = null;
}
}

function updateInteractionTime() {
  lastInteractionTime = Date.now();
  console.log('[Service Worker] Interaction time updated');
}

function checkAutoStop() {
  const timeSinceLastInteraction = Date.now() - lastInteractionTime;
  
  if (timeSinceLastInteraction >= AUTO_STOP_TIMEOUT_MS) {
    console.log('[Service Worker] Auto-stopping due to inactivity');
    stopTracking();
    
    // Notify the main thread
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'AUTO_STOPPED',
          reason: 'Inactivity timeout (1 hour)'
        });
      });
    });
  }
}

function requestTokenRefresh() {
  // Request a fresh token from the main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'REQUEST_TOKEN_REFRESH'
      });
    });
  });
}

function performSearch() {
  if (!lastLocation) {
    console.log('[Service Worker] No location available for search');
    return;
  }
  
  console.log('[Service Worker] Performing search at location:', lastLocation);
  
  // Request main thread to perform search using SightingService
  const searchRequest = {
    center_lat: lastLocation.lat,
    center_lon: lastLocation.lng,
    diag_half_km: SEARCH_RADIUS_KM
  };
  
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PERFORM_SEARCH',
        searchRequest: searchRequest
      });
    });
  });
}

// Service Worker installation
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing');
  self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating');
  event.waitUntil(self.clients.claim());
});
