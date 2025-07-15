import React from 'react'

const CaptionSelector = ({ captions, selectedCaption, setSelectedCaption }) => {
    
    const handleSelect = (index) => {
        const caption = captions[index];
        setSelectedCaption(caption)
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        // You can handle meme generation here or lift this up as well
    }
  return (
    <div>
      {captions && captions.map((cap, index) => (
        <div key={index} className='flex'>
            <p>{cap}</p>
            <button className='mx-4' onClick={() => handleSelect(index)}>Edit</button>
            <button>Select</button>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
            type="text"
            placeholder='Enter text to generate meme...'
            value={selectedCaption}
            onChange={(e) => setSelectedCaption(e.target.value)}
      />
      <button type='submit'>Generate Meme</button>
      </form>
      
    </div>
  )
}

export default CaptionSelector
