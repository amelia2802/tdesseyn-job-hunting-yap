import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { parallaxConfig } from "./components/animations/parallaxConfig";
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import TipsnTricks from './pages/TipsnTricks';
import About from "./pages/About";
import './App.css'

function App() {
  const [init,setInit] = useState(false);
  
      useEffect(()=>{
          initParticlesEngine( async (engine)=>{
              await loadSlim(engine);
          }).then(()=>setInit(true));
      }, []);

  return (
    <div className="relative w-full min-h-screen m-0 p-0 bg-brand-secondary-light">
      {init && (
                <Particles
                    id="tsparticles"
                    options={parallaxConfig}
                    className="absolute inset-0 z-0"
                />
            )}
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tips" element={<TipsnTricks />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
