
import { useEffect, useRef, useState } from 'react';
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

export default function SearchRequests({searchReqsCompletedCallback}: {searchReqsCompletedCallback: () => void}) {
  const [searchRequests, setSearchRequests] = useState<SearchRequest[]>([]);
  const user = useAuthState(auth)[0];
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);

  useEffect(() => {
    // Wrap into an async function to be able to return (empty) cleanup function
    // Polling: https://medium.com/@atulbanwar/efficient-polling-in-react-5f8c51c8fb1a
    const pollingCallback = async () => {
      if (user != null) {
        // user (AuthStateHook) ensured to be of type User
        console.log("Getting search requests")
        const searchReqs = await fetchSearchRequests(user);
        setSearchRequests(searchReqs);
        // Will be true also of array is empty
        var allDone = searchReqs.every(req => req.searchStatus === "DONE");
        if (allDone) {
          setIsPollingEnabled(false);
          console.log("End polling for search requests ("+ searchReqs.length + " requests)");
          searchReqsCompletedCallback();
        }
      }
    }

    const startPolling = () => {
      // Polling every 10 seconds
      if (timerIdRef.current == null) {
        timerIdRef.current = setInterval(pollingCallback, 10000);
        console.log("New search request polling timer started, ID " + timerIdRef.current)
      }
    };

    const stopPolling = () => {
      if (timerIdRef.current!= null)
        clearInterval(timerIdRef.current);
      timerIdRef.current = null;
      console.log(`Stopped polling with ${timerIdRef}`)
    };

    if (isPollingEnabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      console.log("Clean up function called")
      stopPolling();
    };
  },
    [user, isPollingEnabled, searchReqsCompletedCallback]);

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
