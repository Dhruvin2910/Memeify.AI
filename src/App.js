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
import '@fortawesome/fontawesome-free/css/all.min.css';
import Main from './pages/Main';



function App() {
  const [user, setUser] = useState(null);
  const [selectedMeme, setSelectedMeme] = useState('');
  const [selectedCaption, setSelectedCaption] = useState('');
  // console.log(selectedMeme);
  const [caption, setCaption] = useState(selectedCaption);
  const [fontSize, setFontSize] = useState(30);
  const [textPosition, settextPosition] = useState({ x: 250, y: 40 });
  const [width, setWidth] = useState(300);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [fontColor, setFontColor] = useState('white');
  const [strokeColor, setStrokeColor] = useState('Black');
  const [createdAt, setCreatedAt] = useState('');
  const [memeId, setMemeId] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  },[]);

  // Sync caption with selectedCaption when it changes
  useEffect(() => {
    setCaption(selectedCaption);
  }, [selectedCaption]);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home user={user} selectedCaption={selectedCaption} setSelectedCaption={setSelectedCaption} selectedMeme={selectedMeme} setSelectedMeme={setSelectedMeme}/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/preview' element={<Preview 
          selectedCaption={selectedCaption} 
          selectedMeme={selectedMeme} 
          user={user}
          caption={caption} setCaption={setCaption}
          fontSize={fontSize} setFontSize={setFontSize}
          fontColor={fontColor} setFontColor={setFontColor}
          fontFamily={fontFamily} setFontFamily={setFontFamily}
          textPosition={textPosition} settextPosition={settextPosition}
          width={width} setWidth={setWidth}
          strokeColor={strokeColor} setStrokeColor={setStrokeColor}
          createdAt={createdAt}
          memeId={memeId}
          />} />
        <Route path="/history" element={<History 
          setCaption={setCaption}
          setFontSize={setFontSize}
          setFontColor={setFontColor}
          setFontFamily={setFontFamily}
          settextPosition={settextPosition}
          setStrokeColor={setStrokeColor}
          setWidth={setWidth}
          setSelectedMeme={setSelectedMeme}
          setCreatedAt={setCreatedAt}
          setMemeId={setMemeId}
        user={user}  />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/mememaker" element={<MemeMaker />} />
        <Route path='/main' element={<Main />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
    
  );
}

export default App;
