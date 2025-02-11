import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HeaderProfile from './Components/HeaderProfile'
import ProfileView from './Views/ProfileView'
import CreateGroupModal from './Components/CreateGroup'

function App() {


  return (
    <div className='w-screen mx-0 px-0'>
 
      <CreateGroupModal/>
    </div>
  )
}

export default App
