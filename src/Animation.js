import React from "react";

function Animation(props) {
  let containerStyle = {
    width: 400,
    height: 400,
    position: "relative",
    background: "#50e3c2",
  };
  let animateStyle = {
    width: 20,
    height: 350,
    top: 25,
    position: "absolute",
    backgroundColor: "#ff3f56",
  };
  return (
    <>
      <div id="container" style={containerStyle}>
        <div id="animate" style={animateStyle}></div>
      </div>
    </>
  );
}

export default Animation;
window.animate = () => {
  let id = null;
  const elem = document.getElementById("animate");
  let pos = 0;
  clearInterval(id);
  id = setInterval(frame, 5);
  function frame() {
    if (pos == 350) {
      //clearInterval(id);
      pos = 0;
    } else {
      pos++;
      //elem.style.top = pos + "px";
      elem.style.left = pos + "px";
    }
  }
};
