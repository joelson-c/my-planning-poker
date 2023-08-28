import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import SocketClientContext from './context/SocketClientContext.tsx';
import UserDataContext from './context/UserDataContext.tsx';
import RoomContextProvider from './context/RoomContext.tsx';
import { NextUIProvider } from '@nextui-org/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserDataContext>
      <SocketClientContext>
        <RoomContextProvider>
          <NextUIProvider>
            <App />
          </NextUIProvider>
        </RoomContextProvider>
      </SocketClientContext>
    </UserDataContext>
  </React.StrictMode>,
)
