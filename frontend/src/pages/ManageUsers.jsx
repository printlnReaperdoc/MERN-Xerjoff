import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', status_id: 1, role_id: 2 })
  const [editingId, setEditingId] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [userChecked, setUserChecked] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const navigate = useNavigate()

  // Fetch users
  useEffect(() => {
    setLoading(true)
    fetch('/api/users')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users')
        return res.json()
      })
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Restrict access: only admins (role_id === 1)
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      setUnauthorized(true)
      setUserChecked(true)
      return
    }
    try {
      const user = JSON.parse(userStr)
      if (user.role_id !== 1) {
        setUnauthorized(true)
        setUserChecked(true)
        return
      }
      setUserChecked(true) // Allowed
    } catch {
      setUnauthorized(true)
      setUserChecked(true)
    }
  }, [navigate])

  useEffect(() => {
    if (unauthorized) {
      navigate('/forbidden')
    }
  }, [unauthorized, navigate])

  // Open edit modal
  const handleOpenEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      status_id: user.status_id,
      role_id: user.role_id
    })
    setEditingId(user._id)
    setOpenForm(true)
  }

  // Submit edit
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    fetch(`/api/users/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(updated => {
        setUsers(users.map(u => u._id === editingId ? { ...u, ...updated } : u))
        setOpenForm(false)
        setEditingId(null)
      })
  }

  // Open delete modal
  const handleOpenDelete = (id) => {
    setDeleteId(id)
    setOpenDelete(true)
  }

  // Confirm delete
  const handleDelete = () => {
    fetch(`/api/users/${deleteId}`, { method: 'DELETE' })
      .then(() => setUsers(users.filter(u => u._id !== deleteId)))
      .finally(() => {
        setOpenDelete(false)
        setDeleteId(null)
      })
  }

  if (!userChecked) return <main><Typography>Checking permissions...</Typography></main>
  if (loading) return <main><Typography>Loading...</Typography></main>
  if (error) return <main><Typography color="error">Error: {error}</Typography></main>

  return (
    <main>
      <Typography variant="h4" gutterBottom>Manage Users</Typography>
      <Table>
  <TableHead>
    <TableRow>
      <TableCell>Profile</TableCell>
      <TableCell>Name</TableCell>
      <TableCell>Email</TableCell>
      <TableCell>Status</TableCell>
      <TableCell>Role</TableCell>
      <TableCell>Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {users.map(user => (
      <TableRow key={user._id}>
        <TableCell>
          <img
            src={user.profileImage ? `/public/${user.profileImage}` : '/default-avatar.png'}
            alt={user.name}
            style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        </TableCell>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.status_id === 1 ? 'Active' : 'Deactivated'}</TableCell>
        <TableCell>{user.role_id === 1 ? 'Admin' : 'Customer'}</TableCell>
        <TableCell>
          <Button size="small" onClick={() => handleOpenEdit(user)}>Edit</Button>
          <Button size="small" color="error" onClick={() => handleOpenDelete(user._id)}>Delete</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

      {/* Edit Modal */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <FormControl>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status_id}
                label="Status"
                onChange={e => setForm({ ...form, status_id: e.target.value })}
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={2}>Deactivated</MenuItem>
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role_id}
                label="Role"
                onChange={e => setForm({ ...form, role_id: e.target.value })}
              >
                <MenuItem value={1}>Admin</MenuItem>
                <MenuItem value={2}>Customer</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Update</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </main>
  )
}

export default ManageUsers
