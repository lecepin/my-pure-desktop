import React, { useEffect, useState, useRef } from "react";

import "./index.less";

const SliderAnimate = ({
  show,
  children,
  className = "",
  showStyle = "translateX(0)",
  hideStyle = "translateX(-100%)",
  hideRemove = true,
}) => {
  const [shouldRender, setRender] = useState(show);
  const ref = useRef(null);

  useEffect(() => {
    if (show) {
      setRender(true);
      setTimeout(() => {
        ref.current.style.transform = showStyle;
      });
    } else {
      setTimeout(() => {
        ref.current.style.transform = hideStyle;
      });
    }
  }, [show]);

  const onTransitionEnd = () => {
    if (!show) {
      setRender(false);
    }
  };

  return shouldRender || !hideRemove ? (
    <div
      onTransitionEnd={onTransitionEnd}
      className={`slider-animate ${className}`}
      ref={ref}
    >
      {children}
    </div>
  ) : null;
};

export default SliderAnimate;
