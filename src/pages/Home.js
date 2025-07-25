import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import CaptionGenerator from '../components/CaptionGenerator';
import CaptionSelector from '../components/CaptionSelector';
import Navbar from '../components/Navbar';

const Home = ({ user, selectedMeme, setSelectedMeme, selectedCaption, setSelectedCaption }) => {

const [memes, setMemes] = useState([]);
const [captions, setCaptions] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [topic, setTopic] = useState('');
const [generatedMeme, setGeneratedMeme] = useState('');


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
  
  const generateMeme = async () => {
    if(!topic.trim()) {
      toast.error("Please enter a topic first");
      return;
    }

    try {
      const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY;
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `Generate a funny meme image about "${topic}". Use a cartoon or exaggerated art style. Make it humorous, expressive, and visually engaging. Add a clever or ironic twist to make people laugh. No text needed in the image.`,
          n: 1,
          size: "1024x1024"
        }),
      });

      const data = await response.json();
      const memeUrl = data.data[0]?.url;
      if(memeUrl){
        setGeneratedMeme(memeUrl);
      } else {
        toast.error("Failed to generate meme!");
      }
    } catch(err) {
      console.log("Meme Generation Error: ", err);
      toast.error("Error in Meme Generation");
    }  
  }

  const handleFileChange = (e) => {
    try{
      const file = e.target.files[0];
      setSelectedMeme(file);
      toast.success("Image upload successfully...");
    }catch(err){
      toast.error("Error in Image upload!")
      console.log("Upload Err: ", err);
    }
  }

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
        <Navbar user={user}/>
        
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
          </div>
        </div>
        <div>
          <p>Upload Template</p>
            <input type="file" onChange={(e) => handleFileChange(e)} />
            <img 
              src={
                selectedMeme 
                ? selectedMeme.url || URL.createObjectURL(selectedMeme) 
                : ""
              }  
              alt="Selected Meme" 
            />
        </div>
        <div>
          <p>Generate MEME using AI</p>
          <input 
            className='w-full text-lg'
            type="text"
            placeholder="Enter meme topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button onClick={generateMeme}>Generate Meme</button>
          {generatedMeme && (
            <div className="mt-4 flex flex-col items-center">
              <p className="font-semibold text-purple-700">Generated Meme:</p>
              <img src={generatedMeme} alt="AI Meme" className="w-full max-w-md rounded-xl shadow-lg mt-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
