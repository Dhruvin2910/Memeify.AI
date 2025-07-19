import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Signup from './pages/Signup';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Preview from './pages/Preview';


function App() {
  const [user, setUser] = useState(null);
  const [selectedMeme, setSelectedMeme] = useState('');
  const [selectedCaption, setSelectedCaption] = useState('');
  // console.log(selectedMeme);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  },[]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home user={user} selectedCaption={selectedCaption} setSelectedCaption={setSelectedCaption} selectedMeme={selectedMeme} setSelectedMeme={setSelectedMeme}/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/preview' element={<Preview selectedCaption={selectedCaption} selectedMeme={selectedMeme}/>} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
    
  );
}

export default App;
