import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { LatLng, LocationEvent } from "leaflet";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import AreaButtons from "./components/AreaButtons"
import SightingList from "./components/SightingList";
import { fetchSightings, SightingInfo, SightingGroup } from "./services/SightingService";

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

const SightingMarker = ({ id, lat, long, text }: SightingInfo) => {
  return (
   <Marker key={ id } position={ [lat, long]}>
    <Popup>{ text }</Popup>
  </Marker>
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
          <span>
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
    text: popupContent
  };
  return s;
}

function SightingMarkers({markers}: { markers: SightingInfo[] | undefined }) {
  return markers === undefined ? null : (
    <>
    { markers.map((si: SightingInfo) => {
        return (<SightingMarker {... si}/>)
    })}
    </>
  )
}

function Map() {
  const [sightingMarkers, setSightingMarkers] = useState<SightingInfo[]>()
  const [sightingGroups, setSightingGroups] = useState<SightingGroup[]>()
  const user = useAuthState(auth)[0];

  useEffect( () => {
    // Wrap into an async function to be able to return (empty) cleanup function
    (async() => {
      if (user != null) {
        // user (AuthStateHook) ensured to be of type User
        const sGroups = await fetchSightings(user);
        // TODO: Feed data from fetchSightings to SightingList as well, maybe ungrouped
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
          <SightingMarkers markers= { sightingMarkers } />
        </MapContainer>
        <AreaButtons />
        <SightingList sightingGroups = { sightingGroups }/>
      </div>
    )
  }

export default Map;
