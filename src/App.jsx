import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);

  async function getElapsedTime() {
    const currTime = await window.electronAPI.getRemainingTime();
    setTime(currTime);
  }

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(getElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [started]);

  function formatTimeLeft(ms) {
    const seconds = Math.floor((ms / 1000) % 60)
      .toString()
      .padStart(2, "0");

    const minutes = Math.floor((ms / (1000 * 60)) % 60)
      .toString()
      .padStart(2, "0");

    const hours = Math.floor(ms / (1000 * 60 * 60))
      .toString()
      .padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }

  async function getFullscreen() {
    await window.electronAPI.setFullScreen();
  }

  async function getCamera() {
    try {
      const videoData = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = videoData;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        className={cameraReady ? "video-preview" : "hidden-video"}
      />

      <div className="page-container">
        <div className="header-section">
          <h1>Hi User!</h1>
          <p>Kindly Allow the following Permissions to Start the test:</p>
        </div>

        <div className="card-container">
          <div className="permission-item">
            <div className="permission-icon">↗</div>
            <div className="permission-content">
              <h3>Configure Camera</h3>
              <p>
                Camera snapshots will be saved locally every 4 seconds while
                the quiz is active.
              </p>
              <div className="action-row">
                <button onClick={getCamera} className="btn btn-dark">
                  Get Camera Access
                </button>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="permission-item">
            <div className="permission-icon">⛶</div>
            <div className="permission-content">
              <h3>Switch to full screen</h3>
              <p>Kindly close all tabs and switch to full screen.</p>
              <button onClick={getFullscreen} className="btn btn-light-blue">Give Full Screen Permissions</button>
            </div>
          </div>
        </div>

        <div className="bottom-actions">
          <button className="btn btn-light-blue" disabled={!cameraReady}>
            Go To Test
          </button>
          <button className="btn btn-outline">Need Help?</button>
        </div>
      </div>
    </>
  );
}

export default App;
