import React from 'react';
import { activationFunctionInfo } from '../utils/activationFunctions';
import ActivationFunctionGraph from './ActivationFunctionGraph';
import { lossFunctionInfo } from '../utils/lossFunctions';
import TrainingControls from './TrainingControls';
import NetworkStructureControls from './NetworkStructureControls';
import LearningProgressPanel from './LearningProgressPanel';

function ControlsPanel({
  numInputs,
  setNumInputs,
  numHiddenLayers,
  onHiddenLayersChange,
  hiddenLayerNeurons,
  setHiddenLayerNeurons,
  numOutputs,
  setNumOutputs,
  activationFunction,
  setActivationFunction,
  randomizeWeights,
  inputValues,
  handleInputChange,
  onExportData,
  expectedOutputs,
  handleExpectedOutputChange,
  lossFunction,
  setLossFunction,
  learningRate,
  setLearningRate,
  isTraining,
  onStartTraining,
  onStopTraining,
  onStep,
  epoch,
  batchSize,
  setBatchSize,
  momentum,
  setMomentum,
  batchProgress,
  batchStats,
  layerErrors
}) {
  return (
    <div className="controls-panel">
      <NetworkStructureControls
        numInputs={numInputs}
        setNumInputs={setNumInputs}
        numHiddenLayers={numHiddenLayers}
        onHiddenLayersChange={onHiddenLayersChange}
        hiddenLayerNeurons={hiddenLayerNeurons}
        setHiddenLayerNeurons={setHiddenLayerNeurons}
        numOutputs={numOutputs}
        setNumOutputs={setNumOutputs}
      />
      <TrainingControls
        learningRate={learningRate}
        setLearningRate={setLearningRate}
        isTraining={isTraining}
        onStartTraining={onStartTraining}
        onStopTraining={onStopTraining}
        onStep={onStep}
        epoch={epoch}
        batchSize={batchSize}
        setBatchSize={setBatchSize}
        momentum={momentum}
        setMomentum={setMomentum}
        batchProgress={batchProgress}
        batchStats={batchStats}
      />
      <LearningProgressPanel
        layerErrors={layerErrors}
        learningRate={learningRate}
        batchStats={batchStats}
        epoch={epoch}
      />
      {/* Activation Function Section */}
      <div className="control-section activation-section">
        <div className="section-header">
          <span className="section-icon">⚡</span>
          <h2>Activation Function</h2>
        </div>
        <div className="activation-function-container">
          <select
            value={activationFunction}
            onChange={(e) => setActivationFunction(e.target.value)}
          >
            {Object.keys(activationFunctionInfo).map(func => (
              <option key={func} value={func}>{func}</option>
            ))}
          </select>
          <div className="activation-info">
            <div className="formula">
              {activationFunctionInfo[activationFunction].formula}
            </div>
            <ActivationFunctionGraph activationFunction={activationFunction} />
            <div className="description">
              {activationFunctionInfo[activationFunction].description}
            </div>
          </div>
        </div>
      </div>

      {/* Loss Function Section */}
      <div className="control-section loss-section">
        <div className="section-header">
          <span className="section-icon">📉</span>
          <h2>Loss Function</h2>
        </div>
        <div className="loss-function-container">
          <select
            value={lossFunction}
            onChange={(e) => setLossFunction(e.target.value)}
          >
            {Object.keys(lossFunctionInfo).map(func => (
              <option key={func} value={func}>{func}</option>
            ))}
          </select>
          <div className="loss-info">
            <div className="formula">
              {lossFunctionInfo[lossFunction].formula}
            </div>
            <div className="description">
              {lossFunctionInfo[lossFunction].description}
            </div>
          </div>
        </div>
      </div>

      {/* Input Values Section */}
      <div className="control-section input-values-section">
        <div className="section-header">
          <span className="section-icon">🎯</span>
          <h2>Input Values</h2>
        </div>
        <div className="input-values-grid">
          {inputValues.map((value, idx) => (
            <div key={idx} className="input-value-control">
              <label>Input {idx + 1}</label>
              <input
                type="number"
                step="0.1"
                min="-10"
                max="10"
                value={value}
                onChange={(e) => handleInputChange(idx, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Expected Output Values Section */}
      <div className="control-section expected-values-section">
        <div className="section-header">
          <span className="section-icon">🎯</span>
          <h2>Expected Outputs</h2>
        </div>
        <div className="expected-values-grid">
          {expectedOutputs.map((value, idx) => (
            <div key={idx} className="expected-value-control">
              <label>Expected Output {idx + 1}</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={value}
                onChange={(e) => handleExpectedOutputChange(idx, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Network Actions */}
      <div className="control-section actions-section">
        <button className="action-button randomize" onClick={randomizeWeights}>
          <span className="icon">🎲</span>
          Randomize Weights
        </button>
      </div>
    </div>
  );
}

export default ControlsPanel; 