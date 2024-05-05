import axios from "axios";
import { User } from "firebase/auth";

const apiUrl = process.env.REACT_APP_WATCHER_API_URL
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
  id: string;
  area: string;
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

async function fetchSearchRequests(user: User): Promise<SearchRequest[]> {
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
return result.data.results.sort((a: SearchRequest, b: SearchRequest) => b.timestamp - a.timestamp).slice(0, 3)
}

export { fetchSightings, fetchSearchRequests };
export type { SightingGroup, Sighting, SearchRequest };

