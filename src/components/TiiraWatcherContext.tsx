import React, { JSX, createContext, useContext, useReducer } from "react";

const initialState = (): TiiraWatcherState => {
    return {
        locationPollingEnabled: false
    }
}

export const TiiraWatcherContext = createContext<TiiraWatcherState>(initialState())
export const TiiraWatcherDispatchContext = createContext<React.Dispatch<TiiraWatcherAction>>(null as unknown as React.Dispatch<TiiraWatcherAction>)

interface TiiraWatcherState {
    locationPollingEnabled: boolean
}

interface TiiraWatcherAction {
    type: string
}

function twReducer(state: TiiraWatcherState, action: TiiraWatcherAction) {
    console.log("Reducer action: " + action.type)
    switch (action.type) {
        case 'location_polling_started': {
            // TODO: Proper types for actions
            return {
                ...state,
                locationPollingEnabled: true
            }
        }
        case 'location_polling_stopped': {
            return {
                ...state,
                locationPollingEnabled: false
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