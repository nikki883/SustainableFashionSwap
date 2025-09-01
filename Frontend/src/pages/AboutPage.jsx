import React from 'react';
import '../styles/AboutPage.css';

const values = [
  {
    icon: '🌿',
    title: 'Sustainability',
    description:
      "We're committed to reducing fashion's environmental impact by extending the lifecycle of clothing items and promoting circular fashion economy.",
  },
  {
    icon: '🤝',
    title: 'Community',
    description:
      'We foster a supportive community of like-minded individuals who share a passion for fashion and sustainability, connecting people through shared values.',
  },
  {
    icon: '♻️',
    title: 'Circular Economy',
    description:
      'We believe in the power of reuse and exchange, creating a circular model that reduces waste and gives new life to fashion items that might otherwise be discarded.',
  },
];

const AboutPage = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Sustainable Fashion Swap</h1>

      {/* Mission */}
      <section className="about-section">
        <h2 className="section-heading">Our Mission</h2>
        <p>
          Sustainable Fashion Swap is dedicated to reducing textile waste and promoting
          sustainable fashion through a community-driven platform. We believe that every
          garment deserves a second life, and by swapping clothes instead of buying new ones,
          we can significantly reduce our environmental footprint.
        </p>
        <p>
          Our platform enables fashion enthusiasts to exchange their pre-loved clothing items
          with others, extending the lifecycle of garments and reducing the demand for new
          production. By facilitating these exchanges, we're building a community that values
          sustainability, creativity, and conscious consumption.
        </p>
      </section>

      {/* Values */}
      <section className="about-section">
        <h2 className="section-heading">Our Values</h2>
        <div className="values-container">
          {values.map((val, idx) => (
            <div key={idx} className="value-card">
              <div className="value-icon">{val.icon}</div>
              <h3 className="value-title">{val.title}</h3>
              <p className="value-description">{val.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="about-section">
        <h2 className="section-heading">Our Story</h2>
        <p>
          Sustainable Fashion Swap was born from a college project with a vision to transform
          how we consume fashion. What started as an academic endeavor quickly evolved into a
          passionate mission to create a practical solution to fashion waste.
        </p>
        <p>
          Our founder recognized that while many people care about sustainable fashion, there
          weren't enough accessible platforms to make sustainable choices easy and enjoyable.
          By combining technology with community engagement, we've created a space where
          sustainable fashion isn't just a concept—it's a practical, everyday reality.
        </p>
        <p>
          Today, our platform continues to grow, connecting fashion lovers who want to
          express their style while respecting our planet. Each swap represents a small
          step toward a more sustainable fashion ecosystem.
        </p>
      </section>

      {/* Impact */}
      <section className="about-section">
        <h2 className="section-heading">How We Make a Difference</h2>
        <p>
          Each item swapped through our platform saves approximately 3kg of CO2 emissions,
          2,700 liters of water, and keeps textiles out of landfills. By facilitating
          clothing exchanges, we're collectively making a significant environmental impact.
        </p>
        <p>
          We also regularly organize community events, workshops, and educational initiatives
          to raise awareness about sustainable fashion and promote conscious consumption habits.
        </p>
      </section>

      {/* Join */}
      <section className="about-section">
        <h2 className="section-heading">Join Our Movement</h2>
        <p>
          We invite you to be part of our growing community. Whether you're new to sustainable
          fashion or a long-time advocate, there's a place for you here. Start by creating
          an account, listing items you no longer need, and discovering unique pieces from
          fellow community members.
        </p>
        <p>
          Together, we can transform the fashion industry one swap at a time.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;