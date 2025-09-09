import React, { useEffect, useRef, useState } from 'react';
import AreaButtons from './AreaButtons';
import SearchRequests from './SearchRequests';
import SightingList from './SightingList';
import Map, { MapState } from './Map';
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { fetchSightings, SightingGroup } from "../services/SightingService";
import TrackLocationCheckBox from "./TrackLocationCheckBox";
import CustomSearch from './CustomSearch';

const MainScreen: React.FC = () => {
  const [sightingGroups, setSightingGroups] = useState<SightingGroup[]>()
  const [selectedSightingId, setSelectedSightingId] = useState<string>()
  const childRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [needRefreshSightings, setNeedRefreshSightings] = useState(true)

  const handleMarkerSelected = (id: string) => {
    console.log("Selected sighting " + id)
    setSelectedSightingId(id)
    scrollToChild(id)
  }

  const scrollToChild = (id: string) => {
    const childRef = childRefs.current[id];
    childRef?.scrollIntoView({ behavior: 'smooth' });
  };

  const user = useAuthState(auth)[0];
  const mapRef = useRef<MapState>(null)

  useEffect(() => {
    // Wrap into an async function to be able to return (empty) cleanup function
    (async () => {
      if (user != null && needRefreshSightings) {
        // user (AuthStateHook) ensured to be of type User
        const sGroups = await fetchSightings(user);
        mapRef.current?.setSightingGroups(sGroups);
        setSightingGroups(() => sGroups)
        setNeedRefreshSightings(false)
      }
    })()
    return () => { }
  }, [user, needRefreshSightings]);

  const searchReqsCompletedCallback = () => {
    console.log("Search requests completed, refreshing sightings")
    setNeedRefreshSightings(true)
  }


  return (
    <div>
      <Map key="map" ref={mapRef} sightingGroups={sightingGroups} childRefs={childRefs} handleMarkerSelected={handleMarkerSelected} />
      <AreaButtons key="areabuttons" />
      <CustomSearch key="customsearch" mapRef={mapRef} />
      <TrackLocationCheckBox key="tracklocation" />
      <SearchRequests key="searchrequests" searchReqsCompletedCallback={searchReqsCompletedCallback} />
      <SightingList key="sightinglist" sightingGroups={sightingGroups} selected={selectedSightingId} childRefs={childRefs} />
    </div>
  );
};

export default MainScreen;
