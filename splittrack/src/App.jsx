import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HeaderProfile from './Components/HeaderProfile'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <HeaderProfile />

    </div>
  )
}

export default App
