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
import History from './pages/History'
import ForgotPassword from './components/ForgotPassword';
import MemeMaker from './pages/MemeMaker';


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
        <Route path='/preview' element={<Preview selectedCaption={selectedCaption} selectedMeme={selectedMeme} user={user}/>} />
        <Route path="/history" element={<History user={user} />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/mememaker" element={<MemeMaker />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
    
  );
}

export default App;
