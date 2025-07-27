import React from 'react'

const CaptionSelector = ({ captions, selectedCaption, setSelectedCaption, onUseCaption }) => {
    return (
        <div className="w-full flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1 mb-4">
            {captions.length === 0 && (
              <div className="text-center text-gray-400 py-8 font-semibold">Generate Captions first</div>
            )}
            {captions && captions.map((cap, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center bg-yellow-50 rounded-xl shadow p-4 border border-yellow-100 gap-2 sm:gap-4">
                <p className="flex-1 text-gray-800 text-base font-medium text-center sm:text-left break-words w-full mb-2 sm:mb-0">{cap}</p>
                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <button 
                    className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform text-sm font-semibold border-2 border-blue-100 w-full sm:w-auto"
                    onClick={() => onUseCaption(cap)}
                  >Use Caption</button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-yellow-200 my-2"></div>
          <span className="text-xs text-gray-500 mt-1">Tip: You can use any caption above, or write your own!</span>
        </div>
      )
}

export default CaptionSelector
