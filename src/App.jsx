import React, { useEffect, useState } from 'react';
import img from './ai-human.avif';

const App = () => {
  const [transcript, setTarnscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [information, setInformation] = useState('');
  const [voices, setvoice] = useState([]);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  const loadVoice = () => {
    const allVoice = window.speechSynthesis.getVoices();
    setvoice(allVoice);
  };

  useEffect(() => {
  const interval = setInterval(() => {
    const allVoices = window.speechSynthesis.getVoices();
    if (allVoices.length > 0) {
      setvoice(allVoices);
      clearInterval(interval);
    }
  }, 100); // check every 100ms until voices are loaded

  return () => clearInterval(interval); // cleanup
}, []);


  const startListening = () => {
    recognition.start();
    setIsListening(true);
  };

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript.toLowerCase();
    setTarnscript(spokenText);
    handleVoiceCommand(spokenText);
  };

  recognition.onend = () => setIsListening(false);

  const speakText = (text) => {
  if (voices.length === 0) {
    console.warn('❗ Voices not loaded yet!');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  const selectedVoice =
    voices.find((voice) => voice.lang.startsWith('en-') && voice.name.toLowerCase().includes('male')) ||
    voices.find((voice) => voice.lang.startsWith('en-')) ||
    voices[0];

  if (!selectedVoice) {
    console.warn('❗ No suitable voice found.');
    return;
  }

  utterance.voice = selectedVoice;
  utterance.lang = selectedVoice.lang || 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};


  const handleVoiceCommand = async (command) => {
    if (command.startsWith('open')) {
      let site = command.split('open')[1]
        .trim()
        .toLowerCase()
        .replace(/\s/g, '');

      site = site.replace(/(https?:\/\/)?(www\.)?/, '');
      site = site.replace(/(\.com|\.org|\.in|\.net|\/)$/g, '');

      const sitesMap = {
        youtube: 'https://www.youtube.com',
        facebook: 'https://www.facebook.com',
        google: 'https://www.google.com',
        twitter: 'https://www.twitter.com',
        instagram: 'https://www.instagram.com',
        linkedin: 'https://www.linkedin.com',
        github: 'https://www.github.com',
      };

      const knownUrl = sitesMap[site];

      if (knownUrl) {
        speakText(`Opening ${site}`);
        setInformation(`Opened ${site}`);
        setTimeout(() => {
          window.open(knownUrl, '_blank');
        }, 100);
      } else {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(site)}`;
        speakText(`I couldn't find the site. Searching Google for ${site}`);
        setInformation(`Searching Google for "${site}"`);
        setTimeout(() => {
          window.open(searchUrl, '_blank');
        }, 100);
      }

      return;
    }

    // === Basic AI Assistant Responses ===
    if (command.includes('what is your name')) {
      const response = "Hello Sir, I'm your voice assistant.";
      speakText(response);
      setInformation(response);
      return;
    } else if (command.includes('hello')) {
      const response = 'Hello Sir, how can I help you?';
      speakText(response);
      setInformation(response);
      return;
    }
    const famousPeople = [
      'bill gates',
      'mark zuckerberg',
      'elon musk',
      'steve jobs',
      'warren buffet',
      'barack obama',
      'jeff bezos',
      'sundar pichai',
      'mukesh ambani',
      'virat kohli',
      'sachin tendulkar',
      'brian lara',
    ];

    if (famousPeople.some((person) => command.includes(person))) {
      const person = famousPeople.find((person) => command.includes(person));
      const personData = await fetchPersonData(person);

      if (personData) {
        const infoText = `${personData.name}, ${personData.extract}`;
        setInformation(infoText);
        speakText(infoText);
        return;
      } else {
        const fallbackMessage = "I couldn't find detailed information.";
        speakText(fallbackMessage);
        return;
      }
    }
    const fallbackMessage = `Here is what I found about ${command}`;
    speakText(fallbackMessage);
    performGoogleSearch(command);
  };

  const fetchPersonData = async (person) => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      person
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.title && data.extract) {
        return {
          name: data.title,
          extract: data.extract.split('.')[0],
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const performGoogleSearch = (query) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <div>
      <div className="voice-assistant">
        <img src={img} alt="AI" className="ai-image" />
        <h2>Voice Assistant (Friday)</h2>

        <button className="btn" onClick={startListening} disabled={isListening}>
          <i className="fas fa-microphone"></i>
          {isListening ? 'Listening...' : 'Start Listening'}
        </button>

        <p className="tarnscript">{transcript}</p>
        <p className="information">{information}</p>
      </div>
    </div>
  );
}

export default App;
