import React from "react";
import Lottie from "lottie-react";
import animationData from "../utils/404.json";

const fadeInStyle = {
  animation: "fadeIn 1s ease forwards",
};

const NotFound = () => {
  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          body {
          width: 100vw;
          height: 100vh;
        }
        `}
      </style>
      <div
        style={{
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          ...fadeInStyle,
        }}
      >
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ width: "500px", height: "500px" }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          ...fadeInStyle,
        }}
      >
        <button
          style={{
            width: "100px",
            height: "50px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
          onClick={() => (window.location.href = "/")}
        >
          Home
        </button>
      </div>
    </>
  );
};

export default NotFound;
