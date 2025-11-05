import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        paddingTop: '120px',
        paddingBottom: '40px',
        width: '100%',
      }}
    >
      <div style={{ width: '100%', padding: '0 40px' }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Contact Page
        </Typography>

        <Typography variant="body1" paragraph textAlign="center">
          Contact us at{' '}
          <a href="mailto:contact@example.com" style={{ color: '#1976d2' }}>
            contact@example.com
          </a>
        </Typography>

        {/* Text Fields (No Form Tag) */}
        <div
          style={{
            width: '100%',
            maxWidth: '1900px',
            margin: '0 auto',
          }}
        >
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
        </div>

        <div style={{ marginTop: '60px', width: '100%' }}>
          <Typography variant="h6" gutterBottom textAlign="center">
            Our Location
          </Typography>
          <iframe
            title="Google Maps Shibuya"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.700170820291!2d139.6536477!3d35.6668906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188cb2eb3108d1%3A0xf11cd9b2395b6677!2sShibuya%2C%20Tokyo%2C%20Japan!5e0!3m2!1sen!2sjp!4v1694420341201!5m2!1sen!2sjp"
            width="100%"
            height="500"
            style={{
              border: 0,
              borderRadius: '8px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </main>
  )
}

export default Contact
