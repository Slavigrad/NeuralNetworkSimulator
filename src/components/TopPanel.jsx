import React from 'react';

function TopPanel({ 
  activationFunction, 
  onExportData, 
  downloadJPEG,
  randomizeWeights,
  numInputs,
  numOutputs,
  numHiddenLayers
}) {
  return (
    <div className="top-panel">
      <h1 className="app-title">Neural Network Simulator</h1>
      
      <div className="network-stats">
        <div className="stat-item">
          <span className="stat-label">Inputs</span>
          <span className="stat-value">{numInputs}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Hidden Layers</span>
          <span className="stat-value">{numHiddenLayers}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Outputs</span>
          <span className="stat-value">{numOutputs}</span>
        </div>
      </div>

      <div className="top-panel-controls">
        <div className="button-group">
          <button className="action-button" onClick={randomizeWeights}>
            <span className="icon">🎲</span>
            Randomize
          </button>
          <button className="action-button" onClick={onExportData}>
            <span className="icon">📊</span>
            Export CSV
          </button>
          <button className="action-button" onClick={downloadJPEG}>
            <span className="icon">📷</span>
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopPanel; 