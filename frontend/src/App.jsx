import './App.css'
import { Footer } from './components/Footer'
import { Navabar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserPage } from './pages/UserPage';
import { UserProfilePage } from './pages/UserProfilePage';

function App() {
  return (
    <div className='bg-background'>
      <Router>
        <Navabar />
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/users' element={<UserPage/>}></Route>
          <Route path="/profile/:handle" element={<UserProfilePage />} />
        </Routes>
        <Footer />
      </Router>

    </div>
  )
}

export default App
