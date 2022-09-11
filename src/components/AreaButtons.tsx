import React, { useState, MouseEvent } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_WATCHER_API_URL
if (!apiUrl) throw new Error('API URL not defined')

interface SearchResponse {
  status: string

}
async function search(area: string, setSearching: (isSearching: boolean) => void) {
	console.log("Would search: " + area)
  setSearching(true)
  try {
    // https://www.bezkoder.com/react-query-axios-typescript/#Define_Data_Type
    var token = "TODO!"
    await axios.post<SearchResponse>(apiUrl + '/search',
      { headers: {
         'Authorization': `Bearer ${token}`
      }})
  } catch (error) {
    console.log("Search call failed", error)
  }
}


type ButtonProps = {
  area: string;
  areaName: string;
};

// https://github.com/piotrwitek/react-redux-typescript-guide#react--redux-in-typescript---complete-guide
const SearchButton = ({ area, areaName }: ButtonProps) => {
    var [searching, setSearching] = useState(false)

    return (
      <button disabled = { searching }
              onClick={ (event: MouseEvent) => { search(area, setSearching); }} >
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