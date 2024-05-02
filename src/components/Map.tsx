import React, { useEffect, useImperativeHandle, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, CircleMarker } from 'react-leaflet'
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { LatLng, LocationEvent } from "leaflet";
import { SightingGroup } from "../services/SightingService";

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
          console.log("About to setSelectedSightingId: " + sightingId)

          if (setSelectedSightingId != null) {
            setSelectedSightingId(sightingId)
            console.log("setSelectedSightingId: " + sightingId)
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

function SightingMarkers({ markers, setSelectedSightingId }: {
  markers: SightingInfo[] | undefined,
  setSelectedSightingId: (sg: string) => void
}) {
  return markers === undefined ? null : (
    <>
      {markers.map((si: SightingInfo) => {
        return (<SightingMarker key={si.id} id={si.id} long={si.long} lat={si.lat} count={si.count} text={si.text} setSelectedSightingId={setSelectedSightingId} />)
      })}
    </>
  )
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
  ({sightingGroups, childRefs, handleMarkerSelected}, ref) => {
    const [sightingMarkers, setSightingMarkers] = useState<SightingInfo[]>()

    useImperativeHandle(ref, () => ({
      setSightingGroups: (sgs: SightingGroup[]) => {
        setSightingMarkers(() => sgs.map(sightingGroupToMarker))
      }
    }));

    return (
      <div className="tiiraMap">
        <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true}
          style={{ height: "500px", width: "80%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          <SightingMarkers markers={sightingMarkers} setSelectedSightingId={(id) => handleMarkerSelected(id)} />
        </MapContainer>
      </div>
    )
  })

export default Map;
