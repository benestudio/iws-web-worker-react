import {toBlob,toCSV, toArrayBuffer2} from './utils'
require('log-timestamp');


self.addEventListener("message", message => {
  console.log('worker:: Message from Main thread self: '+message.data);
  onmessage(message);
  
});
var onmessage = async function (e) {
  var data = e.data;
  console.log('worker:: worker thread data::'+data)
  if(!data)return;
  var type = data.type;
  var arg = data.arg;
  var startTime = data.startTime;
  let arrayBuffer = null;

  console.log("worker:: Message received from main script:"+type);
  switch (type) {
    case "blobber":
      // start timer - convert object to csv -----------------
      
      var timeStart = new Date().getTime();
      // -----------------------------

      var res = toCSV(arg);
      // end timer -------------------
      var timeEnd = new Date().getTime();
      var timeDiff = timeEnd - timeStart;
      console.log("worker:: toCSV takes " + timeDiff + " ms to run");
      // -----------------------------

           
      
      // convert CSV to Blob -----------------------------

      timeStart = new Date().getTime();

      arrayBuffer = await toArrayBuffer2(res);

      // end timer -------------------
      timeEnd = new Date().getTime();
      timeDiff = timeEnd - timeStart;
      console.log("worker:: toArrayBuffer2 takes " + timeDiff + " ms to run");
      
      // postMessage using buffer copying without transferable buffer-----------------------------
      postMessage({
        type: type,
        data: arrayBuffer,
        startTime: startTime,
      });
      break;

    case "blobber-transfer":

    // start timer - convert object to csv -----------------
      
    var timeStart = new Date().getTime();
    // -----------------------------

    var res = toCSV(arg);
    // end timer -------------------
    var timeEnd = new Date().getTime();
    var timeDiff = timeEnd - timeStart;
    console.log("worker:: toCSV takes " + timeDiff + " ms to run");
    // -----------------------------

         
    
    // convert CSV to Blob -----------------------------

    timeStart = new Date().getTime();

    arrayBuffer = await toArrayBuffer2(res);

    // end timer -------------------
    timeEnd = new Date().getTime();
    timeDiff = timeEnd - timeStart;
    console.log("worker:: toArrayBuffer2 takes " + timeDiff + " ms to run");
    
    // postMessage using transferable buffer-----------------------------
      postMessage({
        type: type,
        data: arrayBuffer,
        startTime: startTime,
      },[arrayBuffer]);
      break;
    default:
      console.error("worker:: invalid stuff"+e);
      arrayBuffer=null;
      break;
  }
};