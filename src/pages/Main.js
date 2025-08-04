import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import meme1 from '../assets/meme1.png'
import meme2 from '../assets/meme2.png'
import meme3 from '../assets/meme3.png'
import meme4 from '../assets/meme4.png'
import meme5 from '../assets/meme5.png'
import meme6 from '../assets/meme6.png'
import faqs from '../assets/FAQs.json';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const Main = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [memes, setMemes] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

  const filteredMemes = memes.filter((meme) =>
    meme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="bg-gray-100 text-gray-800">
        <Navbar />
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.8 }}
        className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white"
      >
        <h1 className="text-5xl font-bold mb-4">Turn Any Topic into a Meme</h1>
        <p className="text-xl mb-6 max-w-xl">Just type a topic, pick a template, and our AI does the rest.</p>
        <div className="flex gap-4">
          <button className="bg-white text-indigo-600 font-semibold px-6 py-2 rounded-xl">Generate Meme</button>
          <button onClick={() => setIsOpen(true)} className="border border-white text-white px-6 py-2 rounded-xl">Explore Templates</button>
        </div>
      </motion.section>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-black/80 rounded-2xl shadow-2xl w-full max-w-3xl p-6 sm:p-8 transition-all duration-300 ease-in-out transform scale-100">
            <div className="flex justify-between items-center border-b border-blue-100 pb-4 mb-4">
              <h2 className="text-2xl font-semibold text-blue-700">Choose a Meme Template</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-600 hover:text-blue-800 text-2xl font-bold transition duration-200"
                aria-label="Close"
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
                className="w-full px-4 py-2 border font-semibold bg-blue-200 border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto">
              {filteredMemes.map((meme, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-2 bg-blue-50 hover:bg-blue-200 hover:scale-105 rounded-lg transition duration-200 shadow-sm"
                >
                  <img
                    src={meme.url}
                    alt="template"
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <p className="text-sm text-blue-500 font-medium text-center">{meme.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* How it Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-10">How Memeify Works</h2>
          <div className="grid md:grid-cols-3 gap-10 text-left">
            {[
              {
                title: '1. Enter a Topic',
                desc: 'Type anything – like “Monday mood” or “office meetings”.'
              },
              {
                title: '2. Choose Template',
                desc: 'AI gives meme captions, and you pick a template.'
              },
              {
                title: '3. Customize & Download',
                desc: 'Edit text, position, font – then download or share.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="p-6 bg-gray-50 rounded-xl shadow-md"
              >
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Memes Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-10">Popular Memes Made with Memeify</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { url: meme1, caption: 'When you open Memeify for the first time' },
              { url: meme2, caption: 'That Monday morning vibe 💤' },
              { url: meme3, caption: 'AI did not come to play 😎' },
              { url: meme4, caption: 'Me trying to be productive' },
              { url: meme5, caption: 'When the template fits too well' },
              { url: meme6, caption: 'Just one more meme, I swear!' }
            ].map((meme, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
              <div className="w-full aspect-[4/3] overflow-hidden b g-gray-200">
                <img
                  src={meme.url}
                  alt={`Meme ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 text-left">
                <p className="font-medium text-gray-700">{meme.caption}</p>
              </div>
            </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-gradient-to-b from-gray-700 to-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl text-white font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="max-w-xl mx-auto mt-10">
            {faqs.map((faq, index) => (
              <div key={index} className="border bg-blue-200 rounded-lg mb-2 overflow-hidden">
            {/* Question */}
              <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex justify-between items-center px-5 py-4 bg-blue-200 hover:bg-blue-300 text-left"
                  >
                  <span className="font-bold text-md text-gray-800 flex">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-600 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Animated Answer */}
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: 'auto' },
                      collapsed: { opacity: 0, height: 0 }
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="px-5 overflow-hidden text-gray-700 bg-white"
                  >
                    <div className="py-4 flex items-start">
                      <p className="text-base text-gray-700">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>


      {/* Final CTA */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="py-16 bg-indigo-700 text-white text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Start Memeifying Your Ideas</h2>
        <p className="text-lg mb-6">Login to start memeifying your ideas instantly.</p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white text-indigo-700 font-semibold px-6 py-2 rounded-xl">Try Memeify Now</button>
      </motion.section>
    </div>
  );
};

export default Main;
