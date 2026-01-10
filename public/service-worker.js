// Service Worker for Tiira Watcher
// Handles background location tracking and continuous searches

const SEARCH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const LOCATION_CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds
const AUTO_STOP_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const SEARCH_RADIUS_KM = 3;

let lastInteractionTime = Date.now();
let locationCheckTimer = null;
let searchTimer = null;
let autoStopTimer = null;
let lastLocation = null;

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'START_TRACKING') {
    startTracking(event.data.apiUrl, event.data.token, event.data.userId);
  } else if (event.data.type === 'STOP_TRACKING') {
    stopTracking();
  } else if (event.data.type === 'UPDATE_INTERACTION') {
    updateInteractionTime();
  }
});

function startTracking(apiUrl, token, userId) {
  console.log('[Service Worker] Starting tracking');
  lastInteractionTime = Date.now();
  
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
      performSearch(apiUrl, token);
    }, SEARCH_INTERVAL_MS);
    performSearch(apiUrl, token); // Search immediately
  }
  
  // Start auto-stop timer
  if (!autoStopTimer) {
    autoStopTimer = setInterval(() => {
      checkAutoStop();
    }, 60 * 1000); // Check every minute
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
  
  lastLocation = null;
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
  // Note: Service workers don't have direct access to Geolocation API
  // We need to request location from the main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'REQUEST_LOCATION'
      });
    });
  });
}

function performSearch(apiUrl, token) {
  if (!lastLocation) {
    console.log('[Service Worker] No location available for search');
    return;
  }
  
  console.log('[Service Worker] Performing search at location:', lastLocation);
  
  const searchRequest = {
    center_lat: lastLocation.lat,
    center_lon: lastLocation.lng,
    diag_half_km: SEARCH_RADIUS_KM
  };
  
  fetch(`${apiUrl}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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

// Listen for location updates from the main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'LOCATION_UPDATE') {
    lastLocation = event.data.location;
    console.log('[Service Worker] Location updated:', lastLocation);
  }
});

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
