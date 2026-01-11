import React, { useEffect } from 'react'
import { useTiiraWatcherState, useTiiraWatcherDispatch } from './TiiraWatcherContext'
import { serviceWorkerManager } from '../services/ServiceWorkerService'
import { useAuth } from './AuthProvider'
import { createSearchRequest, SearchRequest } from '../services/SightingService'
import { LatLng } from 'leaflet'

const TrackLocationCheckBox = () => {
  const state = useTiiraWatcherState()
  const dispatch = useTiiraWatcherDispatch()
  const auth = useAuth()

  useEffect(() => {
    // Set up service worker message handlers
    serviceWorkerManager.onMessage('AUTO_STOPPED', (data) => {
      console.log('Service worker auto-stopped:', data.reason)
      dispatch({ type: 'service_worker_auto_stopped' })
    })

    serviceWorkerManager.onMessage('REQUEST_LOCATION', () => {
      // Respond to location request from service worker
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              pos: new LatLng(position.coords.latitude, position.coords.longitude),
              timestamp: new Date()
            }
            
            // Store location for LocationTrace component
            dispatch({ type: 'add_background_location', location })
            
            // Send location to service worker
            serviceWorkerManager.sendLocation(
              position.coords.latitude,
              position.coords.longitude
            )
          },
          (error) => {
            console.error('Error getting location:', error)
          }
        )
      }
    })

    serviceWorkerManager.onMessage('REQUEST_TOKEN_REFRESH', async () => {
      // Refresh token and send to service worker
      if (auth.user) {
        try {
          const token = await auth.user.getIdToken(true); // Force refresh
          serviceWorkerManager.sendMessage({
            type: 'TOKEN_REFRESH',
            token: token
          });
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }
    })

    serviceWorkerManager.onMessage('PERFORM_SEARCH', async (data) => {
      console.log('Performing search via SightingService:', data.searchRequest)
      
      // Use the existing SightingService to perform the search
      if (auth.user) {
        try {
          const result = await createSearchRequest(
            data.searchRequest as SearchRequest,
            () => {}, // No-op for setSearching callback in background
            auth.user
          )
          console.log('Background search completed:', result)
          // The SearchRequests component will automatically pick up the new search
          // via its polling mechanism and fetch results when complete
        } catch (error) {
          console.error('Background search failed:', error)
        }
      }
    })
  }, [dispatch, auth.user])

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Register service worker and start tracking
      const registration = await serviceWorkerManager.register()
      if (registration) {
        dispatch({ type: 'location_polling_started' })
        await serviceWorkerManager.startTracking(auth.user)
      } else {
        console.error('Failed to register service worker')
        event.target.checked = false
      }
    } else {
      // Stop tracking
      dispatch({ type: 'location_polling_stopped' })
      serviceWorkerManager.stopTracking()
    }
  }

  // Update interaction time on any user activity
  useEffect(() => {
    const updateInteraction = () => {
      if (state.serviceWorkerActive) {
        dispatch({ type: 'update_interaction_time' })
        serviceWorkerManager.updateInteraction()
      }
    }

    // Listen for various user interactions
    const events = ['click', 'touchstart', 'keydown', 'scroll']
    events.forEach(event => {
      window.addEventListener(event, updateInteraction)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateInteraction)
      })
    }
  }, [state.serviceWorkerActive, dispatch])

  return (
    <div className='box'>
      <input type="checkbox" name="location_tracking" id="location_tracking" onChange={handleChange} checked={state.locationPollingEnabled} />
      <label htmlFor="location_tracking">Track location</label>
      {state.serviceWorkerActive && <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>(Background tracking active)</span>}
    </div>
  )
}

export default TrackLocationCheckBox
