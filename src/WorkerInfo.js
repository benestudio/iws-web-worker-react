import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { toBlob, toCSV, downloadBlobToFile } from "./utils";

import { Spinner } from "react-bootstrap";

require("log-timestamp");

const workerInstance = new Worker("./worker.js");

const workerMaker = (type, arg, startTime) => {
  // check if a worker has been imported
  if (window.Worker) {
    console.log("main:: posting worker for " + type);
    workerInstance.postMessage({ type, arg, startTime });
  }
};

workerInstance.onmessage = (e) => {
  console.log("main:: Message type received from worker" + e.data.type);
  const response = e.data;
  const data = response.data;
  const type = response.type;
  const startTime = response.startTime;
  if (type === "csvFormat") {
    getBlob(data, startTime);
  } else if (type === "blobber") {
    const uniqTime = new Date().getTime();
    const contentTypeCSV = "text/csv;charset=utf-8;";
    downloadBlobToFile(
      new Blob([data], { type: contentTypeCSV }),
      `github_${uniqTime}.csv`
    );
    const clickEnd = new Date().getTime();
    console.log(
      "main:: The whole process took: " + (clickEnd - startTime) + " ms"
    );
    workerInstance.setPerformance(clickEnd - startTime);
    workerInstance.setStatus("resolved");
  } else if (type === "blobber-transfer") {
    const uniqTime = new Date().getTime();
    downloadBlobToFile(new Blob([data]), `github_${uniqTime}.csv`);
    const clickEnd = new Date().getTime();
    console.log(
      "main:: The whole process took: " + (clickEnd - startTime) + " ms"
    );
    workerInstance.setPerformance(clickEnd - startTime);
    workerInstance.setStatus("resolved");
  } else {
    console.error("An Invalid type has been passed in");
  }
};

function WorkerInfo({ workerMode }) {
  const [status, setStatus] = React.useState("idle");
  const [performance, setPerformance] = React.useState(0);
  const [usersData, setUsersData] = React.useState([]);
  const [error, setError] = React.useState(null);

  workerInstance.setPerformance = setPerformance;
  workerInstance.setStatus = setStatus;

  console.log("main:: rendering info");

  const getData = () => {
    fetch("http://localhost:1235/data2", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
      },
    })
      .then(function (response) {
        console.log("response:::" + response);
        return response.json();
      })
      .then(function (myJson) {
        console.log("myJson:::" + myJson.length);
        setUsersData(myJson);
      });
  };

  React.useEffect(() => {
    if (usersData) {
      console.log(usersData.length);
    }
  }, [usersData]);

  React.useEffect(() => {
    console.log("main:: Initialize json data::");
    getData();
  }, []);

  React.useEffect(() => {
    console.log("main:: useEffect of workermode");
    if (!workerMode) {
      return;
    }
    setStatus("pending");
    let blockingTime = 0;
    switch (workerMode) {
      case "mode1":
        blockingTime = blockingExport(usersData);
        setPerformance(blockingTime);
        setStatus("resolved");
        break;
      case "mode2":
        nonBlockingExport(usersData);
        break;
      case "mode3":
        nonBlockingTransferableExport(usersData);
        break;
      default:
        throw Error("Not Implemented yet!");
    }
  }, [workerMode]);

  function getSnippet(msg) {
    return (
      <>
        <div>{msg}</div>
        <div>
          <Spinner animation="border" />
        </div>
      </>
    );
  }

  if (status === "idle") {
    return getSnippet(`Submit a request for ${workerMode}`);
  }

  if (status === "rejected") {
    return getSnippet(`Error...!: ${error}`);
  }

  if (status === "pending") {
    return getSnippet("Loading ...");
  }

  if (status === "resolved") {
    return getSnippet(
      <pre>Time taken for the last operation is: {performance}ms.</pre>
    );
  }
}

