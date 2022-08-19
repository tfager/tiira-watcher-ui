import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { LatLng, LocationEvent } from "leaflet";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const apiUrl = process.env.REACT_APP_WATCHER_API_URL
if (!apiUrl) throw new Error('API URL not defined')

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
  // TODO.. const user: User = useContext(UserContext)
  const user = useAuthState(auth)[0];

  useEffect( () => {
    const fetchData = async () => {
	  console.log("User = ", user)
	  var token: string = "";
	  if (user != null) {
		  var tokenResult = await user.getIdTokenResult();
		  token = tokenResult.token
		  console.log("Got tokenResult, token = " + token)
	  }
      const result = await axios.get(
        apiUrl + '/sightings',
        { headers: {
		   'Authorization': `Bearer ${token}`
		}},
      );
      setSightingMarkers(() => result.data.sightingGroups.map(sightingGroupToMarker));
    };
 
    fetchData();
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
      </div>
    )
  }

export default Map;
