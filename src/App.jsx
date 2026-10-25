import "./App.css";

function App() {
  return (
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
              <button className="btn btn-dark">Get Camera Access</button>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="permission-item">
          <div className="permission-icon">⛶</div>
          <div className="permission-content">
            <h3>Switch to full screen</h3>
            <p>Kindly close all tabs and switch to full screen.</p>
            <button className="btn btn-light-blue">Give Full Screen Permissions</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
