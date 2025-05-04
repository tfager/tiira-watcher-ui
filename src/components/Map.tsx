import React, { JSX, useEffect, useImperativeHandle, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, CircleMarker } from 'react-leaflet'
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { LatLng, LocationEvent } from "leaflet";
import { SightingGroup } from "../services/SightingService";
import LocationTrace from "./LocationTrace";

interface SightingInfo {
  lat: number;
  long: number;
  id: string;
  count: number;
  text: JSX.Element;
  setSelectedSightingId?: (sg: string) => void | null;
}

// Get location from browser
var located = false;
function LocationMarker() {
  const [position, setPosition] = useState<LatLng>(new LatLng(60.23664, 25.19183))
  const map = useMap()

  useEffect(() => {
    map.locate().on("locationfound", function (e: LocationEvent) {
      if (!located) {
        setPosition(e.latlng)
        map.panTo(e.latlng)
        located = true;
      }
    },
    )
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}

const SightingMarker = ({ id, lat, long, count, text, setSelectedSightingId }: SightingInfo) => {
  function getMarkerRadius(count: number): number {
    var radius = count + 13
    if (radius > 30) radius = 30
    return radius
  }

  function getMarkerColor(count: number): string {
    if (count > 20) count = 20
    const lightness = 5 + count * (75.0 / 20)
    const hue = 120;
    const saturation = 100
    const alpha = 70; // 70% opacity
    const color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha}%)`; // Combine values into HSLA color string
    return color;
  }

  return (
    <CircleMarker
      key={id}
      center={[lat, long]}
      radius={getMarkerRadius(count)}
      fillColor={getMarkerColor(count)}
      fillOpacity={0.8}
      stroke={false}
      eventHandlers={{
        click: () => {
          const parts = id.split('-');
          const sightingId = parts[1] || '';

          if (setSelectedSightingId != null) {
            setSelectedSightingId(sightingId)
          }
        }
      }}>
      <Popup>{text}</Popup>
    </CircleMarker>
  )
}
//    popupString += (sightings[i]["species"] + " " + (sightings[i].date ?? "") + " "  +
//                   (sightings[i].time ?? "") + "\n")

const sightingGroupToMarker = (g: SightingGroup): SightingInfo => {
  var sightings = g.sightings
  var popupContent = (
    <span>
      <span className="popupLoc">
        {sightings[0].locName} <br />
      </span>
      {
        g.sightings.map((s) => {
          return (
            <span key={s.id} id={s.id}>
              {s.species} {s.date ?? ""} {s.time ?? ""}<br />
            </span>
          )
        })
      }
    </span>
  )
  var s: SightingInfo = {
    lat: g["wgsLatitude"],
    long: g["wgsLongitude"],
    id: "marker-" + g.sightings[0].id,
    count: g.sightings.length,
    text: popupContent
  };
  return s;
}

function getSightingMarker({ si, setSelectedSightingId }: {
  si: SightingInfo,
  setSelectedSightingId: (sg: string) => void
}) {
  return (<SightingMarker key={si.id} id={si.id} long={si.long} lat={si.lat} count={si.count} text={si.text} setSelectedSightingId={setSelectedSightingId} />)
}

export type MapState = {
  setSightingGroups(sgs: SightingGroup[]): void;
}

export type MapProps = {
  sightingGroups: SightingGroup[] | undefined,
  childRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>,
  handleMarkerSelected: (id: string) => void
}

// Map is a forwardRef component, so it can be used in a parent component
// See https://articles.wesionary.team/how-to-update-the-internal-state-of-the-child-component-from-the-parent-component-3975a73c12ba

const Map = React.forwardRef<MapState, MapProps>(
  ({ sightingGroups, childRefs, handleMarkerSelected }, ref) => {
    const [sightingMarkers, setSightingMarkers] = useState<SightingInfo[]>([]);
    const [unProcessed, setUnProcessed] = useState<number>(0);
    const [totalSightings, setTotalSightings] = useState<number>(0);
    const processIndex = useRef(0);
    const runId = useRef(0); // Ref to store the current run ID

    const processChunkOfSightings = (sgs: SightingGroup[], currentRunId: number) => {
      // Check if the current runId matches the ref's runId. If not, abort.
      if (currentRunId !== runId.current) {
        console.log("Aborting processChunk because setSightingGroups was called again");
        return;
      }

      const chunkSize = 10; // Adjust chunk size as needed
      const currentChunk = sgs.slice(processIndex.current, processIndex.current + chunkSize);

      if (currentChunk.length > 0) {
        // Transform the chunk to markers
        const newMarkers = currentChunk.map(sightingGroupToMarker);

        // Update state with new markers
        setSightingMarkers((prevMarkers) => [...prevMarkers, ...newMarkers]);
        processIndex.current += chunkSize;
        setUnProcessed(processIndex.current)

        // Use requestAnimationFrame or setTimeout to avoid blocking the UI
        requestAnimationFrame(() => {
          processChunkOfSightings(sgs, currentRunId); // Pass the currentRunId to the next iteration
        });
      } else {
        setUnProcessed(0);
        processIndex.current = 0; // Reset index for next update
      }
    };

    useImperativeHandle(ref, () => ({
      setSightingGroups: (sgs: SightingGroup[]) => {
        // Increment the runId
        runId.current = runId.current + 1;
        const currentRunId = runId.current; // Capture the current runId

        setUnProcessed(sgs.length);
        setTotalSightings(sgs.length);
        setSightingMarkers([]); // Clear existing markers
        processIndex.current = 0; // Reset the index
        processChunkOfSightings(sgs, currentRunId); // Pass the currentRunId to processChunk
      }
    }));

    const progressTxt = `${unProcessed} / ${totalSightings} sightings loaded`
    const markers = sightingMarkers.map((si) => getSightingMarker({ si, setSelectedSightingId: handleMarkerSelected }))
    return (
      <div className="tiiraMap">
        <MapContainer center={[60.23664, 25.19183]} zoom={13} scrollWheelZoom={true}
          style={{ height: "500px", width: "80%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          <LocationTrace />
          {(sightingMarkers.length > 0) && markers}
        </MapContainer>
        {(unProcessed > 0) && <div>{progressTxt}</div>}
      </div>
    )
  })

export default Map;
