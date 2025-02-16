import React from 'react';

function LearningProgressPanel({ 
    layerErrors, 
    learningRate, 
    batchStats,
    epoch,
    convergenceThreshold = 0.01 
}) {
    // Calculate average error per layer
    const layerAverages = layerErrors?.map(layer => 
        layer.reduce((sum, err) => sum + Math.abs(err), 0) / layer.length
    ) || [];

    // Calculate training stability (based on error variance)
    const stabilityScore = batchStats ? Math.max(0, 1 - batchStats.variance) : 0;
    
    // Check for convergence
    const isConverging = batchStats?.avgError < convergenceThreshold;
    
    return (
        <div className="learning-progress-panel">
            <h3>Learning Progress</h3>
            
            {/* Layer Errors */}
            <div className="metrics-section">
                <h4>Layer Errors</h4>
                <div className="layer-errors">
                    {layerAverages.map((avg, idx) => (
                        <div key={idx} className="layer-error-item">
                            <label>Layer {idx + 1}:</label>
                            <div className="error-bar-container">
                                <div 
                                    className="error-bar" 
                                    style={{ width: `${Math.min(100, avg * 100)}%` }}
                                />
                                <span>{avg.toFixed(4)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Training Metrics */}
            <div className="metrics-section">
                <h4>Training Metrics</h4>
                <div className="metric-item">
                    <label>Learning Rate:</label>
                    <span>{learningRate.toFixed(4)}</span>
                </div>
                <div className="metric-item">
                    <label>Stability Score:</label>
                    <span className={stabilityScore > 0.8 ? 'good' : 'warning'}>
                        {(stabilityScore * 100).toFixed(1)}%
                    </span>
                </div>
                <div className="metric-item">
                    <label>Convergence Status:</label>
                    <span className={isConverging ? 'good' : 'normal'}>
                        {isConverging ? 'Converging' : 'Training'}
                    </span>
                </div>
            </div>
            
            {/* Training Progress */}
            <div className="metrics-section">
                <h4>Training Progress</h4>
                <div className="metric-item">
                    <label>Epoch:</label>
                    <span>{epoch}</span>
                </div>
                <div className="metric-item">
                    <label>Current Error:</label>
                    <span>{batchStats?.avgError.toFixed(4) || '0.0000'}</span>
                </div>
            </div>
        </div>
    );
}

export default LearningProgressPanel; 