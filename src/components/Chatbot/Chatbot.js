import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm MediBot, your AI medical assistant. How can I help you today?", isBot: true, timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Medical knowledge base
  const medicalResponses = {
    'hello': 'Hello Doctor! How can I assist you with patient care today?',
    'hi': 'Hi there! Ready to help with medical queries.',
    'prescription': 'I can help with prescription suggestions. Please enter the patient diagnosis for specific medicine recommendations.',
    'patient': 'For patient records, please use the Patient Database module. I can help answer medical questions.',
    'medicine': 'Check the Medicine Database for available medicines. I can suggest medicines based on symptoms.',
    'appointment': 'You can schedule appointments in the Appointments section. Would you like me to show you how?',
    'symptoms': 'Please describe the symptoms and I\'ll suggest possible diagnoses.',
    'dosage': 'Dosage depends on patient age, weight, and condition. Please specify the medicine and patient details.',
    'emergency': 'For emergencies, please contact hospital emergency: 102 or 112',
    'help': 'I can help with: prescription suggestions, medicine information, dosage guidelines, symptom analysis, and general medical queries.',
    'thanks': 'You\'re welcome! Is there anything else I can help with?',
    'thank you': 'You\'re welcome Doctor! Let me know if you need further assistance.',
  };

  // Common medical queries
  const quickQueries = [
    { text: 'Prescription suggestions', icon: 'fas fa-prescription' },
    { text: 'Medicine dosage guide', icon: 'fas fa-pills' },
    { text: 'Patient symptoms analysis', icon: 'fas fa-stethoscope' },
    { text: 'Medical abbreviations', icon: 'fas fa-file-medical' },
    { text: 'Drug interactions', icon: 'fas fa-exclamation-triangle' },
    { text: 'Lab result interpretation', icon: 'fas fa-vial' },
    { text: 'Emergency protocols', icon: 'fas fa-ambulance' },
    { text: 'Schedule appointment', icon: 'fas fa-calendar-check' },
  ];

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Generate bot response
  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Check for specific medical conditions
    if (input.includes('fever') || input.includes('temperature')) {
      return 'For fever, consider: Paracetamol 500mg every 6 hours, adequate hydration, and rest. Monitor temperature every 4 hours. If fever persists beyond 3 days, consider blood tests.';
    }
    if (input.includes('cold') || input.includes('cough')) {
      return 'For common cold: Antihistamines like Cetirizine, steam inhalation, warm fluids. For cough: Dextromethorphan for dry cough, Guaifenesin for productive cough.';
    }
    if (input.includes('pain')) {
      return 'For pain management: NSAIDs like Ibuprofen 400mg every 8 hours, or Paracetamol 500mg every 6 hours. For severe pain, consider consulting a specialist.';
    }
    if (input.includes('infection') || input.includes('bacterial')) {
      return 'For bacterial infections: Amoxicillin 500mg every 8 hours for 7 days, or Azithromycin 500mg once daily for 3 days. Always consider antibiotic sensitivity.';
    }
    if (input.includes('allergy')) {
      return 'For allergies: Antihistamines (Cetirizine 10mg daily), nasal corticosteroids for allergic rhinitis. Avoid known allergens.';
    }
    if (input.includes('blood pressure') || input.includes('bp')) {
      return 'For hypertension: Lifestyle modifications first. Medications include ACE inhibitors, ARBs, beta-blockers, or diuretics based on patient profile.';
    }
    if (input.includes('diabetes') || input.includes('sugar')) {
      return 'For diabetes: Metformin first line, monitor HbA1c every 3 months. Consider sulfonylureas, DPP-4 inhibitors, or insulin based on glucose levels.';
    }

    // Check for general responses
    for (const [key, response] of Object.entries(medicalResponses)) {
      if (input.includes(key)) {
        return response;
      }
    }

    // Default response
    return 'I understand your query about "' + userInput + '". As an AI medical assistant, I suggest consulting specific medical resources or using the Medicine Database for detailed information. For critical decisions, always rely on clinical judgment and patient history.';
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuery = (query) => {
    const userMessage = {
      id: messages.length + 1,
      text: query,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(query);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chatbot Icon */}
      <div className={`chatbot-icon ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="chatbot-avatar">
          <i className="fas fa-robot"></i>
          {!isOpen && <span className="notification-dot"></span>}
        </div>
        <div className="chatbot-tooltip">
          <i className="fas fa-comment-medical"></i> Medical AI Assistant
        </div>
      </div>

      {/* Chatbot Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-profile">
            <div className="profile-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="profile-info">
              <h4>MediBot AI</h4>
              <p>Medical Assistant</p>
              <span className="status online">
                <i className="fas fa-circle"></i> Online
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="chatbot-body">
          {/* Welcome Message */}
          <div className="welcome-message">
            <div className="welcome-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="welcome-content">
              <h4>Hi, I'm MediBot! 👋</h4>
              <p>Your AI medical assistant. I can help with:</p>
              <div className="welcome-features">
                <span><i className="fas fa-check-circle"></i> Prescription suggestions</span>
                <span><i className="fas fa-check-circle"></i> Medicine information</span>
                <span><i className="fas fa-check-circle"></i> Symptom analysis</span>
                <span><i className="fas fa-check-circle"></i> Medical guidelines</span>
              </div>
            </div>
          </div>

          {/* Quick Queries */}
          <div className="quick-queries">
            <h5>Quick Queries</h5>
            <div className="queries-grid">
              {quickQueries.map((query, index) => (
                <button
                  key={index}
                  className="query-btn"
                  onClick={() => handleQuickQuery(query.text)}
                >
                  <i className={query.icon}></i>
                  <span>{query.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isBot ? 'bot' : 'user'}`}
              >
                {message.isBot && (
                  <div className="message-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                {!message.isBot && (
                  <div className="message-avatar user">
                    <i className="fas fa-user-md"></i>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot typing">
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="chatbot-footer">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your medical query here..."
              className="chat-input"
            />
            <div className="input-actions">
              <button className="action-btn" title="Attach file">
                <i className="fas fa-paperclip"></i>
              </button>
              <button className="action-btn" title="Send voice message">
                <i className="fas fa-microphone"></i>
              </button>
              <button className="send-btn" onClick={handleSendMessage}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
          <div className="disclaimer">
            <i className="fas fa-info-circle"></i>
            <small>AI suggestions only. Always verify with clinical judgment.</small>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;