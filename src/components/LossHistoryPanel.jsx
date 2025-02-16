import React from 'react';

function LossHistoryPanel({ lossHistory, lossFunction }) {
    return (
        <div className="loss-history-panel">
            <div className="panel-header">
                <h3>Loss History</h3>
                <span className="loss-function-label">{lossFunction}</span>
            </div>
            <div className="loss-chart">
                {lossHistory.map((loss, index) => (
                    <div 
                        key={index}
                        className="loss-bar"
                        style={{ 
                            height: `${Math.min(100, loss * 100)}%`,
                            backgroundColor: `rgba(255, 0, 0, ${0.3 + loss * 0.7})`
                        }}
                        title={`Error: ${loss.toFixed(4)}`}
                    />
                ))}
            </div>
            <div className="current-loss">
                Current Total Error: {lossHistory[lossHistory.length - 1]?.toFixed(4) || 0}
            </div>
        </div>
    );
}

export default LossHistoryPanel; 