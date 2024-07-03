import { LatLng } from "leaflet"
import { _private, TraceEntry } from "./LocationTrace"

describe('addNewEntry', () => {
  it('should add a new entry to the trace', () => {
    const trace: Array<TraceEntry> = []
    const result = _private.addNewEntry(trace, new LatLng(5, 6), new Date(3000))
    expect(result.length).toEqual(1)
    expect(result[0].pos).toEqual(new LatLng(5, 6))
    expect(result[0].timestamp).toEqual(new Date(3000))
  })

  it('should replace last and shift existing when adding more than 15 elements', () => {
    const trace = Array.from({ length: 15 }, (_, i) => ({ pos: new LatLng(i, i), timestamp: new Date(i * 1000), radius: 10 }))
    const result = _private.addNewEntry(trace, new LatLng(16, 16), new Date(16000))
    expect(result.length).toEqual(15)
    expect(trace[0].pos).toEqual(new LatLng(0, 0))
    expect(trace[0].timestamp).toEqual(new Date(0))
    expect(result[0].pos).toEqual(new LatLng(1, 1))
    expect(result[0].timestamp).toEqual(new Date(1000))
    expect(result[14].pos).toEqual(new LatLng(16, 16))
    expect(result[14].timestamp).toEqual(new Date(16000))
  })

  /*
  it('should not add the same element again', () => {
    const trace = [
      { latlng: new LatLng(1, 2), timestamp: new Date(1000) },
      { latlng: new LatLng(3, 4), timestamp: new Date(2000) },
    ]
    const newEntry = { latlng: new LatLng(3, 4), timestamp: new Date(2000) }
    const result = addNewEntry(trace, newEntry)
    expect(result).toEqual([
      { latlng: new LatLng(1, 2), timestamp: new Date(1000) },
      { latlng: new LatLng(3, 4), timestamp: new Date(2000) },
    ])
  })
    */
})
