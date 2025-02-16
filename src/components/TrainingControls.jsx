import React from 'react';
import BatchProgressIndicator from './BatchProgressIndicator';

function TrainingControls({ 
    learningRate,
    setLearningRate,
    isTraining,
    onStartTraining,
    onStopTraining,
    onStep,
    epoch,
    batchSize,
    setBatchSize,
    trainingSpeed,
    setTrainingSpeed,
    momentum,
    setMomentum,
    batchProgress,
    batchStats,
}) {
    console.log('Batch Progress:', batchProgress, 'Batch Size:', batchSize);

    return (
        <div className="training-controls-panel">
            <div className="section-header">
                <span className="section-icon">🎓</span>
                <h2>Training Controls</h2>
            </div>
            
            <div className="training-parameters">
                <div className="parameter-group">
                    <label>Learning Rate</label>
                    <input
                        type="number"
                        value={learningRate}
                        onChange={(e) => setLearningRate(Number(e.target.value))}
                        step="0.001"
                        min="0.001"
                        max="1"
                    />
                    <div className="parameter-tooltip">
                        Controls how much the weights change in each step
                    </div>
                </div>

                <div className="parameter-group">
                    <label>Batch Size</label>
                    <input
                        type="number"
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        step="1"
                        min="1"
                        max="32"
                    />
                    <div className="parameter-tooltip">
                        Number of samples to process before updating weights
                    </div>
                </div>

                <div className="parameter-group">
                    <label>Training Speed</label>
                    <select 
                        value={trainingSpeed} 
                        onChange={(e) => setTrainingSpeed(Number(e.target.value))}
                    >
                        <option value={500}>Slow</option>
                        <option value={100}>Normal</option>
                        <option value={50}>Fast</option>
                        <option value={10}>Very Fast</option>
                    </select>
                    <div className="parameter-tooltip">
                        Controls how fast the network trains
                    </div>
                </div>

                <div className="parameter-group">
                    <label>Momentum</label>
                    <input
                        type="number"
                        value={momentum}
                        onChange={(e) => setMomentum(Number(e.target.value))}
                        step="0.1"
                        min="0"
                        max="0.9"
                    />
                    <div className="parameter-tooltip">
                        Controls how much previous gradients influence current updates
                    </div>
                </div>
            </div>

            <div className="training-status">
                <div className="status-item">
                    <span className="status-label">Epoch</span>
                    <span className="status-value">{epoch}</span>
                </div>
            </div>

            <div className="training-buttons">
                <button 
                    className="training-button step"
                    onClick={onStep}
                    disabled={isTraining}
                >
                    <span className="icon">👣</span>
                    Single Step
                </button>
                
                <button 
                    className="training-button"
                    onClick={isTraining ? onStopTraining : onStartTraining}
                >
                    <span className="icon">{isTraining ? '⏹️' : '▶️'}</span>
                    {isTraining ? 'Stop Training' : 'Start Training'}
                </button>
            </div>

            <BatchProgressIndicator 
                current={batchProgress}
                total={batchSize}
                batchStats={batchStats}
            />
        </div>
    );
}

export default TrainingControls; 