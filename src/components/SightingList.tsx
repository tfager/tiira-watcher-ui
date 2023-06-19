import React, { MutableRefObject, useRef } from "react";
import { SightingGroup, Sighting } from "../services/SightingService";

function constructGoogleMapsDirectionsLink(name: string, latitude: number, longitude: number): string {
  const encName = encodeURIComponent(name)
  const link = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_name=${encName}`;
  return link;
}

const SightingListEntry = React.forwardRef<HTMLDivElement, { sightingGroup: SightingGroup, isSelected: boolean }>((props, ref) => {
  const { sightingGroup, isSelected } = props
  const mapSighting = (s: Sighting) => {
    return (
      <span> {s.id} {s.date} {s.species} {s.count} {s.extra}<br /></span>
    )
  }
  const selClassName = (isSelected ? "sightinggroupsel" : "")
  const link = constructGoogleMapsDirectionsLink(sightingGroup.locName, sightingGroup.wgsLatitude, sightingGroup.wgsLongitude)

  return (
    <span className={selClassName} ref={ref}>
      <span className="sightinggrouptxt">
        {sightingGroup.locName}
      </span>
      <span>
        &nbsp; <a href={link} target="_blank" rel="noreferrer">Directions</a>
      </span>
      <br />
      {sightingGroup.sightings.map(mapSighting)}
    </span>
  )

})

export default function SightingList({ sightingGroups, selected, childRefs }:
  { sightingGroups: SightingGroup[] | undefined, selected: string | undefined, childRefs: MutableRefObject<{ [key: string]: HTMLDivElement | null }> }) {

  if (sightingGroups == null) {
    return (
      <div className="sightinglist">
        Waiting for sightings
      </div>
    )

  } else {
    var sGroupSpans = sightingGroups.map((sgroup, index) => {
      const groupId = sgroup.sightings[0].id
      return (
        <SightingListEntry sightingGroup={sgroup}
          isSelected={selected === groupId}
          key={`sighting-entry-${groupId}`}
          ref={(el) => { childRefs.current[groupId] = el }}
        />)
    })

    return (
      <div className="sightinglist">
        {sGroupSpans}
      </div>
    )
  }
}