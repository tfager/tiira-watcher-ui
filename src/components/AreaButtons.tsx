import React, { useState, MouseEvent } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";

const apiUrl = process.env.REACT_APP_WATCHER_API_URL
if (!apiUrl) throw new Error('API URL not defined')

interface SearchResponse {
  status: string

}
async function search(area: string, setSearching: (isSearching: boolean) => void, token: Promise<string|null>) {
	console.log("Would search: " + area)
  setSearching(true)
  try {
    // https://www.bezkoder.com/react-query-axios-typescript/#Define_Data_Type

    let tokenStr = await token
    let result = await axios.post<SearchResponse>(apiUrl + '/search',
      { area: area },
      { headers: {
         'Authorization': `Bearer ${tokenStr}`
      }})
     setSearching(false)
     return result
  } catch (error) {
    console.log("Search call failed", error)
    setSearching(false)
  }
}


type ButtonProps = {
  area: string;
  areaName: string;
};

// https://github.com/piotrwitek/react-redux-typescript-guide#react--redux-in-typescript---complete-guide
const SearchButton = ({ area, areaName }: ButtonProps) => {
    var [searching, setSearching] = useState(false)
    let auth = useAuth()

    return (
      <button disabled = { searching }
              onClick={ (event: MouseEvent) => { search(area, setSearching, auth.getToken()); }} >
              { (searching ? "Searching..." : `Search ${areaName}`) }
              </button>
    )
}

export default function AreaButtons() {

    return (
      <div className="buttonArea">
        <SearchButton area="pks" areaName="PKS" />
      </div>
    )
}