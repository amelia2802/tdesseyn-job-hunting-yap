import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <div className="w-full min-h-screen m-0 p-0 bg-brand-secondary-light">
      <Navbar />
      <Home />
    </div>
  )
}

export default App
