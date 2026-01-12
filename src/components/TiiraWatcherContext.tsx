import React, { JSX, createContext, useContext, useReducer } from "react";
import { LatLng } from "leaflet";

const initialState = (): TiiraWatcherState => {
    return {
        locationPollingEnabled: false,
        serviceWorkerActive: false,
        lastInteractionTime: Date.now(),
        backgroundLocations: []
    }
}

export const TiiraWatcherContext = createContext<TiiraWatcherState>(initialState())
export const TiiraWatcherDispatchContext = createContext<React.Dispatch<TiiraWatcherAction>>(null as unknown as React.Dispatch<TiiraWatcherAction>)

export interface BackgroundLocation {
    pos: LatLng
    timestamp: Date
}

interface TiiraWatcherState {
    locationPollingEnabled: boolean
    serviceWorkerActive: boolean
    lastInteractionTime: number
    backgroundLocations: BackgroundLocation[]
}

interface TiiraWatcherAction {
    type: string
    location?: BackgroundLocation
}

function twReducer(state: TiiraWatcherState, action: TiiraWatcherAction) {
    console.log("Reducer action: " + action.type)
    switch (action.type) {
        case 'location_polling_started': {
            // TODO: Proper types for actions
            return {
                ...state,
                locationPollingEnabled: true,
                serviceWorkerActive: true,
                lastInteractionTime: Date.now(),
                backgroundLocations: []
            }
        }
        case 'location_polling_stopped': {
            return {
                ...state,
                locationPollingEnabled: false,
                serviceWorkerActive: false,
                backgroundLocations: []
            }
        }
        case 'update_interaction_time': {
            return {
                ...state,
                lastInteractionTime: Date.now()
            }
        }
        case 'service_worker_auto_stopped': {
            return {
                ...state,
                locationPollingEnabled: false,
                serviceWorkerActive: false
            }
        }
        case 'add_background_location': {
            return {
                ...state,
                backgroundLocations: action.location ? [...state.backgroundLocations, action.location] : state.backgroundLocations
            }
        }
        case 'clear_background_locations': {
            return {
                ...state,
                backgroundLocations: []
            }
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

export function TiiraWatcherProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    const [twState, dispatch] = useReducer(
        twReducer,
        initialState()
    );

    return (
        <TiiraWatcherContext.Provider value={twState}>
            <TiiraWatcherDispatchContext.Provider value={dispatch}>
                {children}
            </TiiraWatcherDispatchContext.Provider>
        </TiiraWatcherContext.Provider>
    );
}

export function useTiiraWatcherState() {
    return useContext(TiiraWatcherContext);
}

export function useTiiraWatcherDispatch() {
    return useContext(TiiraWatcherDispatchContext);
}