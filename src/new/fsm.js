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
    },
  }
);
