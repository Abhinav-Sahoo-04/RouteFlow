import './App.css'
import {Routes,Route} from "react-router-dom"
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
function App() {
  return (
    <>
      <Routes>
        <Route path='/*' element={<Login/>} />
        <Route path='homepage/' element={<Home/>} />
        <Route path='dashboard/' element={<Dashboard/>} />
      </Routes>
      
    </>
  )
}

export default App
