import React, { useState, MouseEvent } from "react";
import { useAuth } from "./AuthProvider";
import { createSearchRequest, SearchRequest, SearchResponse, SearchingFuncType } from "../services/SightingService";

const apiUrl = import.meta.env.REACT_APP_WATCHER_API_URL
if (!apiUrl) throw new Error('API URL not defined')

const AREAS = new Map<string, string>()
AREAS.set("tikkurila", "Tikkurila")
AREAS.set("vuosaari", "Vuosaari")
AREAS.set("espoo", "Espoo")
AREAS.set("kirkkonummi", "Kirkkonummi")
AREAS.set("laajasalo", "Laajasalo")
AREAS.set("viikki", "Viikki")
AREAS.set("itauusimaa", "Itä-Uusimaa")
AREAS.set("pks", "Pääkaupunkiseutu")
AREAS.set("pori", "Pori")
AREAS.set("uto", "Utö")
AREAS.set("virolahti", "Virolahti")

type ButtonProps = {
  area: string;
  areaName: string;
};

const SearchButton = ({ area, areaName }: ButtonProps) => {
  var [searching, setSearching] = useState(false)
  let auth = useAuth()

  return (
    <button disabled={searching}
      onClick={(event: MouseEvent) => {
        let req: SearchRequest = { area: area }
        createSearchRequest(req, setSearching, auth.user); }} >
      {(searching ? "Searching..." : `Search ${areaName}`)}
    </button>
  )
}

export default function AreaButtons() {
  return (
    <div className="buttonArea box">
      {Array.from(AREAS.keys()).map((area) => {
        return (<SearchButton key={area} area={area} areaName={AREAS.get(area)!} />)
      })
      }
    </div>
  )
}