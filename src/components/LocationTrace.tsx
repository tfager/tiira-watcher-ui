import { LatLng, LocationEvent } from "leaflet"
import React, { JSX, useEffect, useRef, useState } from "react"
import { CircleMarker, useMap } from 'react-leaflet'
import { useTiiraWatcherState } from "./TiiraWatcherContext"

const MAX_ENTRIES = 15
const POLL_INTERVAL_SECS = 30
const SAME_LOC_LATLNG_THRESHOLD = 0.00001
const RADIUS = 5


export interface TraceEntry {
    pos: LatLng
    timestamp: Date
    timeRelative: number  // 0 for earliest, 100 for most recent
}

const addNewEntry = (entries: TraceEntry[], pos: LatLng, timestamp:Date): TraceEntry[] => {
    // Don't add if same location again, only update timestamp
    var sameLoc = false
    var tmpEntries: TraceEntry[] = []
    if (entries.length > 0) {
        const mostRecent = entries[entries.length - 1]
        if (Math.abs(pos.lat - mostRecent.pos.lat) < SAME_LOC_LATLNG_THRESHOLD &&
            Math.abs(pos.lng - mostRecent.pos.lng) < SAME_LOC_LATLNG_THRESHOLD) {
            tmpEntries = [...entries]
            tmpEntries[tmpEntries.length - 1].timestamp = timestamp
            sameLoc = true
        }
    }
    // If MAX_ENTRIES is exceeded, first one is discarded and last one becomes the new
    if (!sameLoc) {
        tmpEntries = entries.length < MAX_ENTRIES ?
            [...entries, { pos, timestamp, timeRelative: 100 }] :
            [...entries.slice(1), { pos, timestamp, timeRelative: 100 }]
    }
        
    var minTime = tmpEntries[0].timestamp.valueOf()
    var maxTime = tmpEntries[tmpEntries.length - 1].timestamp.valueOf()
    var timeDiff = maxTime - minTime
    for (var i = 0; i < tmpEntries.length; i++) {
        tmpEntries[i] = {
            ...tmpEntries[i],
            timeRelative: (100 * (tmpEntries[i].timestamp.valueOf() - minTime)) / timeDiff
        }
    }
    if (tmpEntries.length === 1) {
        tmpEntries[0] = {
            ...tmpEntries[0],
            timeRelative: 100
        }
    }
    return tmpEntries
}

// For unit testing
export const _private = {
    addNewEntry
}

const LocationTrace = ():  JSX.Element => {
    const [entries, setEntries] = useState<TraceEntry[]>([])
    const map = useMap()
    const state = useTiiraWatcherState()
    const timerIdRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const pollingCallback = async () => {
            map.locate().on("locationfound", function (e: LocationEvent) {
                setEntries(addNewEntry(entries, e.latlng, new Date()))
            }, 5000)
        }

        const startPolling = () => {
            // Polling every POLL_INTERVAL seconds
            if (timerIdRef.current == null) {
              timerIdRef.current = setInterval(pollingCallback, POLL_INTERVAL_SECS * 1000);
            }
        };
      
        const stopPolling = () => {
        if (timerIdRef.current!= null)
            clearInterval(timerIdRef.current);
            timerIdRef.current = null;
        };
    
        if (state.locationPollingEnabled) {
            startPolling();
        } else {
            stopPolling();
        }
    
        return () => {
            stopPolling()
        }
    }, [entries, map, timerIdRef, state.locationPollingEnabled])
    // Mind https://stackoverflow.com/questions/67148553/react-leaflet-polyline-does-not-change-colour-despite-colour-value-in-redux-sto:
    // Use pathOptions, not just color/opacity.
    return (
        <div>
            {entries.map((entry, i) => (
                <CircleMarker key={"loctrace"+entry.timestamp.valueOf()}
                              center={entry.pos}
                              radius={RADIUS}
                              color="rgb(255,0,0)"
                              pathOptions={ {opacity: 0.4 + 0.006*entry.timeRelative} }/>
            ))}
            
        </div>
    )
}

export default LocationTrace;