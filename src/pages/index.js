import React, { useEffect, useRef, useState } from 'react';
import WritingBox from '../components/WritingBox';
import styles from './Home.module.css';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import UserProfile from '../components/UserProfile';

const audioFiles = [
  '/assets/Time.mp3',
  '/assets/Addicted.mp3',
  '/assets/AVENOIR.mp3',
  '/assets/Cyberfreak.mp3',
  '/assets/From Paris To Berlin.mp3',
  '/assets/Hope.mp3',
  '/assets/I Don\'t Know.mp3',
  '/assets/I Like It.mp3',
  '/assets/ICARUS.mp3',
  '/assets/impress you.mp3',
  '/assets/Lost.mp3',
  '/assets/My Gospel.mp3',
  '/assets/Name Tag.mp3',
  '/assets/Nobody But Me.mp3',
  '/assets/Stay The Night.mp3',
  '/assets/Talk To Me.mp3',
  '/assets/Upstairs.mp3',
  '/assets/Voicemail.mp3',
  '/assets/What Do You Mean.mp3',
  '/assets/Nothing but Trouble - Instagram Models.mp3',
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark-mode');
    setDarkMode((prev) => !prev);
  };
  
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleMusic = () => {
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      if (!audioRef.current.src) {
        // Shuffle and set the first track
        const shuffledFiles = shuffleArray([...audioFiles]);
        setCurrentTrackIndex(0);
        audioRef.current.src = shuffledFiles[currentTrackIndex];
      }
      audioRef.current.play();
      setMusicPlaying(true);
    }
  };

  const playNextTrack = () => {
    if (audioRef.current) {
      const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
      setCurrentTrackIndex(nextIndex);
      audioRef.current.src = audioFiles[nextIndex];
      audioRef.current.play();
    }
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      const elements = document.querySelectorAll('.floating-element');
      elements.forEach(element => {
        const speed = element.dataset.speed;
        const x = (window.innerWidth - event.pageX * speed) / 100;
        const y = (window.innerHeight - event.pageY * speed) / 100;
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    const handleScrollAnimations = () => {
      document.querySelectorAll(`.${styles.scrollAnimation}`).forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add(styles.visible);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScrollAnimations);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScrollAnimations);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', playNextTrack);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', playNextTrack);
        }
      };
    }
  }, [currentTrackIndex]);

  const scrollTo = (position) => {
    if (position === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (position === 'bottom') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const triggerConfetti = () => {
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = styles.confetti;
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = `${Math.random() * 100}vh`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }
  };

  const startTutorial = () => {
    introJs()
      .setOptions({
        steps: [
          {
            intro: 'Welcome to Word-Pied! Let\'s take a quick tour.',
          },
          {
            element: '.homeTitle',
            intro: 'This is the home title.',
          },
          {
            element: '.writingBoxesGrid',
            intro: 'Here are the writing boxes where you can collaborate in real-time.',
          },
          {
            element: '.darkModeToggle',
            intro: 'Toggle dark mode here.',
          },
          {
            element: '.musicToggle',
            intro: 'Play or pause background music.',
          },
          {
            element: '.confettiButton',
            intro: 'Click here to celebrate with confetti!',
          },
        ],
      })
      .start();
  };

  return (
    <div className={`${styles.homeContainer} ${darkMode ? styles.darkMode : ''}`}>
      <UserProfile />
      <audio ref={audioRef} loop>
        <source src="" type="audio/mpeg" />
      </audio>

      <header className={`${styles.header} ${styles.slideIn}`}>
        <h1 className={`${styles.homeTitle} ${styles.neonText}`}>Word-Pied</h1>
        <button className={`${styles.darkModeToggle} ${darkMode ? styles.darkMode : ''}`} onClick={toggleDarkMode}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className={styles.musicToggle} onClick={toggleMusic}>
          {musicPlaying ? 'Pause Music' : 'Play Music'}
        </button>
        <button className={styles.confettiButton} onClick={triggerConfetti}>
          Celebrate!
        </button>
        <button className={styles.confettiButton} onClick={startTutorial}>
          Start Tutorial
        </button>
      </header>
      <p className={`${styles.subtitle} ${styles.slideUp}`}>Write and add links for the world to find!!!</p>
      <p className={`${styles.subtitle} ${styles.slideUp}`}>Music changes everytime you refresh and you can embed links(Works better on PC)</p>
      <p className={`${styles.subtitle} ${styles.slideUp}`}>Please let everyone have fun and don't clear others stuff. Thx.</p>
      <div className={`${styles.writingBoxesGrid} ${styles.borderPulse}`}>
        {Array.from({ length: 999 }, (_, i) => i).map(boxNumber => (
          <div className={`${styles.writingBoxContainer} ${styles.swing}`} key={boxNumber}>
            <span className={styles.boxLabel}>Pied {boxNumber + 1}</span>
            <WritingBox boxNumber={boxNumber} />
          </div>
        ))}
      </div>

      <button className={`${styles.scrollButton} ${styles.scrollToTop}`} onClick={() => scrollTo('top')}>
        ↑
      </button>
      <button className={`${styles.scrollButton} ${styles.scrollToBottom}`} onClick={() => scrollTo('bottom')}>
        ↓
      </button>
    </div>
  );
}
