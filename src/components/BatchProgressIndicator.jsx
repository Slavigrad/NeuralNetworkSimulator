import React from 'react';

function BatchProgressIndicator({ current, total, batchStats }) {
    const progress = (current / total) * 100;
    
    return (
        <div className="batch-progress">
            <div className="progress-label">
                {current > 0 ? `Batch Progress: ${current}/${total}` : 'Batch Progress: Idle'}
            </div>
            <div className="progress-bar-container">
                <div 
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                />
            </div>
            
            {/* Show stats even when idle, with default values if none available */}
            <div className="batch-stats">
                <div className="stat-item">
                    <label>Avg Error:</label>
                    <span>{batchStats?.avgError?.toFixed(4) || '0.0000'}</span>
                </div>
                <div className="stat-item">
                    <label>Variance:</label>
                    <span>{batchStats?.variance?.toFixed(4) || '0.0000'}</span>
                </div>
                <div className="stat-item">
                    <label>Grad Magnitude:</label>
                    <span>{batchStats?.gradientMagnitude?.toFixed(4) || '0.0000'}</span>
                </div>
            </div>
        </div>
    );
}

export default BatchProgressIndicator; 