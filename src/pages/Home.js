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
    <div>
      <Navbar user={user} />
      <div className='w-full flex flex-col mt-4 text-center'>
        <h1 className='text-3xl font-bold font-serif'>Welcome to Memeify</h1>
        <h3 className='text-xl font-serif'>Create Memes Instantly Using AI-Generated Captions & Templates</h3>
      </div>
      <div className='flex mx-5 mt-5'>
        <div className='w-full border-r border-white border-solid mr-1'>
          <p className='text-2xl font-semibold flex justify-center'>Caption</p>
          <div>
          <input
            type="text"
            placeholder="Enter any theme or topic for your meme"
            value={topic}
            maxLength={300}
            onChange={(e) => setTopic(e.target.value)}
          />
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
          >
            {isRegenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
          <p className='flex justify-center w-full text-xl font-bold font-serif my-5 text-white text-opacity-50'>OR</p>
          <label>Enter caption manually</label>
          <textarea 
            onChange={(e) => setSelectedCaption(e.target.value)}
            value={selectedCaption}
            rows={2}
            placeholder='Write caption here...'
            className='bg-white bg-opacity-10 text-white font-semibold px-2 py-1 m-2 rounded-md shadow-sm w-5/6 focus:outline-none focus:ring-2 focus:ring-white'
          />
        </div>
        <div className='w-full border-l border-white border-solid'>
          <p className='text-2xl font-semibold flex justify-center'>Templetes</p>
        </div>
      </div>      <div></div>
      <div>
        <h1>Generate memes with AI</h1>
        <p>Generate memes using the AI meme generator</p>
      </div>

      <div>
        
        <div>
          <button onClick={() => setTopic('When you realize it’s Monday again')}>Try sample text</button>
          <span>{topic.length} / 300</span>
        </div>
      </div>

      <div>
        <label>
          <span>Upload or Drag & Drop</span>
          <input type="file" onChange={handleFileChange} />
        </label>
        <span>OR</span>
        <button onClick={() => setShowTemplates(true)}>
          <span>Search templates</span>
        </button>
      </div>

      {selectedMeme && !selectedMeme.url && (
        <div>
          <img src={URL.createObjectURL(selectedMeme)} alt="Selected Meme" />
          {selectedCaption && (
            <div>
              <span>Selected Caption: </span>{selectedCaption}
            </div>
          )}
        </div>
      )}

      {selectedMeme && selectedMeme.url && (
        <div>
          <img src={selectedMeme.url} alt="Selected Meme" />
          {selectedCaption && (
            <div>
              <span>Selected Caption: </span>{selectedCaption}
            </div>
          )}
        </div>
      )}

      {showTemplates && (
        <div>
          <div>
            <button onClick={() => setShowTemplates(false)}>&times;</button>
            <h2>Choose a Meme Template</h2>
            <input
              type="text"
              placeholder="Search memes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div>
              {filteredMemes.map((meme, index) => (
                <div
                  onClick={() => { handleMemeSelect(meme); setShowTemplates(false); }}
                  key={index}
                >
                  <img src={meme.url} alt="template" />
                  <span>{meme.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isCaptionModalOpen && (
        <div>
          <div>
            <button onClick={() => setIsCaptionModalOpen(false)}>&times;</button>
            <h2>Choose a Caption</h2>
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
              onClick={regenerateCaptions}
              disabled={isRegenerating}
            >
              {isRegenerating ? 'Regenerating...' : 'Regenerate Captions'}
            </button>
          </div>
        </div>
      )}

      {generatedMeme && (
        <div>
          <p>Generated Meme:</p>
          <img src={generatedMeme} alt="AI Meme" />
        </div>
      )}

      <div>
        <h2>About AI Meme Generator</h2>
        <p>Our AI Meme Generator helps you create custom memes instantly from any topic. Whether you're looking to make marketing memes for your business or just want to share a laugh with friends, our tool makes it easy.</p>
      </div>
    </div>
  )
}

export default Home
