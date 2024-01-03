import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from "react-router-dom";
import SocketClientContext from './context/SocketClientContext';
import BrowserRouter from './BrowserRouter';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SocketClientContext>
            <RouterProvider router={BrowserRouter} />
        </SocketClientContext>
    </React.StrictMode>,
)
