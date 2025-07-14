import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
import axios from 'axios';
import { toast } from 'react-toastify';

const CaptionGenerator = ({ onSubmit }) => {
  const [input, setInput] = useState('');
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY;
  const handleGenerate = async () => {
    setLoading(true);

    try{
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Give me 5 funny meme captions about: ${input}`,
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
      const captionList = text.split("\n").filter(line => line.trim() !== "").map(line => line.replace(/^\d+\.?\s*/, ""));
      setCaptions(captionList);
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
    <div>
      <div>
        <input
          type="text"
          placeholder='Type something...'
          value={input}
          onChange={handleInputChange}
        />
        <button
          disabled={!buttonEnabled}
          onClick={handleGenerate}
        >
          Generate Captions
        </button>
      </div>
      <div>
        {captions.map((cap, index) => (
          <p key={index}>{cap}</p>
        ))}
      </div>
    </div>
  );
};

export default CaptionGenerator; 