import React from "react";

import { Machine, StateType } from 'sweet-state';

export enum MachineStates {
    idle = "idle",
    loading = "loading",
    error = "error",
    success = "success"
}

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

const initial = MachineStates.idle;

const machine = new Machine<MachineStates>({
    initial,
    states
});

machine.start();

export default React.createContext({
    machine
});