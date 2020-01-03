import { State, StateType, RunActionReturnType } from "./State";
import { States, IStates } from "./States";
import { Listeners, ListenCallback } from "./Listeners";
import { IAction } from "./Action";

interface MachineInitObject<S> {
    initial: S;
    states: IStates<S>;
}

enum MachineStatus {
    inactive = "inactive",
    active = "active",
    paused = "paused",
    complete = "complete"
}

export class Machine<S> {
    private static all = "all";
    private _current: S;
    private _states: States<S>;
    private _status: MachineStatus = MachineStatus.inactive;
    private _listeners: Listeners<S>;
    private _initial: S;
    private _error: Error;
    private get _currentState(): State<S> {
        return this._states.get(this._current);
    }
    public get state(): S {
        return this._current;
    }
    public get error(): Error {
        return this._error;
    }

    constructor(machineDetails: MachineInitObject<S>) {
        this._states = new States<S>(machineDetails.states, this);
        this._initial = machineDetails.initial;

        if (!this._stateIsValid(this._initial)) {
            throw new Error(`Initial state "${this._initial}" is invalid`);
        }
        this._current = this._initial;
        this._listeners = new Listeners(this._states, this);
    }

    private _stateIsValid(state: S): boolean {
        if (!state) return false;
        return this._states.has(state);
    }

    private _transitionTo(nextState: S) {
        if (this._stateIsValid(nextState)) {
            this._current = nextState;
            this._listeners.notify(this._current);
            this._processNewState();
        }
    }

    private _actionRunHandler(result: RunActionReturnType<S>) {
        if (!this._shouldProceed) return;
        if (result.error) {
            this._error = result.error;
        }
        this._transitionTo(result.nextState);
    }

    private _processNewState() {
        if (this._currentState.type === StateType.final) {
            this._listeners = new Listeners(this._states, this);
            this._status = MachineStatus.complete;
        } else {
            const callback = this._actionRunHandler.bind(this);
            this._currentState
                .runActions()
                .then(callback)
                .catch(callback);
        }
    }

    private get _shouldProceed(): boolean {
        let shouldProceed: boolean = false;
        switch (this._status) {
            case MachineStatus.inactive:
            case MachineStatus.paused:
            case MachineStatus.complete:
                console.warn(
                    `The state machine will not respond to events when in "${
                    this._status
                    }" status.`
                );
                shouldProceed = false;
                break;
            case MachineStatus.active:
                shouldProceed = true;
                break;
            default:
                shouldProceed = false;
                break;
        }
        return shouldProceed;
    }

    public send(stateEvent: string): S {
        if (this._shouldProceed) {
            const nextState = this._currentState.next(stateEvent);
            this._transitionTo(nextState);
        }
        return this._current;
    }

    public addAction(stateKey: S, action: IAction<S>): void {
        if (!this._stateIsValid(stateKey)) {
            return console.warn(`Invalid state "${stateKey}" to add action to!`);
        }
        this._states.get(stateKey).addAction(action);
    }

    public on(eventName: S, callback: ListenCallback<S>): void {
        this._listeners.add(callback, eventName);
    }

    public listen(callback: ListenCallback<S>) {
        this._listeners.add(callback);
    }

    public start(): S {
        this._status = MachineStatus.active;
        return this._current;
    }

    public pause() {
        this._status = MachineStatus.paused;
    }

    public visualize() {
        const url = new URL("https://musing-rosalind-2ce8e7.netlify.com/");
        url.searchParams.append("machine", this.toString());
        window.open(url.href);
    }

    public toJSON() {
        return {
            initial: this._initial,
            states: this._states.toJSON()
        };
    }

    public toString() {
        return JSON.stringify(this.toJSON());
    }
}
