import { useState } from "react";
import axios from "axios";
import "../styles/SupportForm.css"; // Styling file

const SupportForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({ success: "", error: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ success: "", error: "" }); // Clear previous messages
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, message } = formData;

    if (!name || !email || !message) {
      setStatus({ success: "", error: "All fields are required." });
      return;
    }

    if (!validateEmail(email)) {
      setStatus({ success: "", error: "Enter a valid email address." });
      return;
    }

    setIsSubmitting(true);

    try {
      
      console.log("Sending support request:", formData);
      await axios.post("http://localhost:5000/api/support", formData, {
        withCredentials: true, 
      });

      setStatus({ success: "Your message has been sent!", error: "" });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({
        success: "",
        error: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-form-container">
      <h2>Contact Customer Support</h2>
      <p>Have an issue? We're here to help!</p>

      <form onSubmit={handleSubmit} className="support-form">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Describe your issue"
          value={formData.message}
          onChange={handleChange}
          rows="5"
        ></textarea>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Submit"}
        </button>

        {status.error && <p className="error">{status.error}</p>}
        {status.success && <p className="success">{status.success}</p>}
      </form>
    </div>
  );
};

export default SupportForm;
