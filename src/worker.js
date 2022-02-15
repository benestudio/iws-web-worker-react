import { toBlob, toCSV, toArrayBuffer } from "./utils";
require("log-timestamp");

self.addEventListener("message", (message) => {
  console.log("worker:: Message from Main thread self: " + message.data);
  onmessage(message);
});
const onmessage = async function (e) {
  const data = e.data;
  console.log("worker:: worker thread data::" + data);
  if (!data) return;
  const type = data.type;
  const arg = data.arg;
  const startTime = data.startTime;
  let arrayBuffer = null;

  console.log("worker:: Message received from main script:" + type);
  switch (type) {
    case "blobber":
      // start timer - convert object to csv -----------------

      {
        let timeStart = new Date().getTime();
        // -----------------------------

        const res = toCSV(arg);
        // end timer -------------------
        let timeEnd = new Date().getTime();
        let timeDiff = timeEnd - timeStart;
        console.log("worker:: toCSV takes " + timeDiff + " ms to run");
        // -----------------------------

        // convert CSV to Blob -----------------------------

        timeStart = new Date().getTime();

        arrayBuffer = await toArrayBuffer(res);

        // end timer -------------------
        timeEnd = new Date().getTime();
        timeDiff = timeEnd - timeStart;
        console.log("worker:: toArrayBuffer2 takes " + timeDiff + " ms to run");
        console.log(
          "worker:: postMessage using buffer copying WITHOUT zero copy transferable buffer"
        );

        // postMessage using buffer copying without transferable buffer-----------------------------
        postMessage({
          type: type,
          data: arrayBuffer,
          startTime: startTime,
        });
      }
      break;

    case "blobber-transfer":
      // start timer - convert object to csv -----------------

      {
        let timeStart = new Date().getTime();
        // -----------------------------

        const res = toCSV(arg);
        // end timer -------------------
        let timeEnd = new Date().getTime();
        let timeDiff = timeEnd - timeStart;
        console.log("worker:: toCSV takes " + timeDiff + " ms to run");
        // -----------------------------

        // convert CSV to Blob -----------------------------

        timeStart = new Date().getTime();

        arrayBuffer = await toArrayBuffer(res);

        // end timer -------------------
        timeEnd = new Date().getTime();
        timeDiff = timeEnd - timeStart;
        console.log("worker:: toArrayBuffer2 takes " + timeDiff + " ms to run");

        console.log(
          "worker:: postMessage using buffer copying WITH ZERO copy transferable buffer"
        );

        // postMessage using transferable buffer-----------------------------
        postMessage(
          {
            type: type,
            data: arrayBuffer,
            startTime: startTime,
          },
          [arrayBuffer]
        );
      }
      break;
    default:
      console.error("worker:: invalid stuff" + e);
      arrayBuffer = null;
      break;
  }
};
