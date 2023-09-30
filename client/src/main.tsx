import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { RouterProvider } from "react-router-dom";
import SocketClientContext from './context/SocketClientContext';
import BrowserRouter from './BrowserRouter';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SocketClientContext>
            <NextUIProvider>
                <RouterProvider router={BrowserRouter} />
            </NextUIProvider>
        </SocketClientContext>
    </React.StrictMode>,
)
