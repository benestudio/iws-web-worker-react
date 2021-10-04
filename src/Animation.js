import React from 'react';

function Animation(props) {
  let containerStyle = {
    width: 400,
    height: 400,
    position: 'relative',
    background: 'yellow',
  };
  let animateStyle = {
    width: 50,
    height: 50,
    position: 'absolute',
    backgroundColor: 'red',
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
      elem.style.top = pos + "px";
      elem.style.left = pos + "px";
    }
  }
};
