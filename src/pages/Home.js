import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import CaptionGenerator from '../components/CaptionGenerator';
import CaptionSelector from '../components/CaptionSelector';

const Home = ({ user, selectedMeme, setSelectedMeme, selectedCaption, setSelectedCaption}) => {

const [username, setUsername] = useState('');
const [memes, setMemes] = useState([]);
const [captions, setCaptions] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const navigate = useNavigate();


const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false);
const [isRegenerating, setIsRegenerating] = useState(false);
const [lastUsedCaption, setLastUsedCaption] = useState('');

  useEffect(() => {
    const fetchMemes = async () => {
      fetch("https://api.imgflip.com/get_memes")
      .then(res => res.json())
      .then(data => {
        const memes = data.data.memes;
        setMemes(memes);
      })
    }
    fetchMemes();
  },[])

  //fetch username on user change
  useEffect(() => {   
    const fetchUsername = async () => {
      if(user){
        const useDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(useDocRef);

        if(userSnap.exists()) {
          setUsername(userSnap.data().username);
        }
      }
    }
    fetchUsername();
  },[user])

  const handleLogin = () => {
    navigate('/login');
  }

  const handleLogout = async () => {
    try{
      await signOut(auth);
      toast.success("User Logged out successfully!");
      navigate('/login');
    }catch(err){
      console.log(err);
    }
  }

  // Function to regenerate captions (reuse CaptionGenerator's logic)
  const regenerateCaptions = async () => {
    setIsRegenerating(true);
    try {
      // Use the last input or a default prompt
      const input = selectedCaption || 'funny meme';
      const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY;
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Give me 5 funny meme captions about: ${input}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        })
      });
      const data = await response.json();
      const text = data.choices[0].message.content;
      const captionList = text
        .split("\n")
        .filter(line => line.trim() !== "")
        .map(line =>
          line
            .replace(/^\d+\.?\s*/, "")
            .replace(/^"|"$/g, "")
            .replace(/\.$/, "")
            .trim()
        );
      setCaptions(captionList);
    } catch (err) {
      toast.error("Failed to regenerate captions");
    }
    setIsRegenerating(false);
  };

  const handleMemeSelect = (meme) => {
    setSelectedMeme(meme);
    console.log(selectedMeme);
  }

  const filteredMemes = memes.filter((meme) =>
    meme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  return (
    <div className={`min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 flex flex-col ${isCaptionModalOpen ? 'overflow-hidden' : ''}`}>
      {/* Modal Overlay */}
      {isCaptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur background */}
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={() => setIsCaptionModalOpen(false)}></div>
          {/* Modal content */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl flex flex-col items-center border-4 border-yellow-400">
            <button className="absolute top-2 right-2 text-xl font-bold text-gray-400 hover:text-pink-500" onClick={() => setIsCaptionModalOpen(false)}>&times;</button>
            <CaptionSelector
              captions={captions}
              selectedCaption={selectedCaption}
              setSelectedCaption={setSelectedCaption}
              onUseCaption={(caption) => {
                setSelectedCaption(caption);
                setLastUsedCaption(caption);
                setIsCaptionModalOpen(false);
              }}
            />
            <button
              className="mt-6 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white px-6 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold border-2 border-yellow-300 disabled:opacity-50"
              onClick={regenerateCaptions}
              disabled={isRegenerating}
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate Captions'}
            </button>
          </div>
        </div>
      )}
      {/* Blur main content when modal is open */}
      <div className={`${isCaptionModalOpen ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        {/* Navbar */}
        <nav className="w-full flex items-center justify-between px-8 py-4 bg-white/80 shadow-md border-b-4 border-yellow-400 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <img src="https://i.imgflip.com/30b1gx.jpg" alt="logo" className="w-10 h-10 rounded-full border-2 border-pink-400 shadow" />
            <span className="text-xl font-extrabold text-purple-700 tracking-tight">Memeify.AI</span>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-purple-700">Hello, {username}</span>
              <button onClick={handleLogout} className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold border-2 border-yellow-300">Logout</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold border-2 border-yellow-300">Login</button>
          )}
        </nav>
        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row gap-8 px-4 md:px-16 py-8">
          {/* Caption Generator Section */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="bg-white/90 rounded-xl shadow-2xl p-6 w-full max-w-md border-4 border-dashed border-yellow-400 relative flex flex-col items-center">
              <h2 className="text-2xl font-extrabold text-purple-700 mb-2 text-center">Generate Your Meme Caption</h2>
              <p className="text-sm text-gray-600 mb-4 text-center">Unleash your creativity! Generate and use captions for your memes below.</p>
              <CaptionGenerator
                selectedCaption={selectedCaption}
                setSelectedCaption={setSelectedCaption}
                captions={captions}
                setCaptions={setCaptions}
                onCaptionsGenerated={() => setIsCaptionModalOpen(true)}
              />
              <button
                className="mt-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold border-2 border-yellow-300"
                onClick={() => setIsCaptionModalOpen(true)}
              >
                Show Captions
              </button>
              {lastUsedCaption && (
                <div className="mt-3 w-full max-w-md bg-purple-50 border-l-4 border-purple-400 p-3 rounded shadow text-purple-800 font-semibold text-center">
                  <span>Selected Caption: </span>{lastUsedCaption}
                </div>
              )}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border-2 border-pink-300 text-pink-600 font-bold text-xs flex items-center gap-2">
                <span role="img" aria-label="meme">🧠</span> Memes make everything better!
              </div>
            </div>
          </div>
          {/* Meme Templates Section */}
          <div className="w-full md:w-2/3 flex flex-col items-center">
            <h2 className="text-2xl font-extrabold text-purple-700 mb-4 text-center">Choose a Meme Template</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">Pick your favorite meme template to start creating!</p>
            <input
              type="text"
              placeholder="Search memes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 px-4 py-2 border border-yellow-300 rounded-lg w-full max-w-sm shadow focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto p-2 bg-white/70 rounded-xl shadow-inner border-2 border-yellow-200 w-full">
              {filteredMemes.map((meme, index) => (
                <div
                  onClick={() => handleMemeSelect(meme)}
                  key={index}
                  className={`flex flex-col items-center bg-white rounded-lg shadow p-2 hover:scale-105 transition-transform cursor-pointer border  ${selectedMeme && selectedMeme.id === meme.id ? 'border-4 border-purple-500 ring-2 ring-purple-300' : 'border-pink-200'}`}
                >
                  <img src={meme.url} alt="template" className="w-full h-32 object-cover rounded mb-2"/>
                  <span className="text-xs text-gray-700 font-semibold text-center truncate w-full">{meme.name}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/preview')}>Preview</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
