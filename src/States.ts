import { State, IState } from "./State";
import { Machine } from "./Machine";

export interface IStates<S> {
    [key: string]: IState<S>;
}

export class States<S> extends Map<S, State<S>> {
    constructor(states: IStates<S>, machine: Machine<S>) {
        super();
        Object.keys(states).forEach(key => {
            super.set((key as any) as S, new State(key, states[key], machine));
        });
    }

    toJSON() {
        const statesJson: any = {};
        super.forEach(state => {
            statesJson[state.name] = state.toJSON();
        });
        return statesJson;
    }
}
