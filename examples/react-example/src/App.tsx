import React, { useContext, useState } from 'react';

import machineContext, { MachineStates, MachineEvents } from "./machine";
import './App.css';

export default function App() {
  const ctx = useContext(machineContext);
  const [machineState, setMachineState] = useState(ctx.machine.state);

  ctx.machine.listen((currentState, error) => {
    if (error) {
      console.log("error", error.message);
    }
    setMachineState(currentState);
  });

  const onClickHandler = () => ctx.machine.send(MachineEvents.submit)

  return (
    <div className="App" app-state={machineState}>
      <h1>Click submit button to test the state machine</h1>

      <p>Current Machine State: {machineState}</p>

      <button onClick={onClickHandler}>subnmit</button>

      {ctx.machine.state === MachineStates.error && (
        <p>Error: {ctx.machine.error.message}</p>
      )}
    </div>
  );
}
