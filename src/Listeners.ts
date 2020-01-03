import { States } from "./States";
import { Machine } from "./Machine";

export type ListenCallback<S> = (currentState: S, error?: Error) => void;

export class Listeners<S> {
    private static all = "all" as any;
    private _listeners: Map<S, ListenCallback<S>[]>;
    private _machine: Machine<S>;

    constructor(states: States<S>, machine: Machine<S>) {
        this._listeners = new Map([[Listeners.all, []]]);
        this._machine = machine;

        Array.from(states.keys()).forEach(state => {
            this._listeners.set(state, []);
        });
    }

    private _add(key: S, callback: ListenCallback<S>) {
        if (this._listeners.has(key)) {
            this._listeners.get(key).push(callback);
        }
    }

    public notify(currentState: S) {
        const cb = (callback: ListenCallback<S>) => callback(currentState, this._machine.error);

        if (this._listeners.has(currentState)) {
            this._listeners.get(currentState).forEach(cb);
        }

        if (this._listeners.has(Listeners.all)) {
            this._listeners.get(Listeners.all).forEach(cb);
        }
    }

    public add(callback: ListenCallback<S>, stateKey?: S) {
        this._add(stateKey ? stateKey : Listeners.all, callback);
    }
}
