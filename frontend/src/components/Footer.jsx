import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        textAlign: 'center',
        bgcolor: 'background.paper',
        mt: 'auto',
        width: '100%',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Copyright. Xerjoff. &copy; 2025.
        <br />
        All rights reserved.
      </Typography>
    </Box>
  )
}

export default Footer
