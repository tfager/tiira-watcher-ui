import React, { useEffect, useRef, useState } from 'react';
import AreaButtons from './AreaButtons';
import SearchRequests from './SearchRequests';
import SightingList from './SightingList';
import Map, { MapState } from './Map';
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { fetchSightings, SightingGroup } from "../services/SightingService";

const MainScreen: React.FC = () => {
  const [sightingGroups, setSightingGroups] = useState<SightingGroup[]>()
  const [selectedSightingId, setSelectedSightingId] = useState<string>()
  const childRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

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
      if (user != null) {
        // user (AuthStateHook) ensured to be of type User
        const sGroups = await fetchSightings(user);
        mapRef.current?.setSightingGroups(sGroups);
        setSightingGroups(() => sGroups)
      }
    })()
    return () => { }
  }, [user]);


  return (
    <div>
      <Map ref={mapRef} sightingGroups={sightingGroups} childRefs={childRefs} handleMarkerSelected={handleMarkerSelected} />
      <AreaButtons />
      <SearchRequests />
      <SightingList sightingGroups={sightingGroups} selected={selectedSightingId} childRefs={childRefs} />
    </div>
  );
};

export default MainScreen;
