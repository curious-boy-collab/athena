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

  if (started) {
    return (
      <main className="exam-page">
        <div className="exam-container">
          <header className="exam-header">
            <h3>Multiple-choice quiz</h3>
            <div className="exam-header-actions">
              <span>Time left: {formatTimeLeft(time)}</span>
              <button onClick={finishTest} className="end-test-btn">
                Finish quiz
              </button>
            </div>
          </header>

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
