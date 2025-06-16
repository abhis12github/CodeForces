import './App.css'
import { Footer } from './components/Footer'
import { Navabar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className='bg-background'>
      <Router>
        <Navabar />
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
        </Routes>
        <Footer />
      </Router>

    </div>
  )
}

export default App
