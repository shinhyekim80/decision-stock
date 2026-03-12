import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RecordStep1 from './pages/RecordStep1'
import RecordStep2 from './pages/RecordStep2'
import NoteDetail from './pages/NoteDetail'
import { RecordProvider } from './context/RecordContext'

function App() {
  return (
    <RecordProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/record/step1" element={<RecordStep1 />} />
        <Route path="/record/step2" element={<RecordStep2 />} />
        <Route path="/note/:id" element={<NoteDetail />} />
      </Routes>
    </RecordProvider>
  )
}

export default App
