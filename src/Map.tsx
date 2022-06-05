import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword, logout } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { LatLng, LocationEvent } from "leaflet";

interface SightingInfo {
  lat: number;
  long: number;
  id: string;
  text: string;
}

const testSightings = {
  "sightings": [{
    "wgs-latitude": 60.23362, "date": "26.-29.5.2022", "species": "Satakieli",
    "extra": "Ä", "county": "Helsinki", "loc-name": "Oulunkylän liikuntapuisto Käskynhaltijantie.",
    "id": "26016122", "bird-latitude": 6679170.0, "count": "1", "osm-url": "https://www.openstreetmap.org/#map=17/60.23362/24.96311",
    "spotter-longitude": 387201.0, "wgs-longitude": 24.96311,
    "bird-longitude": 387201.0, "timestamp": 1653814993894, "spotter-latitude": 6679170.0
  },
  {
    "wgs-latitude": 60.23664, "date": "27.-28.5.2022", "species": "Punavarpunen", "extra": "Ä", "county": "Helsinki",
    "loc-name": "Talosaari, Bruksviken.", "id": "26000075", "bird-latitude": 6679137.0, "count": "1",
    "osm-url": "https://www.openstreetmap.org/#map=17/60.23664/25.19183", "spotter-longitude": 399639.0,
    "wgs-longitude": 25.19183, "bird-longitude": 399874.0, "timestamp": 1653814993894, "spotter-latitude": 6679313.0
  }]}

// Get location from browser
function LocationMarker() {
    const [position, setPosition] = useState<LatLng>(new LatLng(60.23664, 25.19183))
    const map = useMap()

    useEffect(() => {
      map.locate().on("locationfound", function (e : LocationEvent) {
        setPosition(e.latlng)
        map.panTo(e.latlng)
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

// TODO: Clean up sightings & add more TS
function SightingMarkers(props: any) {
  console.log("Props = ", props)
  return props.sightingGroups === undefined ? null : (
    <>
    { props.sightingGroups.map((g: any) => {
        var popupString = ""
        var sightings = g.sightings
        for (var i=0; i<sightings.length; i++) {
          popupString += (sightings[i]["species"] + " " + sightings[i]["time"] + "<br>\n")
        }
        var s : SightingInfo = {
          lat: g["wgs-latitude"],
          long: g["wgs-longitude"],
          id: "marker-" + g.sightings[0].id,
          text: popupString
        };
        return (<SightingMarker {...s}/>)
    })}
    </>
  )
}


function Map() {
  const [sightingGroups, setSightingGroups] = useState();
 
  useEffect(() => {
    const fetchData = async () => {
      // TODO: proper API call
      const result = await axios(
        'http://localhost:8080/sightings',
      );
 
      setSightingGroups(() => result.data["sighting-groups"]);
    };
 
    fetchData();
  }, []);

    return (
      <div className="tiiraMap">
        <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true}
          style={{ height: "500px", width: "80%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          <SightingMarkers sightingGroups= { sightingGroups } />
        </MapContainer>
      </div>
    )
  }

export default Map;
