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
    <div>
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.8 }}
      >
        <h1>Turn Any Topic into a Meme</h1>
        <p>Just type a topic, pick a template, and our AI does the rest.</p>
        <div>
          <button>Generate Meme</button>
          <button>Explore Templates</button>
        </div>
      </motion.section>

      {/* How it Works */}
      <section>
        <div>
          <h2>How Memeify Works</h2>
          <div>
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
              >
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Memes Section */}
      <section>
        <div>
          <h2>Popular Memes Made with Memeify</h2>
          <div>
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
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div>
                  <img
                    src={meme.url}
                    alt={`Meme ${index + 1}`}
                  />
                </div>
                <div>
                  <p>{meme.caption}</p>
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
      >
        <h2>Start Memeifying Your Ideas</h2>
        <p>No login needed. Get started in seconds.</p>
        <button>Try Memeify Now</button>
      </motion.section>
    </div>
  );
};

export default Main;
