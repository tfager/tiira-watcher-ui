import axios from "axios";
import { User } from "firebase/auth";

const apiUrl = import.meta.env.REACT_APP_WATCHER_API_URL
if (!apiUrl) throw new Error('API URL not defined')


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

interface SearchRequest {
    area?: string;
    center_lon?: number;
    center_lat?: number;
    diag_half_km?: number;
}

interface SearchResponse {
  status: string
}

interface SearchRequestComplete extends SearchRequest {
  id: string;
  timestamp: number;
  searchStatus: string;
  user: string;
}

async function fetchSightings(user: User): Promise<SightingGroup[]> {
  var token: string = "";
  if (user != null) {
    var tokenResult = await user.getIdTokenResult();
    token = tokenResult.token
  }
  const result = await axios.get(
    `${apiUrl}/sightings?daysBefore=2`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  return result.data.sightingGroups
}

async function fetchSearchRequests(user: User): Promise<SearchRequestComplete[]> {
  var token: string = "";
  if (user != null) {
    var tokenResult = await user.getIdTokenResult();
    token = tokenResult.token
  }
  const result = await axios.get(
    `${apiUrl}/search`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
return result.data.results.sort((a: SearchRequestComplete, b: SearchRequestComplete) => b.timestamp - a.timestamp).slice(0, 3)
}

type SearchingFuncType = (searching: boolean) => void;

async function createSearchRequest(req: SearchRequest, setSearching: SearchingFuncType, user: User | null): Promise<SearchResponse | undefined> {
  const txt = `area=${req.area}, center=(${req.center_lat},${req.center_lon}), diag_half_km=${req.diag_half_km}`
  console.log("Would search: " + txt)
  setSearching(true)
  var token: string = "";
  if (user != null) {
    var tokenResult = await user.getIdTokenResult();
    token = tokenResult.token
    try {
      // https://www.bezkoder.com/react-query-axios-typescript/#Define_Data_Type

      let result = await axios.post<SearchResponse>(apiUrl + '/search',
        req,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      setSearching(false)
      return result.data
    } catch (error) {
      console.log("Search call failed", error)
      setSearching(false)
    }
  } else {
    console.log("User not available, cannot create search request")
    setSearching(false)
    return undefined
  }
}

export { fetchSightings, fetchSearchRequests, createSearchRequest };
export type { SightingGroup, Sighting, SearchRequestComplete, SearchRequest, SearchResponse, SearchingFuncType };

