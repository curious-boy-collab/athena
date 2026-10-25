import { useEffect, useRef, useState } from "react";
import "./App.css";

const questions = [
  {
    prompt: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Mercury"],
    answer: "Mars",
  },
  {
    prompt: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    answer: "Pacific Ocean",
  },
  {
    prompt: "How many sides does a hexagon have?",
    options: ["Five", "Six", "Seven", "Eight"],
    answer: "Six",
  },
  {
    prompt: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
    answer: "Carbon dioxide",
  },
];

function App() {
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(answer) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionIndex]: answer,
    }));
  }

  async function getElapsedTime() {
    const currTime = await window.electronAPI.getRemainingTime();
    setTime(currTime);
  }

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(getElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [started]);

  function finishTest() {
    setSubmitted(true);
    setStarted(false);
  }

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

  async function clickPhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      throw new Error("Camera video is not ready yet.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create an image from the camera.");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (imageBlob) => {
          if (imageBlob) resolve(imageBlob);
          else reject(new Error("Could not capture an image from the camera."));
        },
        "image/jpeg",
        0.9,
      );
    });
    return blob;
  }

  useEffect(() => {
    if (!started || !cameraReady) return;

    let timeoutId;
    let cancelled = false;
    const capture = async () => {
      try {
        await clickPhoto();
      } catch (error) {
        // error handling
      }
      if (!cancelled) timeoutId = setTimeout(capture, 4000);
    };
    timeoutId = setTimeout(capture, 4000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [started, cameraReady]);

  async function startTest() {
    const accepted = await window.electronAPI.showExamRules();
    if (accepted !== 1) return;

    await window.electronAPI.startTest();
    await getElapsedTime();
    setStarted(true);
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

  if (started || submitted) {
    const question = questions[questionIndex];
    const score = questions.reduce(
      (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
      0,
    );
    return (
      <main className="exam-page">
        <div className="exam-container">
          <header className="exam-header">
            <h3>{submitted ? "Quiz complete" : "Multiple-choice quiz"}</h3>
            {!submitted && (
              <div className="exam-header-actions">
              <span>Time left: {formatTimeLeft(time)}</span>
              <button onClick={finishTest} className="end-test-btn">
                Finish quiz
              </button>
            </div>
                        </div>
            )}
          </header>

          {submitted ? (
            <section className="question-card result-card">
              <h2>Your result</h2>
              <p>
                You scored {score} out of {questions.length}.
              </p>
              <button
                className="end-test-btn"
                onClick={() => {
                  setSubmitted(false);
                  setStarted(false);
                }}
              >
                Back to setup
              </button>
            </section>
          ) : (
          <section className="question-card">
            <h2>
              Question {questionIndex + 1} of {questions.length}
            </h2>
            <p>{questions[questionIndex].prompt}</p>
            <div role="radiogroup" aria-label={questions[questionIndex].prompt}>
              {questions[questionIndex].options.map((option) => (
                <label className="option-row" key={option}>
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={option}
                    checked={answers[questionIndex] === option}
                    onChange={() => selectAnswer(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <div className="navigation-buttons">
              <button
                onClick={() => setQuestionIndex((index) => index - 1)}
                disabled={questionIndex === 0}
              >
                Previous
              </button>
              {questionIndex === questions.length - 1 ? (
                <button onClick={finishTest}>Submit answers</button>
              ) : (
                <button onClick={() => setQuestionIndex((index) => index + 1)}>
                  Next
                </button>
              )}
            </div>
          </section>
          )}
        </div>
      </main>
    );
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
          <button onClick={startTest} className="btn btn-light-blue" disabled={!cameraReady}>
            Go To Test
          </button>
          <button className="btn btn-outline">Need Help?</button>
        </div>
      </div>
    </>
  );
}

export default App;
