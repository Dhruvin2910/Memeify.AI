import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import meme1 from '../assets/meme1.png'
import meme2 from '../assets/meme2.png'
import meme3 from '../assets/meme3.png'
import meme4 from '../assets/meme4.png'
import meme5 from '../assets/meme5.png'
import meme6 from '../assets/meme6.png'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const Main = () => {
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
          <button className="border border-white text-white px-6 py-2 rounded-xl">Explore Templates</button>
        </div>
      </motion.section>

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
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <img src={meme.url} alt={`Meme ${index + 1}`} className="w-full h-64 object-cover" />
                <div className="p-4 text-left">
                  <p className="font-medium">{meme.caption}</p>
                </div>
              </motion.div>
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
        <p className="text-lg mb-6">No login needed. Get started in seconds.</p>
        <button className="bg-white text-indigo-700 font-semibold px-6 py-2 rounded-xl">Try Memeify Now</button>
      </motion.section>
    </div>
  );
};

export default Main;
