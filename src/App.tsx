import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { auth } from './firebase'
import Home from './pages/Home'
import Login from './pages/Login'
import RecordStep1 from './pages/RecordStep1'
import RecordStep2 from './pages/RecordStep2'
import NoteDetail from './pages/NoteDetail'
import { RecordProvider } from './context/RecordContext'

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <RecordProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/record/step1" element={user ? <RecordStep1 /> : <Navigate to="/login" />} />
        <Route path="/record/step2" element={user ? <RecordStep2 /> : <Navigate to="/login" />} />
        <Route path="/note/:id" element={user ? <NoteDetail /> : <Navigate to="/login" />} />
      </Routes>
    </RecordProvider>
  )
}

export default App
