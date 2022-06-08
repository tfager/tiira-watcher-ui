import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword, logout } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { LatLng, LocationEvent } from "leaflet";
import { JsxElement } from "typescript";

interface SightingInfo {
  lat: number;
  long: number;
  id: string;
  text: JSX.Element;
}

interface Sighting {
  id: string;
  species: string;
  wgsLatitude: number;
  wgsLongitude: number;
  date: string;
  time?: string;
  extra?: string;
  county: string;
  locName: string;
  birdLatitude?: number;
  birdLongitude?: number;
  count: string;
  osmUrl: string;
  spotterLatitude: number;
  spotterLongitude: number;
  timestamp: number;
}

interface SightingGroup {
  locName: string;
  wgsLatitude: number;
  wgsLongitude: number;
  spotterLatitude: number;
  spotterLongitude: number;
  birdLatitude?: number;
  birdLongitude?: number;
  sightings: Sighting[];
}

// "locName":"saunakallio.","spotterLatitude":6675565.0,"spotterLongitude":390491.0,"birdLatitude":6675555.0,
// "birdLongitude":390487.0,"wgsLatitude":60.20208,"wgsLongitude":25.02436

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
var located = false;
function LocationMarker() {
    const [position, setPosition] = useState<LatLng>(new LatLng(60.23664, 25.19183))
    const map = useMap()

    useEffect(() => {
      map.locate().on("locationfound", function (e : LocationEvent) {
        if (!located) {
          console.log("Panning to user location "+ e.latlng);
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
  const [sightingMarkers, setSightingMarkers] = useState<SightingInfo[]>();
 
  useEffect(() => {
    const fetchData = async () => {
      // TODO: URL from env var
      const result = await axios(
        'http://localhost:8080/sightings',
      );
 
      setSightingMarkers(() => result.data.sightingGroups.map(sightingGroupToMarker));
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
          <SightingMarkers markers= { sightingMarkers } />
        </MapContainer>
      </div>
    )
  }

export default Map;