function blockingExport(data) {
  console.log("main:: Initiate blocking csv download");
  const clickStart = new Date().getTime();
  console.log("main:: data:::" + (data ? data.length : null));
  console.log("main:: data type::" + typeof data);
  const res = toCSV(data);
  console.log("main:: res type::" + typeof res);
  const blob = toBlob(res);
  const uniqTime = new Date().getTime();
  downloadBlobToFile(blob, `github_${uniqTime}.csv`);
  const clickEnd = new Date().getTime();
  console.log(
    "main:: The whole process took: " + (clickEnd - clickStart) + " ms"
  );
  return clickEnd - clickStart;
}

/* This method will call the worker with a particular type that maps to a callback to format the csv
 *
 * @param {Array} data - e.g. [{x: 1, y: 1}]
 * @method getCSV
 * @return {Undefined}
 */
const getCSVFromWorker = (data, clickStart, transferMode = "csvFormat") => {
  console.log("main:: Data length is: " + data.length);
  console.info("Starting call for csv format:" + transferMode);
  const csvFormatTimeStart = new Date().getTime();
  workerMaker(transferMode, data, clickStart);
  const csvFormatTimeEnd = new Date().getTime();
  const csvFormatTime = csvFormatTimeEnd - csvFormatTimeStart;
  console.log("main:: csv format takes " + csvFormatTime + " ms to run");
};

/* This method will use the data passed in and trigger an export
 * with the csv conversion process offloaded to a worker
 *
 * @param {Array} data - e.g. [{x: 1, y: 1}]
 * @method nonBlockingExport
 * @return {Undefined}
 */
function nonBlockingExport(data, transferable = false) {
  console.log("main:: Initiate nonBlockingExport csv download");
  const clickStart = new Date().getTime();
  console.log("main:: data:::" + (data ? data.length : null));
  console.log("main:: data type::" + typeof data);

  getCSVFromWorker(data, clickStart, "blobber");
}

function nonBlockingTransferableExport(data) {
  console.log("main:: Initiate nonBlockingTransferableExport csv download");
  const clickStart = new Date().getTime();
  console.log("main:: data:::" + (data ? data.length : null));
  console.log("main:: data type::" + typeof data);

  getCSVFromWorker(data, clickStart, "blobber-transfer");
}

/* This method will call the worker with a particular type that maps to a callback to create a blob
 *
 * @param {File} csvFile
 * @method getBlob
 * @return {Undefined}
 */
const getBlob = (csvFile, startTime) => {
  console.log("main:: creating blob...");
  const blobFormatTimeStart = new Date().getTime();
  workerMaker("blobber-transfer", csvFile, startTime);
  const blobFormatTimeEnd = new Date().getTime();
  const blobFormatTime = blobFormatTimeEnd - blobFormatTimeStart;
  console.log(
    "main:: blob workerMaker takes " + blobFormatTime + " ms to start"
  );
};

/* Take a blob and force browser to click a link and save it from a download path
 * log out timing
 *
 * @param {Blob}
 * @method saveFile
 */
function saveFile(blob, clickStart) {
  const uniqTime = new Date().getTime();
  const filename = `my_file_${uniqTime}`;

  if (navigator.msSaveBlob) {
    // IE 10+
    console.info("main:: Starting call for " + "ie download");
    const csvFormatTimeStart = new Date().getTime();

    const ieFilename = `${filename}.csv`;
    navigator.msSaveBlob(blob, ieFilename);

    const csvFormatTimeEnd = new Date().getTime();
    const csvFormatTime = csvFormatTimeEnd - csvFormatTimeStart;
    console.log("main:: ie download takes " + csvFormatTime + " ms to run");
  } else {
    console.info("main:: Starting call for " + "regular download");
    const downloadTimeStart = new Date().getTime();
    let link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    const downloadTimeEnd = new Date().getTime();
    const downloadTime = downloadTimeEnd - downloadTimeStart;
    console.log("main:: regular download takes " + downloadTime + " ms to run");
  }
}

export default WorkerInfo;
