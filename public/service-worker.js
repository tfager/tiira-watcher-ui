// Service Worker for Tiira Watcher
// Handles background location tracking and continuous searches

const SEARCH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const LOCATION_CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds
const AUTO_STOP_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_REFRESH_INTERVAL_MS = 45 * 60 * 1000; // 45 minutes (tokens expire in 1 hour)
const SEARCH_RADIUS_KM = 3;

let lastInteractionTime = Date.now();
let locationCheckTimer = null;
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
  
  // Start location polling
  if (!locationCheckTimer) {
    locationCheckTimer = setInterval(() => {
      checkLocation();
    }, LOCATION_CHECK_INTERVAL_MS);
    checkLocation(); // Check immediately
  }
  
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
  
  if (locationCheckTimer) {
    clearInterval(locationCheckTimer);
    locationCheckTimer = null;
  }
  
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

function checkLocation() {
  // Service workers don't have direct access to Geolocation API
  // Request location from the main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'REQUEST_LOCATION'
      });
    });
  });
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
  
  if (!currentToken || !currentApiUrl) {
    console.log('[Service Worker] No token or API URL available for search');
    return;
  }
  
  console.log('[Service Worker] Performing search at location:', lastLocation);
  
  const searchRequest = {
    center_lat: lastLocation.lat,
    center_lon: lastLocation.lng,
    diag_half_km: SEARCH_RADIUS_KM
  };
  
  fetch(`${currentApiUrl}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify(searchRequest)
  })
  .then(response => response.json())
  .then(data => {
    console.log('[Service Worker] Search request created:', data);
    
    // Notify the main thread about the search
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SEARCH_COMPLETED',
          data: data
        });
      });
    });
  })
  .catch(error => {
    console.error('[Service Worker] Search request failed:', error);
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
