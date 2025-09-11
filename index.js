const socket = new WebSocket("wss://echo.websocket.org");

/** @type {number[]} */
let pingArr = [];
let success = 0;
let fail = 0;

const output = (ping) => {
  const div = document.getElementById("result");
  const newElem = document.createElement("p");
  //prettier-ignore
  newElem.textContent = `Ping: ${ping}ms (Loss: ${(fail / pingArr.length) * 100}%)`;
  newElem.className = "resultText";
  div.appendChild(newElem);
};

socket.addEventListener("open", (ev) => {
  setInterval(() => {
    const before = new Date().getTime();
    socket.send("0");
    let timeoutInterval = null;
    const pongPromise = new Promise((resolve, reject) => {
      socket.onmessage = (ev) => {
        if (ev.data == "0") {
          const now = new Date().getTime();
          pingArr.push(now - before);
          success++;
          output(now - before);
          console.log(`Ping: ${now - before}ms`);
          resolve(true);
        } else {
          console.log("Timed Out");
          fail++;
          reject(ev.data);
        }
      };
    });
    const timeoutPromise = new Promise(
      (_) =>
        (timeoutInterval = setTimeout(() => {
          console.log("Timed Out");
          fail++;
          _(false);
        }, 5000))
    );
    Promise.race([pongPromise, timeoutPromise]).then((val) => {
      clearInterval(timeoutInterval);
      return;
    });
  }, 1000);
});
