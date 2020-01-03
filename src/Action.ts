import { Machine } from "./Machine";

type ActionCallback<S> = (machine: Machine<S>) => Promise<void> | void;

export interface IAction<S> {
    callback: ActionCallback<S>;
    onSuccess: S;
    onError: S;
}

type ActionOptions<S> = {
    onSuccess: S;
    onError: S;
};

export class Action<S> {
    private _machine: Machine<S>;
    private _actionCallback: ActionCallback<S>;
    public onSuccess: S;
    public onError: S;

    constructor(
        action: ActionCallback<S>,
        machine: Machine<S>,
        options: ActionOptions<S>
    ) {
        this._actionCallback = action;
        this.onSuccess = options.onSuccess;
        this.onError = options.onError;
        this._machine = machine;
    }

    public run() {
        return this._actionCallback(this._machine);
    }
}
