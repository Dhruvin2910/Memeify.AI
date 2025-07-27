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
  const [showTemplates, setShowTemplates] = useState(false);

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
  }, [])

  const regenerateCaptions = async () => {
    setIsRegenerating(true);
    try {
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
    if (!topic.trim()) {
      toast.error("Please enter a topic first");
      return;
    }

    try {
      const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY;
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
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
      if (memeUrl) {
        setGeneratedMeme(memeUrl);
      } else {
        toast.error("Failed to generate meme!");
      }
    } catch (err) {
      console.log("Meme Generation Error: ", err);
      toast.error("Error in Meme Generation");
    }
  }

  const handleFileChange = (e) => {
    try {
      const file = e.target.files[0];
      setSelectedMeme(file);
      toast.success("Image upload successfully...");
    } catch (err) {
      toast.error("Error in Image upload!")
      console.log("Upload Err: ", err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar user={user} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
            Welcome to Memeify
          </h1>
          <h3 className="text-xl text-gray-300 font-light max-w-2xl mx-auto">
            Create Memes Instantly Using AI-Generated Captions & Templates
          </h3>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Caption Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Caption Generator</h2>
            
            {/* AI Caption Generation */}
            <div className="space-y-4 mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter any theme or topic for your meme"
                  value={topic}
                  maxLength={300}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute right-3 top-3 text-xs text-gray-400">
                  {topic.length}/300
                </div>
              </div>
              
              <button
                onClick={async () => {
                  setIsRegenerating(true);
                  try {
                    const input = topic || 'funny meme';
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
                    setIsCaptionModalOpen(true);
                  } catch (err) {
                    toast.error("Failed to generate captions");
                  }
                  setIsRegenerating(false);
                }}
                disabled={isRegenerating}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isRegenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate AI Captions'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="px-4 text-white/60 font-medium">OR</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            {/* Manual Caption Input */}
            <div className="space-y-4">
              <label className="block text-white font-semibold text-lg">Enter Caption Manually</label>
              <textarea 
                onChange={(e) => setSelectedCaption(e.target.value)}
                value={selectedCaption}
                rows={3}
                placeholder='Write your caption here...'
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Templates Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Meme Templates</h2>
            
            {/* AI Meme Generation */}
            <div className="space-y-6 mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Generate AI Memes</h3>
                <p className="text-gray-300 mb-4">Create unique memes using AI image generation</p>
                <button
                  onClick={generateMeme}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Generate AI Meme
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="px-4 text-white/60 font-medium">OR</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            {/* Upload & Templates */}
            <div className="space-y-4">
              <div className="text-center">
                <label className="block text-white font-semibold text-lg mb-4">Upload Your Image</label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-6 hover:border-pink-400 transition-colors duration-200">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-white font-medium">Click to upload or drag & drop</p>
                      <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="text-center">
                <span className="text-white/60 font-medium">OR</span>
              </div>

              <button 
                onClick={() => setShowTemplates(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Browse Templates
              </button>
            </div>
          </div>
        </div>

        {/* Sample Text Button */}
        <div className="text-center mb-8">
          <button 
            onClick={() => setTopic('When you realize it\'s Monday again')}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-6 rounded-full transition-all duration-200 border border-white/30 hover:border-white/50"
          >
            Try Sample Text
          </button>
        </div>

        {/* Selected Meme Preview */}
        {(selectedMeme || generatedMeme) && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Preview</h3>
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1">
                {selectedMeme && !selectedMeme.url && (
                  <img 
                    src={URL.createObjectURL(selectedMeme)} 
                    alt="Selected Meme" 
                    className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
                  />
                )}
                {selectedMeme && selectedMeme.url && (
                  <img 
                    src={selectedMeme.url} 
                    alt="Selected Meme" 
                    className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
                  />
                )}
                {generatedMeme && (
                  <img 
                    src={generatedMeme} 
                    alt="AI Generated Meme" 
                    className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
                  />
                )}
              </div>
              {selectedCaption && (
                <div className="flex-1 text-center lg:text-left">
                  <h4 className="text-xl font-semibold text-white mb-2">Selected Caption:</h4>
                  <p className="text-gray-300 text-lg italic">"{selectedCaption}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">About AI Meme Generator</h2>
          <p className="text-gray-300 text-lg leading-relaxed text-center max-w-4xl mx-auto">
            Our AI Meme Generator helps you create custom memes instantly from any topic. Whether you're looking to make marketing memes for your business or just want to share a laugh with friends, our tool makes it easy.
          </p>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Choose a Meme Template</h2>
              <button 
                onClick={() => setShowTemplates(false)}
                className="text-white hover:text-red-400 text-2xl font-bold transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search memes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMemes.slice(0, 20).map((meme, index) => (
                <div
                  onClick={() => { handleMemeSelect(meme); setShowTemplates(false); }}
                  key={index}
                  className="bg-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-all duration-200 transform hover:scale-105 border border-white/20"
                >
                  <img 
                    src={meme.url} 
                    alt="template" 
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <p className="text-white text-sm font-medium truncate">{meme.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Caption Modal */}
      {isCaptionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Choose a Caption</h2>
              <button 
                onClick={() => setIsCaptionModalOpen(false)}
                className="text-white hover:text-red-400 text-2xl font-bold transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
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
            
            <div className="mt-6 text-center">
              <button
                onClick={regenerateCaptions}
                disabled={isRegenerating}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isRegenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Regenerating...
                  </div>
                ) : (
                  'Regenerate Captions'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
