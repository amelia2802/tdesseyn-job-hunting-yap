import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import TipsnTricks from './pages/TipsnTricks';
import './App.css'

function App() {
  return (
    <div className="w-full min-h-screen m-0 p-0 bg-brand-secondary-light">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tips" element={<TipsnTricks />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
