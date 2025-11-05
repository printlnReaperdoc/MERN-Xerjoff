import React, { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [message, setMessage] = useState('')

  // Upload image and return filename
  const uploadProfileImage = async (file) => {
    const formData = new FormData()
    formData.append('profileImage', file)
    const res = await fetch('/api/upload-profile-image', {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error('Image upload failed')
    const data = await res.json()
    return data.filename
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    let profileImageFilename = 'defaultuserpic.png'
    try {
      if (profileImage) {
        profileImageFilename = await uploadProfileImage(profileImage)
      }
      // fallback if uploadProfileImage returns empty string or null
      if (!profileImageFilename) profileImageFilename = 'defaultuserpic.png'
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          status_id: 1,
          role_id: 2,
          profileImage: profileImageFilename,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setMessage('Registration successful!')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <main>
      <Typography variant="h4" gutterBottom>Register Page</Typography>
      <Typography variant="body1" gutterBottom>Create a new account.</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 300 }}>
        <TextField
          label="Name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mt: 2, mb: 1 }}
        >
          {profileImage ? profileImage.name : 'Upload Profile Picture'}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setProfileImage(e.target.files[0])
              }
            }}
          />
        </Button>
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
      {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
    </main>
  )
}

export default Register
