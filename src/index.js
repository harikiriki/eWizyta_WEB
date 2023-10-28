import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './components/App';
import { BrowserRouter } from 'react-router-dom';

const root = document.getElementById('root'); // Pobierz element, do którego chcesz zrenderować aplikację
const reactRoot = createRoot(root);

reactRoot.render(
        <BrowserRouter>
            <App />
        </BrowserRouter>
);
