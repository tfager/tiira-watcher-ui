import { LatLng, LocationEvent } from "leaflet";
import React, { useEffect, useRef, useState } from "react";
import { CircleMarker, useMap } from 'react-leaflet'
import { useTiiraWatcherState } from "./TiiraWatcherContext";

const MAX_ENTRIES = 15;
const MIN_RADIUS = 10;
const MAX_RADIUS = 30;
const POLL_INTERVAL_SECS = 15;

interface TraceEntry {
    pos: LatLng;
    timestamp: Date;
    radius: number;
}

const addNewEntry = (entries: TraceEntry[], pos: LatLng, timestamp:Date): TraceEntry[] => {
    var tmpEntries = entries.length < MAX_ENTRIES ?
        [...entries, { pos, timestamp, radius: MIN_RADIUS }] :
        [...entries.slice(1), { pos, timestamp, radius: MIN_RADIUS }]
    var radiusInterval = (MAX_RADIUS - MIN_RADIUS) / tmpEntries.length
    // TODO: Change radius/color by time elapsec
    // TODO: Don't add if same location, only update timestamp
    for (var i = 0; i < tmpEntries.length; i++) {
        tmpEntries[i].radius = MIN_RADIUS + (radiusInterval * i);
    }
    return tmpEntries
}

const LocationTrace = ():  JSX.Element => {
    const [entries, setEntries] = useState<TraceEntry[]>([])
    const map = useMap()
    const state = useTiiraWatcherState()
    const timerIdRef = useRef<NodeJS.Timer | null>(null);

    useEffect(() => {
        const pollingCallback = async () => {
            console.log("Getting location")
            map.locate().on("locationfound", function (e: LocationEvent) {
                setEntries(addNewEntry(entries, e.latlng, new Date()))
            }, 5000)
        }

        const startPolling = () => {
            // Polling every POLL_INTERVAL seconds
            if (timerIdRef.current == null) {
              timerIdRef.current = setInterval(pollingCallback, POLL_INTERVAL_SECS * 1000);
              console.log("New location polling timer started, ID " + timerIdRef.current)
            }
        };
      
        const stopPolling = () => {
        if (timerIdRef.current!= null)
            clearInterval(timerIdRef.current);
            timerIdRef.current = null;
            console.log(`Stopped polling with ${timerIdRef}`)
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
    console.log("LocationTrace: ", entries)

    return (
        <div>
            {entries.map((entry, i) => (
                <CircleMarker key={"loctrace"+i} center={entry.pos} radius={entry.radius} />
            ))}
            
        </div>
    )
}

export default LocationTrace;