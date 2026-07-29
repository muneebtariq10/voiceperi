import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  MessageSquarePlus, 
  Star, 
  Bug, 
  Lightbulb, 
  ThumbsUp, 
  Send, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';
// import { AppUser } from '@/AppContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

type FeedbackCategory = 'general' | 'bug' | 'feature' | 'praise';

const categories: { id: FeedbackCategory; label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string; description: string }[] = [
  { 
    id: 'general', 
    label: 'General', 
    icon: <MessageSquarePlus className="w-5 h-5" />, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Share your thoughts'
  },
  { 
    id: 'bug', 
    label: 'Bug Report', 
    icon: <Bug className="w-5 h-5" />, 
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Something broken?'
  },
  { 
    id: 'feature', 
    label: 'Feature Request', 
    icon: <Lightbulb className="w-5 h-5" />, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Suggest an idea'
  },
  { 
    id: 'praise', 
    label: 'Praise', 
    icon: <ThumbsUp className="w-5 h-5" />, 
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Something you love'
  },
];

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory>('general');
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // const { user } = AppUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error("Please write your feedback before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
      await axios.post(`${API_URL}api/feedback`, 
        { 
          message: `[${selectedCategory.toUpperCase()}] ${rating > 0 ? `(Rating: ${rating}/5) ` : ''}${feedback}` 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedback('');
        setSelectedCategory('general');
        setRating(0);
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeCat = categories.find(c => c.id === selectedCategory)!;
  const charCount = feedback.length;
  const maxChars = 1000;

  if (isSubmitted) {
    return (
      <div className="flex flex-col px-[16px] md:px-7 py-6 bg-[#fafafb] min-h-screen w-full">
        <div 
          className="flex flex-col items-center justify-center py-16 px-8 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 max-w-2xl"
          style={{ animation: 'fadeInUp 0.5s ease-out' }}
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
          <p className="text-green-600 text-center max-w-sm">
            Your feedback has been submitted successfully. We truly appreciate you taking the time to help us improve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-[16px] md:px-7 py-6 bg-[#fafafb] min-h-screen w-full">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feedback-card { animation: fadeInUp 0.4s ease-out; }
        .star-btn { transition: all 0.15s ease; }
        .star-btn:hover { transform: scale(1.2); }
        .category-card { transition: all 0.2s ease; }
        .category-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
      `}</style>

      <div className="feedback-card max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3.5 mb-1">
            <div className="w-11 h-11 rounded-xl bg-[#1c9c84] flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-primary">Send Feedback</h1>
              <p className="text-sm font-medium text-default-gray">Help us improve VoicePeri for your business</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">What's this about?</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`category-card flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 cursor-pointer ${
                      isActive 
                        ? `${cat.bgColor} ${cat.borderColor} ${cat.color}` 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className={isActive ? cat.color : 'text-gray-400'}>{cat.icon}</span>
                    <span className={`text-xs font-semibold ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>{cat.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>{cat.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">
              How's your experience? <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoveredStar || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    className="star-btn p-1 rounded-lg focus:outline-none"
                    onClick={() => setRating(star === rating ? 0 : star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  >
                    <Star 
                      className={`w-7 h-7 ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-3 text-sm text-gray-500">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Great"}
                  {rating === 5 && "Excellent!"}
                </span>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">Your message</label>
              <span className={`text-xs ${charCount > maxChars ? 'text-red-500' : 'text-gray-400'}`}>
                {charCount}/{maxChars}
              </span>
            </div>
            <div className={`rounded-xl border-2 overflow-hidden bg-white shadow-sm transition-colors ${
              feedback.length > 0 ? `${activeCat.borderColor}` : 'border-gray-200 focus-within:border-[#1c9c84]'
            }`}>
              <Textarea 
                placeholder={
                  selectedCategory === 'bug' 
                    ? "Describe the issue you're facing. What happened? What did you expect?" 
                    : selectedCategory === 'feature' 
                    ? "What feature would you like to see? How would it help your workflow?" 
                    : selectedCategory === 'praise' 
                    ? "Tell us what you love about VoicePeri!" 
                    : "Share your thoughts, suggestions, or anything on your mind..."
                }
                className="min-h-[160px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-sm"
                value={feedback}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setFeedback(e.target.value);
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full sm:w-auto px-8 h-12 rounded-xl bg-[#1c9c84] hover:bg-[#16806c] text-white font-semibold text-sm gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            disabled={isSubmitting || !feedback.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </Button>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Your feedback is sent directly to our team. We read every message.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Feedback;