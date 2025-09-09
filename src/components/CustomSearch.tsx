import React, { useState, MouseEvent } from "react";
import { useAuth } from "./AuthProvider";
import { MapState } from "./Map";
import { createSearchRequest, SearchRequest, SearchResponse, SearchingFuncType } from "../services/SightingService";
import { User } from "firebase/auth"

const CustomSearchButton = ({ km, mapRef, createSearchRequest }: {
  km : number,
  mapRef: React.RefObject<MapState>,
  createSearchRequest: (req: SearchRequest, setSearching: SearchingFuncType, user: User | null) => Promise<SearchResponse | undefined>
}) => {
  var [searching, setSearching] = useState(false)
  let auth = useAuth()
  return (
    <button disabled={searching}
      onClick={(event: MouseEvent) => {
        if (mapRef.current) {
            const center = mapRef.current.getMapCenter()
            if (!center) {
              console.log("Map center not available")
              return
            }
            const req: SearchRequest = {
              area: undefined,
              center_lon: center!.lng,
              center_lat: center!.lat,
              diag_half_km: km }
            console.log(`About to search ${km} km, req: `, req)

            createSearchRequest(req, setSearching, auth.user);
        }}}>
      {(searching ? "Searching..." : `${km} km`) }
    </button>
  )
}

export default function CustomSearch( { mapRef }: { mapRef: React.RefObject<MapState> } ) {
  return (
    <div className="box">
        <span>Search at map center: 
        {Array.from([3, 10, 50].map((km) => {
          return (<CustomSearchButton key={"custom_search_"+ km } km={km} mapRef={mapRef} createSearchRequest={ createSearchRequest} />)
        }))}
        </span>
    </div>
  )
}