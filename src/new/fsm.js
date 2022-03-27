import { createMachine, actions } from "xstate";
import dayjs from "dayjs";

export default createMachine(
  {
    id: "空页面",
    context: {
      timeText: "",
      dateText: "",
      dayText: "",
      bgList: [],
      holidays: {},
      currentBg: 0,
    },
    initial: "加载列表",
    states: {
      加载列表: {
        always: {
          target: "空闲",
          cond: "isTodayUpdated",
          actions: "setBgList",
        },
        invoke: {
          src: "getBgList",
          onDone: {
            actions: "setBgList",
            target: "空闲",
          },
        },
      },
      空闲: {
        type: "parallel",
        states: {
          时间: {
            entry: ["getStore", "getTime"],
            on: {
              更新时间: {
                target: ".",
                internal: false,
              },
              keydown: {
                actions: "setCurrentBg",
              },
            },
            invoke: {
              src: "updateTime",
            },
          },
          日期: {
            initial: "加载节假日",
            states: {
              加载节假日: {
                always: {
                  target: "空闲",
                  cond: "hasHolidays",
                  actions: "setHolidays",
                },
                invoke: {
                  src: "getHolidays",
                  onDone: {
                    actions: "setHolidays",
                    target: "空闲",
                  },
                  onError: {
                    target: "空闲",
                  },
                },
              },
              空闲: {
                always: [
                  {
                    target: "隐藏",
                    cond: "hideCale",
                  },
                  {
                    target: "显示",
                  },
                ],
              },
              显示: {
                on: {
                  TOGGLE: {
                    target: "隐藏",
                    actions: "setCaleHide",
                  },
                },
              },
              隐藏: {
                on: {
                  TOGGLE: {
                    target: "显示",
                    actions: "setCaleHide",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    actions: {
      setBgList: actions.assign((ctx, e) => {
        // from service
        if (e.data) {
          localStorage.setItem("getBgListTime", dayjs().format("YYYY-M-D"));
          localStorage.setItem("bgList", JSON.stringify(e.data));

          return {
            bgList: e.data["image-src"],
          };
        }

        // from always
        try {
          const bgList = JSON.parse(localStorage.getItem("bgList"));

          return {
            bgList: bgList["image-src"],
          };
        } catch (error) {}
      }),
      setHolidays: actions.assign((ctx, e) => {
        // from service
        if (e.data) {
          localStorage.setItem("getHolidaysTime", dayjs().format("YYYY"));
          localStorage.setItem("holidays", JSON.stringify(e.data));

          return {
            holidays: e.data,
          };
        }

        // from always
        try {
          const holidays = JSON.parse(localStorage.getItem("holidays"));

          return {
            holidays,
          };
        } catch (error) {}
      }),
      getStore: actions.assign((ctx, e) => {
        return {
          currentBg: localStorage.getItem("currentBg") || 0,
        };
      }),
      getTime: actions.assign((ctx, e) => {
        return {
          timeText: dayjs().format("HH:mm"),
          dateText: dayjs().format("YYYY-M-D"),
          dayText: dayjs().day(),
        };
      }),
      setCurrentBg: actions.assign(({ currentBg, bgList }, { code }) => {
        let _currentBg = currentBg;

        if (code == "ArrowRight") {
          _currentBg = currentBg + 1 > bgList.length - 1 ? 0 : currentBg + 1;
        }

        if (code == "ArrowLeft") {
          _currentBg = currentBg - 1 < 0 ? bgList.length - 1 : currentBg - 1;
        }

        if (_currentBg != currentBg) {
          localStorage.setItem("currentBg", _currentBg);

          return {
            currentBg: _currentBg,
          };
        }
      }),
      setCaleHide: actions.assign((ctx, e, { state }) => {
        localStorage.setItem("caleHide", state.matches("空闲.日期.显示"));
      }),
    },
    services: {
      getBgList: (ctx, e) => {
        return fetch(
          "https://cdn.jsdelivr.net/gh/lecepin/my-pure-desktop/public/bg-list.json"
        )
          .then((data) => data.json())
          .catch(() =>
            fetch(
              "https://raw.githubusercontent.com/lecepin/my-pure-desktop/master/public/bg-list.json"
            ).then((data) => data.json())
          );
      },
      getHolidays: (ctx, e) => {
        return fetch(
          `https://cdn.jsdelivr.net/gh/lecepin/chinese-holidays-query/${dayjs().format(
            "YYYY"
          )}.json`
        )
          .then((data) => data.json())
          .catch(() =>
            fetch(
              `https://raw.githubusercontent.com/lecepin/chinese-holidays-query/${dayjs().format(
                "YYYY"
              )}.json`
            ).then((data) => data.json())
          );
      },
      updateTime:
        ({ timeText }, e) =>
        (send, onRec) => {
          const _interval = setInterval(() => {
            if (dayjs().format("HH:mm") != timeText) {
              send("更新时间");
            }
          }, 1000);

          return () => clearInterval(_interval);
        },
    },
    guards: {
      isTodayUpdated: (ctx, e) => {
        return (
          localStorage.getItem("getBgListTime") == dayjs().format("YYYY-M-D")
        );
      },
      hasHolidays: (ctx, e) => {
        return (
          localStorage.getItem("getHolidaysTime") == dayjs().format("YYYY")
        );
      },
      hideCale: (ctx, e) => {
        return localStorage.getItem("caleHide") == "true";
      },
    },
  }
);
