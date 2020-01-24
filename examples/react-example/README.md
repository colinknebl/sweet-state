# React sweet-state example

## Example Usage

```TypeScript
// 1. import the Machine constructor and StateType enum
import { Machine, StateType } from 'sweet-state';

// 2. set the machine states in an enum
export enum MachineStates {
  idle = "idle",
  loading = "loading",
  error = "error",
  success = "success"
}

// 3. create events
export enum MachineEvents {
    submit = 'SUBMIT'
}

function loadingCallback(_: Machine<MachineStates>): Promise<void> {
    const randomNumber = Math.floor(Math.random() * 2);
    if (randomNumber === 0) {
        return Promise.resolve();
    } else {
        const error = new Error("THERE WAS A TERRIBLE ERROR");
        // return Promise.reject(error);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(error);
            }, 2000);
        });
    }
}

// 4. set up the states
const states = {
    [MachineStates.idle]: {
        on: {
            [MachineEvents.submit]: MachineStates.loading
        }
    },
    [MachineStates.loading]: {
        action: {
            callback: loadingCallback,
            onError: MachineStates.error,
            onSuccess: MachineStates.success
        }
    },
    [MachineStates.error]: {
        on: {
            [MachineEvents.submit]: MachineStates.loading
        }
    },
    [MachineStates.success]: {
        type: StateType.final
    }
}

// 5. set the initial state
const initial = MachineStates.idle;

// 6. initialize the machine
const machine = new Machine<MachineStates>({
    initial,
    states
});

// 7. start the machine
machine.start();

// 8. wrap in react context
export default React.createContext({
    machine
});

```

### Dispatching Events
```tsx
import React, { useContext, useState } from 'react';

import machineContext, { MachineStates, MachineEvents } from "./machine";

export default function App() {
    const ctx = useContext(machineContext);
    const [machineState, setMachineState] = useState(ctx.machine.state);

    // listen to any state changes and update the UI accordingly
    ctx.machine.listen((currentState, error) => {
        setMachineState(currentState);
    });

    // when the submit button is clicked we send the MachineEvents.submit
    // event to the state machine
    const onClickHandler = () => ctx.machine.send(MachineEvents.submit)

    return (
        <div className="App" app-state={machineState}>
            <h1>Click submit button to test the state machine</h1>
            
            {/* Render the current state of the machine */}
            <p>Current Machine State: {machineState}</p>

            <button onClick={onClickHandler}>subnmit</button>

            {/* Render any errors encountered */}
            {ctx.machine.state === MachineStates.error && (
                <p>Error: {ctx.machine.error.message}</p>
            )}
        </div>
    );
}
```
