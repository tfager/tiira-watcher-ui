import React from 'react'
import { useTiiraWatcherState, useTiiraWatcherDispatch } from './TiiraWatcherContext'

const TrackLocationCheckBox = () => {
  const state = useTiiraWatcherState()
  const dispatch = useTiiraWatcherDispatch()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
        dispatch({type: 'location_polling_started'})
    } else {
        dispatch({type: 'location_polling_stopped'})
    }
  }

  return (
    <div className='box'>
        <input type="checkbox" name="location_tracking" id="location_tracking" onChange={handleChange} checked={state.locationPollingEnabled}/>
        <label htmlFor="location_tracking">Track location</label>
    </div>
  )
}

export default TrackLocationCheckBox
