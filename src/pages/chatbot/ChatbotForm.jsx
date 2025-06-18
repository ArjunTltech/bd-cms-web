import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../config/axios';
import playNotificationSound from '../../utils/playNotification';

function ChatbotForm({ onFAQCreated, initialData, mode, setIsDrawerOpen, chats, chatLength }) {
  const [chat, setChat] = useState({ question: '', answer: '', order: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setChat({
        question: initialData.question || '',
        answer: initialData.answer || ''
      });
    } else {
      setChat({ question: '', answer: '', order: '' });
    }

    setErrors({});
    setIsSubmitting(false);
  }, [mode, initialData]);

  const validateField = (name, value) => {
    const wordCount = value.trim().split(/\s+/).length;

    switch (name) {
      case 'question':
        if (value.trim().length < 5) {
          return 'Question must be at least 5 characters.';
        }

        if (chat && Array.isArray(chats)) {
          const duplicates = chats.filter(
            (existingFAQ) =>
              existingFAQ.question.trim().toLowerCase() === value.trim().toLowerCase() &&
              (mode !== 'edit' || existingFAQ.id !== initialData?.id)
          );

          if (duplicates.length > 0) {
            return 'This question already exists. Try a different one.';
          }
        }

        return null;

      case 'answer':
        return wordCount >= 10 && wordCount <= 45
          ? null
          : 'Answer should be between 10 and 45 words.';

      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      question: validateField('question', chat.question),
      answer: validateField('answer', chat.answer)
    };

    // Remove null values
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      let response;

      if (mode === 'add') {
        
        if(chatLength>5){
            toast.error("Question limit reached. You can only add up to six question-and-answer pairs.");
          return
        }
        const chatData = { ...chat, order: chatLength+1 };
        response = await axiosInstance.post('/chatbot/create-questions', chatData);
        toast.success('Question created successfully!');

      } else if (mode === 'edit' && initialData) {
        const updatedchat = { ...chat };
        response = await axiosInstance.put(`/chatbot/update-question/${initialData.id}`, updatedchat);
        toast.success('Question updated successfully!');
      }

      playNotificationSound();

      onFAQCreated?.();
      setChat({ question: '', answer: '' });
      setIsDrawerOpen(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChat({ ...chat, [name]: value });

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Question <span className="text-error">*</span>
        </label>
        <input
          name="question"
          type="text"
          placeholder="Enter  question"
          className={`input input-bordered w-full ${errors.question ? 'input-error' : ''}`}
          value={chat.question}
          onChange={handleInputChange}
        />
        {errors.question && <p className="text-error text-sm mt-1">{errors.question}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Answer <span className="text-error">*</span>
        </label>
        <textarea
          name="answer"
          placeholder="Enter  answer"
          className={`textarea textarea-bordered w-full ${errors.answer ? 'textarea-error' : ''}`}
          rows="4"
          value={chat.answer}
          onChange={handleInputChange}
        ></textarea>
        {errors.answer && <p className="text-error text-sm mt-1">{errors.answer}</p>}
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner"></span>
            {mode === 'add' ? 'Creating Quesiton & Answer...' : 'Updating Quesiton & Answer...'}
          </>
        ) : mode === 'add' ? (
          'Create Quesiton & Answer'
        ) : (
          'Update Quesiton & Answer'
        )}
      </button>
    </form>
  );
}

export default ChatbotForm;
