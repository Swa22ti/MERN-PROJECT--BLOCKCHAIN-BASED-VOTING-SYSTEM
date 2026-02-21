import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  People as PeopleIcon,
  HowToVote as VoteIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [tally, setTally] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElection();
    fetchTally();
  }, [id]);

  const fetchElection = async () => {
    try {
      const res = await axios.get(`/api/elections/${id}`);
      setElection(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch election details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTally = async () => {
    try {
      const res = await axios.get(`/api/elections/${id}/tally`);
      setTally(res.data.data);
    } catch (error) {
      console.error('Failed to fetch tally:', error);
    }
  };

  const handleOpenElection = async () => {
    try {
      await axios.put(`/api/elections/${id}/open`);
      toast.success('Election opened successfully');
      fetchElection();
    } catch (error) {
      toast.error('Failed to open election');
    }
  };

  const handleCloseElection = async () => {
    try {
      await axios.put(`/api/elections/${id}/close`);
      toast.success('Election closed successfully');
      fetchElection();
      fetchTally();
    } catch (error) {
      toast.error('Failed to close election');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!election) {
    return (
      <Container>
        <Alert severity="error">Election not found</Alert>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'closed':
        return 'warning';
      case 'tallied':
        return 'info';
      default:
        return 'default';
    }
  };

  const chartData = tally
    ? Object.entries(tally.tallies || {}).map(([name, votes]) => ({
        candidate: name,
        votes: parseInt(votes) || 0,
      }))
    : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/admin/dashboard')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {election.name}
        </Typography>
        <Chip
          label={election.status.toUpperCase()}
          color={getStatusColor(election.status)}
          sx={{ ml: 'auto' }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Election Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>
                {election.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Start Time:</strong> {format(new Date(election.startTime), 'PPp')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>End Time:</strong> {format(new Date(election.endTime), 'PPp')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Blockchain Election ID:</strong> {election.blockchainElectionId}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Candidates
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {election.candidates.map((candidate, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{candidate.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {candidate.party}
                        </Typography>
                        {tally && (
                          <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                            {tally.tallies?.[candidate.name] || 0} votes
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {tally && chartData.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Results Chart
                </Typography>
                <Divider sx={{ my: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="candidate" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Statistics
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>
                  <strong>Total Voters:</strong> {election.metadata?.totalVoters || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VoteIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography>
                  <strong>Votes Committed:</strong> {election.metadata?.votesCommitted || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography>
                  <strong>Votes Revealed:</strong> {election.metadata?.votesRevealed || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Actions
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {election.status === 'created' && (
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={handleOpenElection}
                  >
                    Open Election
                  </Button>
                )}
                {election.status === 'open' && (
                  <Button
                    variant="contained"
                    color="warning"
                    fullWidth
                    onClick={handleCloseElection}
                  >
                    Close Election
                  </Button>
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/admin/eligibility/${id}`)}
                >
                  Manage Voters
                </Button>
                {(election.status === 'closed' || election.status === 'tallied') && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={fetchTally}
                  >
                    Refresh Tally
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ElectionDetails;
