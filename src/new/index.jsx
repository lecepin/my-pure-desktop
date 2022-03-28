import React, { useEffect } from "react";
import { useMachine } from "@xstate/react";
import Calendar from "react-calendar";
import dayjs from "dayjs";
import fsm from "./fsm";
import SliderAnimate from "./components/slider-animate";

import "react-calendar/dist/Calendar.css";
import "./index.less";

const New = () => {
  const [state, send] = useMachine(fsm);
  const {
    context: { timeText, currentBg, bgList, dateText, dayText, holidays },
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

      {!state.matches("空闲.日期.加载节假日") ? (
        <SliderAnimate
          show={state.matches("空闲.日期.显示")}
          hideStyle="translateX(calc(-100% + 25px))"
          className="new-cale"
          hideRemove={false}
        >
          <>
            <Calendar
              calendarType="US"
              formatDay={(_, date) => {
                const holiday =
                  holidays?.[dayjs(date).format("YYYYMMDD")] || {};
                const isNoWorkDay =
                  holiday?.workday === undefined
                    ? dayjs(date).day() == 0 || dayjs(date).day() == 6
                      ? true
                      : false
                    : holiday?.workday == "非工作日";
                const isHolidayNoWorkDay =
                  holiday?.holiday_recess == "假期节假日";
                const content =
                  holiday?.holiday_today == "节日当天" ? holiday.holiday : "";

                return (
                  <div
                    className={`new-cale-day ${
                      isHolidayNoWorkDay ? "new-cale-day-holiday-no-work" : ""
                    }`}
                  >
                    <div
                      className={`new-cale-day-title ${
                        isNoWorkDay ? "new-cale-day-title-no-work" : ""
                      }`}
                    >
                      {dayjs(date).format("DD")}
                    </div>
                    <div className="new-cale-day-content">{content}</div>
                  </div>
                );
              }}
              tileDisabled={() => true}
              value={new Date()}
            />
            <div onClick={() => send("TOGGLE")} className="new-cale-open">
              <div className="new-cale-open-symbol">
                {state.matches("空闲.日期.显示") ? "«" : "»"}
              </div>
              <div>日</div>
              <div>历</div>
            </div>
          </>
        </SliderAnimate>
      ) : null}
    </div>
  ) : null;
};

export default New;
