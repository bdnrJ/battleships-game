import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "./styles/index.scss"
import { RoomProvider } from './context/RoomContext.tsx'
import { UserProvider } from './context/UserContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RoomProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </RoomProvider>
  </React.StrictMode>,
)


//TODO
// - my baord visible where enemy hits, 
// timer for each round