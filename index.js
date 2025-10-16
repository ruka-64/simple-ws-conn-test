const socket = new WebSocket("wss://echo.websocket.org");

/** @type {number[]} */
let pingArr = [];
let success = 0, fail = 0;


/** @type {number | null} */
let min = null;
/** @type {number | null} */
let max = null;

const output = (ping) => {
  const div = document.getElementById("result");
  const newElem = document.createElement("p");
  //prettier-ignore
  newElem.textContent = `Ping: ${ping}ms (Loss: ${(fail / pingArr.length) * 100}%)`;
  newElem.className = "resultText";
  div.appendChild(newElem);
};

const putPing = (n) => {
  pingArr.push(n);
  console.log('Called', n)
  if (min && min > n) {
    min = n;
    document.getElementById('ping-min').textContent = n;
  } else {
    min = n;
    document.getElementById('ping-min').textContent = n;
  }
  if (max && max < n) {
    max = n;
    document.getElementById('ping-max').textContent = n;
  } else {
    max = n;
    document.getElementById('ping-max').textContent = n;
  }

  document.getElementById('ping-avg').textContent = pingArr.reduce((sum, num) => sum + num, 0) / pingArr.length;

  if (pingArr.length > 10) pingArr.shift();
}

socket.addEventListener("open", () => {
  setInterval(() => {
    const before = new Date().getTime();
    socket.send("0");
    let timeoutInterval = null;
    const pongPromise = new Promise((resolve, reject) => {
      socket.onmessage = (ev) => {
        if (ev.data == "0") {
          const now = new Date().getTime();
          putPing(now - before);
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
    Promise.race([pongPromise, timeoutPromise]).then(() => {
      clearInterval(timeoutInterval);
      return;
    });
  }, 1000);
});
