import React, { useState } from 'react';
import '../styles/FAQ.css';

const faqData = [
  {
    question: "What is Fashion Swap?",
    answer: "Fashion Swap is a platform where you can exchange or purchase pre-loved clothing items sustainably with others."
  },
  {
    question: "How does swapping work?",
    answer: "Simply list your item, request to swap with another user's item, and if both agree, arrange delivery between yourselves."
  },
  {
    question: "Can I buy without swapping?",
    answer: "Yes! If the item owner allows, you can directly purchase items without offering a swap."
  },
  {
    question: "Is delivery handled by Fashion Swap?",
    answer: "No, delivery is arranged directly between users. We recommend using trusted courier services."
  },
  {
    question: "Is there a fee to use Fashion Swap?",
    answer: "Creating an account and listing items is free. We take a small commission during successful swaps or purchases."
  },
  {
    question: "How does the platform make money?",
    answer: "We take a transparent commission from each successful transaction to maintain the platform and support our sustainability mission."
  },
  {
    question: "How do I know the item quality is good?",
    answer: "Users are encouraged to upload clear images and accurate descriptions. After every swap, you can rate and review each other."
  },
  {
    question: "What if I don't receive the item?",
    answer: "If a swap or delivery doesn't go as expected, you can report the user. Our admin team will assist based on provided proof."
  },
  {
    question: "Can I delete my account?",
    answer: "Yes, you can request account deletion anytime via your profile settings or by contacting our support team."
  },
  {
    question: "Who do I contact for help?",
    answer: "You can email us at support@fashionswap.com or use the contact form on our website."
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-heading">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqData.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openIndex === index ? 'active' : ''}`}
          >
            <div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >
              <span>{faq.question}</span>
              <span className="faq-toggle">{openIndex === index ? '−' : '+'}</span>
            </div>
            {openIndex === index && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
