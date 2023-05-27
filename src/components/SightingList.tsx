import React from "react";
import { SightingGroup, Sighting } from "../services/SightingService";

export default function SightingList({sightingGroups}: {sightingGroups: SightingGroup[] | undefined}) {
	if (sightingGroups == null) {
		return (
			<div className="sightinglist">
				Waiting for sightings
			</div>
			)
	
	} else {
		const mapSighting = ( s: Sighting ) => {
			return (
				<span className="sightingtext"> { s.id } { s.date } { s.species } { s.count } { s.extra }<br /></span>
			)
		}
		var sGroupSpans = sightingGroups.map( sgroup => (
			<span>
				<span className="sightinggrouptxt">
					{ sgroup.locName } <br />
				</span>
				{ sgroup.sightings.map(mapSighting)}
			</span>
		))
		return (
		<div className="sightinglist">
			{ sGroupSpans }
		</div>
		)
	}
}