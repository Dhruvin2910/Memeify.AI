import React, { useState } from 'react'

const CaptionSelector = ({ captions, selectedCaption, setSelectedCaption, onUseCaption }) => {
    const [editIndex, setEditIndex] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleSelect = (index) => {
        setEditIndex(index);
        setEditValue(captions[index]);
    }

    const handleCancel = () => {
        setEditIndex(null);
        setEditValue('');
    }

    const handleUse = () => {
        if (editValue.trim() !== '') {
            onUseCaption(editValue.trim());
            setEditIndex(null);
            setEditValue('');
        }
    }

    return (
        <div className="w-full flex flex-col gap-4 mt-2">
          {captions.length > 0 && (
            <h3 className="text-lg font-bold text-purple-700 mb-2">Generated Captions</h3>
          )}
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1 mb-4">
            {captions.length === 0 && (
              <div className="text-center text-gray-400 py-8 font-semibold">Generate Captions first</div>
            )}
            {captions && captions.map((cap, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center bg-yellow-50 rounded-xl shadow p-4 border border-yellow-200 gap-2 sm:gap-4">
                {editIndex === index ? (
                  <>
                    <input
                      className="flex-1 border-2 border-pink-300 rounded-lg px-3 py-2 text-base mb-2 sm:mb-0 w-full"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
                      <button
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow text-sm font-semibold border-2 border-gray-300 w-full sm:w-auto"
                        onClick={handleCancel}
                      >Cancel</button>
                      <button
                        className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-4 py-2 rounded-lg shadow text-sm font-semibold border-2 border-yellow-300 w-full sm:w-auto"
                        onClick={handleUse}
                      >Use Caption</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="flex-1 text-gray-800 text-base font-medium text-center sm:text-left break-words w-full mb-2 sm:mb-0">{cap}</p>
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto justify-center sm:justify-end">
                      <button className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform text-sm font-semibold border-2 border-pink-200 w-full sm:w-auto" onClick={() => handleSelect(index)}>Edit</button>
                      <button className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform text-sm font-semibold border-2 border-yellow-300 w-full sm:w-auto" onClick={() => onUseCaption(cap)}>Use Caption</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-yellow-200 my-2"></div>
          <span className="text-xs text-gray-500 mt-1">Tip: You can edit or use any caption above, or write your own!</span>
        </div>
      )
}

export default CaptionSelector
