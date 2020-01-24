# sweet-state
A finite state machine written in TypeScript

## Example Usage

### Basic Machine Setup (file name: <i>machine.ts</i>)

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

// action callbacks must return type of: Promise<void>
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
```

### Listening to state changes
```TypeScript
function listenCallback(currentState, error) {
    // ...do something
}
machine.listen(listenCallback);
```

### Sending events
```TypeScript
machine.send(MachineEvents.submit)
```