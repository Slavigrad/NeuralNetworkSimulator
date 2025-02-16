import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Add basename for GitHub Pages subfolder */}
        <BrowserRouter basename="/NeuralNetworkSimulator/">
            <App />
        </BrowserRouter>
    </StrictMode>,
);
