import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner'
import { getAuth } from 'firebase/auth';

const CaptionGenerator = ({ onSubmit, selectedCaption, setSelectedCaption, captions, setCaptions, onCaptionsGenerated }) => {
  const [input, setInput] = useState('');
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY;
  const handleGenerate = async () => {
    setLoading(true);

    try{
      const auth = getAuth();
      const user = auth.currentUser;
      if(!user) {
        toast.error("User must be logged in...");
        setLoading(false);
        return;
      }
    }catch(err){
      console.log(err);
    }
    try{
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Give me 5 short and funny meme captions (under 120 characters) about: ${input}. Make them relatable and witty.`
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`
          }
        }
      )
      const text = response.data.choices[0].message.content;
      const captionList = text
  .split("\n")
  .filter(line => line.trim() !== "")
  .map(line => 
    line
      .replace(/^\d+\.?\s*/, "")            // remove "1." or "1) "
      .replace(/^"|"$/g, "")                // remove starting & ending double quotes
      .replace(/\.$/, "")                   // remove period at the end
      .trim()
  );
      setCaptions(captionList);
      if (onCaptionsGenerated) onCaptionsGenerated();
    }catch(err){
      console.log("Error in generating captions", err);
      toast.error("Something went wrong!");
    }
    setLoading(false);
  }

  // Debounce input
  useEffect(() => {
    setButtonEnabled(false);
    const timer = setTimeout(() => {
      if (input.trim() !== '') {
        setButtonEnabled(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [input]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };


  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full flex flex-col sm:flex items-center gap-3 mb-2">
        <input
          type="text"
          placeholder='Type something...'
          value={input}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2 rounded-lg border-2 border-yellow-300 focus:border-pink-400 focus:outline-none bg-yellow-50 placeholder-gray-500 text-lg transition shadow"
        />
        <button
          disabled={!buttonEnabled}
          onClick={handleGenerate}
          className={`mt-2 sm:mt-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition-transform text-lg flex items-center justify-center gap-2 border-2 border-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Generate Captions
        </button>
      </div>
      <div className="w-full flex flex-col items-center">
        {loading && <Spinner />}
      </div>
    </div>
  );
};

export default CaptionGenerator; 