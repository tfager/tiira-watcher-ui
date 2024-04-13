
import { useEffect, useState } from 'react';
import { SearchRequest, fetchSearchRequests } from '../services/SightingService';
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./SearchRequests.css";

const getStatusClass = (status: string) => {
  if (status === "DONE") {
    return "searchreqstatusdone";
  } else if (status === "SEARCHING") {
    return "searchreqstatussearching";
  }
}

export default function SearchRequests() {
  const [searchRequests, setSearchRequests] = useState<SearchRequest[]>([]);
  const user = useAuthState(auth)[0];

  useEffect(() => {
    // Wrap into an async function to be able to return (empty) cleanup function
    (async () => {
      if (user != null) {
        // user (AuthStateHook) ensured to be of type User
        const searchReqs = await fetchSearchRequests(user);
        setSearchRequests(searchReqs);
      }
    })()
    return () => { }
  }, [user]);

  return (
    <div className="searchreqlist">
      {searchRequests.map(request => (
        <div className="searchreqentry" key={request.id}>
          <span className="searchreqts">{new Date(request.timestamp).toLocaleString('fi-FI')}</span>
          <span className="searchreqid">{request.id}</span>
          <span className="searchreqarea">{request.area}</span>
          <span className={"searchreqstatus " + getStatusClass(request.searchStatus)}>{request.searchStatus}</span>
        </div>
      ))}
    </div>
  )
}
