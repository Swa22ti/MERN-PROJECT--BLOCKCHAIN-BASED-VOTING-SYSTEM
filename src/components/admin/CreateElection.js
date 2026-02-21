import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateElection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    candidates: [{ name: '', party: 'Independent' }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleCandidateChange = (index, field, value) => {
    const newCandidates = [...formData.candidates];
    newCandidates[index][field] = value;
    setFormData({ ...formData, candidates: newCandidates });
  };

  const addCandidate = () => {
    setFormData({
      ...formData,
      candidates: [...formData.candidates, { name: '', party: 'Independent' }],
    });
  };

  const removeCandidate = (index) => {
    if (formData.candidates.length > 1) {
      const newCandidates = formData.candidates.filter((_, i) => i !== index);
      setFormData({ ...formData, candidates: newCandidates });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.candidates.length < 2) {
      setError('At least 2 candidates are required');
      return;
    }

    const validCandidates = formData.candidates.filter((c) => c.name.trim() !== '');
    if (validCandidates.length < 2) {
      setError('At least 2 valid candidates are required');
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        candidates: validCandidates,
      };

      // 🔥 Add token manually inside request
      const token = localStorage.getItem("token");

      const res = await axios.post(
  'http://localhost:5000/api/elections',
  payload,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  }
);


      toast.success('Election created successfully!');
      navigate(`/admin/election/${res.data.data._id}`);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to create election';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/admin/dashboard')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Create New Election
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Election Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              required
              multiline
              rows={3}
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  name="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Candidates Section */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Candidates
                </Typography>
                <Button startIcon={<AddIcon />} onClick={addCandidate} size="small">
                  Add Candidate
                </Button>
              </Box>

              {formData.candidates.map((candidate, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Candidate Name"
                        value={candidate.name}
                        onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                        required
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Party"
                        value={candidate.party}
                        onChange={(e) => handleCandidateChange(index, 'party', e.target.value)}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <IconButton
                        color="error"
                        onClick={() => removeCandidate(index)}
                        disabled={formData.candidates.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ flexGrow: 1 }}
              >
                {loading ? 'Creating...' : 'Create Election'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/admin/dashboard')}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateElection;
