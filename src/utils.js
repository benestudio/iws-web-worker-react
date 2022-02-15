import * as d3 from "d3";
export const contentTypeCSV = "text/csv;charset=utf-8;";

export const toBlob = (data) => {
  let blob = new Blob([data], { type: contentTypeCSV });
  return blob;
};

export const toArrayBuffer = async (data) => {
  let blob = new Blob([data], { type: contentTypeCSV });
  let ab = await blob.arrayBuffer();
  return ab;
};

export const toCSV = (data) => {
  let result = d3.csvFormat(data);
  return result;
};

/* Take a blob and force browser to click a link and save it from a download path
 * log out timing
 *
 * @param {Blob}
 * @method saveFile
 */
export const downloadBlobToFile = (blob, filename) => {
  const uniqTime = new Date().getTime();
  if (!filename) {
    filename = `my_file_${uniqTime}.csv`;
  }

  if (navigator.msSaveBlob) {
    // IE 10+
    console.info("Starting call for " + "ie download");
    const csvFormatTimeStart = new Date().getTime();

    navigator.msSaveBlob(blob, filename);

    const csvFormatTimeEnd = new Date().getTime();
    const csvFormatTime = csvFormatTimeEnd - csvFormatTimeStart;
    console.log("ie download takes " + csvFormatTime + " ms to run");
  } else {
    console.info("Starting call for " + "regular download");
    const csvFormatTimeStart = new Date().getTime();
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

    const csvFormatTimeEnd = new Date().getTime();
    const csvFormatTime = csvFormatTimeEnd - csvFormatTimeStart;
    console.log("regular download takes " + csvFormatTime + " ms to run");
  }
};
