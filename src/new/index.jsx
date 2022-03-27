import React, { useEffect } from "react";
import { useMachine } from "@xstate/react";
import fsm from "./fsm";

import "./index.less";

export default () => {
  const [state, send] = useMachine(fsm);
  const {
    context: { timeText, currentBg, bgList, dateText, dayText },
  } = state;

  useEffect(() => {
    function keydown(e) {
      send(e);
    }

    window.addEventListener("keydown", keydown);

    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, []);

  return state.matches("空闲") ? (
    <div
      className="new"
      style={{
        backgroundImage: `url(${bgList[currentBg]})`,
      }}
    >
      <div className="new-time">
        {timeText}
        <div className="new-time-date">{dateText}</div>
        <div className="new-time-day">Week {dayText}</div>
      </div>
    </div>
  ) : null;
};
