import { LatLng } from "leaflet"
import { _private, TraceEntry } from "./LocationTrace"
import deepFreeze from 'deep-freeze'

describe('addNewEntry', () => {
  it('should add a new entry to the trace', () => {
    const trace: Array<TraceEntry> = []
    deepFreeze(trace)
    const result = _private.addNewEntry(trace, new LatLng(5, 6), new Date(3000))
    expect(result.length).toEqual(1)
    expect(result[0].pos).toEqual(new LatLng(5, 6))
    expect(result[0].timestamp).toEqual(new Date(3000))
  })

  it('should replace last and shift existing when adding more than 15 elements', () => {
    const trace = Array.from({ length: 15 }, (_, i) => ({ pos: new LatLng(i, i), timestamp: new Date(i * 1000), timeRelative: 100 }))
    deepFreeze(trace)
    const result = _private.addNewEntry(trace, new LatLng(16, 16), new Date(16000))
    expect(result.length).toEqual(15)
    expect(trace[0].pos).toEqual(new LatLng(0, 0))
    expect(trace[0].timestamp).toEqual(new Date(0))
    expect(result[0].pos).toEqual(new LatLng(1, 1))
    expect(result[0].timestamp).toEqual(new Date(1000))
    expect(result[14].pos).toEqual(new LatLng(16, 16))
    expect(result[14].timestamp).toEqual(new Date(16000))
  })

  it('should have timeRelative 100 if only 1 entry', () => {
    const trace: Array<TraceEntry> = []
    deepFreeze(trace)
    const result = _private.addNewEntry(trace, new LatLng(1, 2), new Date(1000))
    expect(result[0].timeRelative).toEqual(100)
  })

  it('should have timeRelative values as specified', () => {
    const trace: Array<TraceEntry> = []
    deepFreeze(trace)
    var result = _private.addNewEntry(trace, new LatLng(1, 2), new Date(100000))
    var result = _private.addNewEntry(result, new LatLng(2, 2), new Date(200000))
    var result = _private.addNewEntry(result, new LatLng(3, 2), new Date(300000))
    expect(result[0].timeRelative).toEqual(0)
    expect(result[1].timeRelative).toEqual(50)
    expect(result[2].timeRelative).toEqual(100)
  })

  it('should only update timestamp if same location is added again', () => {
    const trace: Array<TraceEntry> = []
    deepFreeze(trace)
    var result = _private.addNewEntry(trace, new LatLng(1, 2), new Date(1000))
    result = _private.addNewEntry(result, new LatLng(1, 2.000001), new Date(2000))
    expect(result[0].timestamp).toEqual(new Date(2000))
    expect(result[0].pos.lng).toEqual(2)
  })

})
