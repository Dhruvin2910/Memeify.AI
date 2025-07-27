import React from 'react'
import loading from '../assets/loading.gif'

const Spinner = () => {
  return (
    <div>
      <img src={loading} alt="Loading..." className="w-32 h-32 rounded-lg"/>
    </div>
  )
}

export default Spinner
