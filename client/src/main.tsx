import React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { RouterProvider } from "react-router-dom";
import SocketClientContext from './context/SocketClientContext.tsx';
import LocalUserDataContext from './context/LocalUserDataContext.tsx';
import RoomContextProvider from './context/RoomContext.tsx';
import BrowserRouter from './BrowserRouter.tsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocalUserDataContext>
      <SocketClientContext>
        <RoomContextProvider>
          <NextUIProvider>
            <RouterProvider router={BrowserRouter} />
          </NextUIProvider>
        </RoomContextProvider>
      </SocketClientContext>
    </LocalUserDataContext>
  </React.StrictMode>,
)
