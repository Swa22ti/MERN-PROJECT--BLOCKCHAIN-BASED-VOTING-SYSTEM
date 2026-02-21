import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  HowToVote as VoteIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    created: 0,
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get('/api/elections');
      setElections(res.data.data);
      
      // Calculate stats
      const total = res.data.data.length;
      const open = res.data.data.filter((e) => e.status === 'open').length;
      const closed = res.data.data.filter((e) => e.status === 'closed').length;
      const created = res.data.data.filter((e) => e.status === 'created').length;
      
      setStats({ total, open, closed, created });
    } catch (error) {
      toast.error('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenElection = async (electionId) => {
    try {
      await axios.put(`/api/elections/${electionId}/open`);
      toast.success('Election opened successfully');
      fetchElections();
    } catch (error) {
      toast.error('Failed to open election');
    }
  };

  const handleCloseElection = async (electionId) => {
    try {
      await axios.put(`/api/elections/${electionId}/close`);
      toast.success('Election closed successfully');
      fetchElections();
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/create-election')}
          size="large"
        >
          Create Election
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Elections
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Created
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {stats.created}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Open
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.open}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Closed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.closed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {elections.length === 0 ? (
        <Alert severity="info">
          No elections found. Create your first election to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {elections.map((election) => (
            <Grid item xs={12} md={6} key={election._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {election.name}
                    </Typography>
                    <Chip
                      label={election.status.toUpperCase()}
                      color={getStatusColor(election.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {election.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box>
                      <PeopleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      <Typography variant="body2" display="inline">
                        {election.metadata?.totalVoters || 0} voters
                      </Typography>
                    </Box>
                    <Box>
                      <VoteIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      <Typography variant="body2" display="inline">
                        {election.metadata?.votesCommitted || 0} votes
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Start:</strong> {format(new Date(election.startTime), 'PPp')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>End:</strong> {format(new Date(election.endTime), 'PPp')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/admin/election/${election._id}`)}
                  >
                    View Details
                  </Button>
                  {election.status === 'created' && (
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handleOpenElection(election._id)}
                    >
                      Open Election
                    </Button>
                  )}
                  {election.status === 'open' && (
                    <Button
                      size="small"
                      color="warning"
                      onClick={() => handleCloseElection(election._id)}
                    >
                      Close Election
                    </Button>
                  )}
                  <Button
                    size="small"
                    onClick={() => navigate(`/admin/eligibility/${election._id}`)}
                  >
                    Manage Voters
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminDashboard;
