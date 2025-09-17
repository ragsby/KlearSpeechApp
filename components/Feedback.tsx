import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

const Feedback: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const subject = encodeURIComponent("Feedback from Speech Companion App");
    const body = encodeURIComponent(feedbackText);
    window.location.href = `mailto:bansal.rb99@gmail.com?subject=${subject}&body=${body}`;

    setFeedbackText('');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-primary to-sky-400 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300"
        aria-label="Open feedback form"
      >
        <MessageSquare size={28} />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
        >
          <div
            className="glass-card rounded-2xl shadow-xl p-6 w-full max-w-lg animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="feedback-title" className="text-2xl font-bold text-gray-800">
                Share Your Feedback
              </h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 rounded-full transition-colors"
                aria-label="Close feedback form"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-lg text-gray-600 mb-4">
              We'd love to hear your thoughts! What's working well? What could be better?
            </p>

            <form onSubmit={handleSendFeedback}>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-40 p-3 rounded-lg text-lg bg-white/70 border-2 border-gray-200/50 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 shadow-inner resize-none"
                aria-label="Feedback message"
                required
              />
              <button
                type="submit"
                disabled={!feedbackText.trim()}
                className="mt-4 w-full py-3.5 rounded-full text-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 bg-gradient-to-r from-primary to-sky-400 hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-sky-500/40 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                Send Feedback
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Feedback;
