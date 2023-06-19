import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, CircleMarker } from 'react-leaflet'
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { LatLng, LocationEvent } from "leaflet";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import AreaButtons from "./components/AreaButtons"
import SightingList from "./components/SightingList";
import { fetchSightings, SightingGroup } from "./services/SightingService";

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
      map.locate().on("locationfound", function (e : LocationEvent) {
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
      return color;    }

  return (
   <CircleMarker
       key={ id }
       center={ [lat, long]}
       radius={ getMarkerRadius(count)}
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
        }}}>
    <Popup>{ text }</Popup>
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
      { sightings[0].locName } <br/>
    </span>
    {
      g.sightings.map((s) => {
        return (
          <span id = { s.id }>
            { s.species } { s.date ?? "" } { s.time ?? ""}<br/>
          </span>
      )})
    }
    </span>
  )
  var s : SightingInfo = {
    lat: g["wgsLatitude"],
    long: g["wgsLongitude"],
    id: "marker-" + g.sightings[0].id,
    count: g.sightings.length,
    text: popupContent
  };
  return s;
}

function SightingMarkers({markers, setSelectedSightingId }: {
    markers: SightingInfo[] | undefined,
    setSelectedSightingId: (sg: string) => void }) {
  return markers === undefined ? null : (
    <>
    { markers.map((si: SightingInfo) => {
        return (<SightingMarker id = {si.id} long={si.long} lat={si.lat} count={si.count} text={si.text} setSelectedSightingId={setSelectedSightingId} />)
    })}
    </>
  )
}

function Map() {
  const [sightingMarkers, setSightingMarkers] = useState<SightingInfo[]>()
  const [sightingGroups, setSightingGroups] = useState<SightingGroup[]>()
  const [selectedSightingId, setSelectedSightingId] = useState<string>()
  const childRefs = useRef<{[key: string]: HTMLDivElement | null}>({})

  const user = useAuthState(auth)[0];

  const handleMarkerSelected = (id: string) => {
    console.log("Selected sighting " + id)
    setSelectedSightingId(id)
    scrollToChild(id)
  }

  const scrollToChild = (id: string) => {
		const childRef = childRefs.current[id];
		childRef?.scrollIntoView({ behavior: 'smooth' });
	};


  useEffect( () => {
    // Wrap into an async function to be able to return (empty) cleanup function
    (async() => {
      if (user != null) {
        // user (AuthStateHook) ensured to be of type User
        const sGroups = await fetchSightings(user);
        setSightingMarkers(() => sGroups.map(sightingGroupToMarker))
        setSightingGroups(() => sGroups)
      }
    })()
    return () => {}
  }, [user]);

    return (
      <div className="tiiraMap">
        <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true}
          style={{ height: "500px", width: "80%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          <SightingMarkers markers = { sightingMarkers } setSelectedSightingId = { (id) => handleMarkerSelected(id) }/>
        </MapContainer>
        <AreaButtons />
        <SightingList sightingGroups = { sightingGroups } selected = { selectedSightingId } childRefs = { childRefs }/>
      </div>
    )
  }

export default Map;
