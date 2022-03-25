import { createMachine, actions } from "xstate";
import dayjs from "dayjs";

export default createMachine(
  {
    id: "空页面",
    context: {
      timeText: "",
      dateText: "",
      dayText: "",
      bgList: [
        "https://img.alicdn.com/imgextra/i4/O1CN01sF52FM1RpKFNt0knr_!!6000000002160-2-tps-2560-1440.png",
        "https://img.alicdn.com/imgextra/i2/O1CN01kQBI8o1V0ix9rPpdx_!!6000000002591-2-tps-1955-1620.png",
        "https://img.alicdn.com/imgextra/i4/O1CN016mkkGO1j15tPmnceV_!!6000000004487-2-tps-5282-2839.png",
        "https://img.alicdn.com/imgextra/i3/O1CN016Y8e1b1P3ZiorFrlU_!!6000000001785-2-tps-2735-1632.png",
        "https://img.alicdn.com/imgextra/i2/O1CN01bIBe34226ZKJWTS2S_!!6000000007071-2-tps-2048-2048.png",
        "https://img.alicdn.com/imgextra/i4/O1CN01Xto4tu1zwNHSRDAe1_!!6000000006778-2-tps-1357-1357.png",
        "https://img.alicdn.com/imgextra/i2/O1CN01HKk6c71ibRiCbC2ls_!!6000000004431-0-tps-5120-2604.jpg",
        "https://img.alicdn.com/imgextra/i3/O1CN011iG9p920dsuErPoW3_!!6000000006873-0-tps-2400-1557.jpg",
        "https://img.alicdn.com/imgextra/i4/O1CN01CbXhRb1hBy45JsZP9_!!6000000004240-0-tps-1849-1040.jpg",
        "https://img.alicdn.com/imgextra/i3/O1CN01R2Rm961fzltxKsYEO_!!6000000004078-0-tps-3840-2160.jpg",
        "https://img.alicdn.com/imgextra/i1/O1CN01CdFh4Y1nIjc1HtyXf_!!6000000005067-2-tps-2560-1440.png",
        "https://img.alicdn.com/imgextra/i1/O1CN01IO9YpO23BR9TMMl9G_!!6000000007217-0-tps-6287-2600.jpg",
      ],
      currentBg: 0,
    },
    initial: "空闲",
    states: {
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
  }
);