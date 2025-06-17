import './App.css'
import { Footer } from './components/Footer'
import { Navabar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserPage } from './pages/UserPage';

function App() {
  return (
    <div className='bg-background'>
      <Router>
        <Navabar />
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/users' element={<UserPage/>}></Route>
        </Routes>
        <Footer />
      </Router>

    </div>
  )
}

export default App
