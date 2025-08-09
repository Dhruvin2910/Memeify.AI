import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import faqs from '../assets/FAQs.json';
import { collection, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const Main = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [memes, setMemes] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [userCount, setUserCount] = useState('');
  const [memesList, setMemesList] = useState([]);

  const worksRef = useRef(null);
  const demoRef = useRef(null);
  const faqRef = useRef(null);
  const navigate = useNavigate();

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const fetchAllMemes = async () => {
      try{
        const snapshot = await getDocs(collection(db, "memes"));

        const memesList = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id,
            ...data,
          }
        }).sort((a,b) => (b.likes || 0) - (a.likes || 0));

        setMemesList(memesList);
        console.log(memesList);
      } catch(err){
        console.log("Meme fetch error: ", err);
        toast.error("Error fetching memes");
      }   
    };
  
    fetchAllMemes();
  }, []);
  
  

  useEffect(() => {
    const fetchUserCountFromFirestore = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getCountFromServer(usersRef);
      return snapshot.data().count;
    }
    fetchUserCountFromFirestore().then(setUserCount);
  },[])

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


  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }

  const toggleLike = () => {
    toast.error("Please login to like memes");
  }

  return (
    <div className="bg-gray-100 text-gray-800">
        <Navbar scrollToSection={scrollToSection} refs={{ worksRef, demoRef, faqRef }}/>
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
          <button onClick={() => navigate('/login')} className="bg-white text-indigo-600 font-semibold px-6 py-2 rounded-xl">Login</button>
          <button onClick={() => setIsOpen(true)} className="border border-white text-white px-6 py-2 rounded-xl">Explore Templates</button>
        </div>
      </motion.section>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-black/80 rounded-2xl shadow-2xl w-full max-w-3xl p-6 sm:p-8 transition-all duration-300 ease-in-out transform scale-100">
            <div className="flex justify-between items-center pb-4 mb-4">
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-600 hover:text-blue-800 text-2xl font-bold transition duration-200 right-10 absolute"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto">
              {memes.map((meme, index) => (
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
      <section ref={worksRef} className="py-16 bg-white">
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
      <section ref={demoRef} className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Popular Memes Made with Memeify
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what our community is creating. From relatable moments to viral sensations, 
              discover the endless possibilities of AI-powered meme generation.
            </p>
          </div>
          
          <div>
            {memesList.slice(0, 6).map((meme, index) => (
              <div key={index}>
                <img onDoubleClick={() => toggleLike()} src={meme.templateUrl} alt="" />
                {meme.likes}
                <div className="flex justify-center mt-2 items-center gap-2">
                  <button onClick={() => toggleLike()}>
                    <i
                      className={`fa-heart text-2xl transition ${
                      'fa-solid text-pink-500'
                    }`}
                    ></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Data */}
      <section className="py-16 bg-gradient-to-b from-blue-100 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-indigo-900 mb-12">Memeify by the Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            
            <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition duration-300">
              <p className="text-4xl mb-2">👥</p>
              <p className="text-2xl font-bold text-indigo-800">{userCount}k+</p>
              <p className="text-gray-600 mt-1">Users</p>
            </div>

            <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition duration-300">
              <p className="text-4xl mb-2">🎨</p>
              <p className="text-2xl font-bold text-indigo-800">200+</p>
              <p className="text-gray-600 mt-1">Templates</p>
            </div>

            <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition duration-300">
              <p className="text-4xl mb-2">🔥</p>
              <p className="text-2xl font-bold text-indigo-800">150K+</p>
              <p className="text-gray-600 mt-1">Memes Made</p>
            </div>

          </div>
        </div>
      </section>


      {/* FAQ SECTION */}
      <section ref={faqRef} className="py-16 bg-gradient-to-b from-gray-700 to-gray-900">
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

      <footer className="bg-indigo-900 text-white py-6 text-center text-sm">
        <div>
          &copy; {new Date().getFullYear()} Memeify • Built with ❤️ by Dhruvin Patel • 
          <a href="https://github.com/Dhruvin2910/Memeify.AI" target="_blank" rel="noreferrer" className="underline ml-1 hover:text-yellow-300">
            GitHub
          </a>
        </div>
      </footer>

    </div>
  );
};

export default Main;
