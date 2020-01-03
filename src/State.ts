import { Action, IAction } from "./Action";
import { Machine } from "./Machine";

export enum StateType {
    transitional = "transitional",
    final = "final"
}

export type RunActionReturnType<S> = {
    nextState: S;
    error: Error;
};

export interface IState<S> {
    on?: object;
    type?: StateType;
    action?: IAction<S>;
}

export class State<S> {
    private _machine: Machine<S>;
    private _name: string;
    private _events: Map<string, S> = new Map();
    private _type: StateType = StateType.transitional;
    private _action: Action<S>;
    private _rawDetails: IState<S>;

    public get type(): StateType {
        return this._type;
    }
    public get name(): string {
        return this._name;
    }

    constructor(name: string, details: IState<S>, machine: Machine<S>) {
        this._name = name;
        this._machine = machine;
        this._rawDetails = details;
        if (details.on) {
            Object.entries(details.on).forEach(([key, val]) => {
                this._events.set(key, val);
            })
        }
        if (details.type) {
            this._type = details.type;
        }
        if (details.action) {
            this.addAction(details.action);
        }
    }

    private _has(stateKey: string): boolean {
        return this._events.has(stateKey);
    }

    public next(stateEvent: string): S {
        if (this._has(stateEvent)) {
            return this._events.get(stateEvent);
        } else {
            console.warn(`Event: "${stateEvent}" is invalid!`);
            return null;
        }
    }

    public addAction(action: IAction<S>) {
        this._rawDetails.action = action;
        this._action = new Action(action.callback, this._machine, {
            onError: action.onError,
            onSuccess: action.onSuccess
        });
    }

    public runActions(): Promise<RunActionReturnType<S>> {
        return new Promise((resolve, reject) => {
            if (this._type === StateType.final || !this._action) return;
            let action: void | Promise<void>;
            const resolveValue: RunActionReturnType<S> = {
                nextState: this._action.onSuccess,
                error: null
            };

            try {
                action = this._action.run();
                if (action && action instanceof Promise) {
                    action
                        .then(() => {
                            resolve(resolveValue);
                        })
                        .catch(error => {
                            console.error(error.message);
                            reject({
                                nextState: this._action.onError,
                                error
                            });
                        });
                } else {
                    resolve(resolveValue);
                }
            } catch (error) {
                console.error(error.message);
                reject({
                    nextState: this._action.onError,
                    error
                });
            }
        });
    }

    public toJSON() {
        const json = { ...this._rawDetails };
        if (this._action) {
            json.on = {
                ...json.on,
                ACTION_SUCCESS: this._action.onSuccess,
                ACTION_ERROR: this._action.onError
            };
        }
        return json;
    }
}
