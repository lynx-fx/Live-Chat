import Lottie from "lottie-react"
import animationData from "../utils/loading.json"

const Loading = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)", // optional dimming
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <Lottie animationData={animationData} loop autoplay style={{ width: "200px", height: "200px" }} />
    </div>
  )
}

export default Loading

