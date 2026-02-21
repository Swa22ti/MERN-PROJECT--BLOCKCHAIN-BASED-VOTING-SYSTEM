import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageEligibility = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [voters, setVoters] = useState([]);
  const [newVoter, setNewVoter] = useState({ voterId: '', walletAddress: '' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [electionId]);

  const fetchData = async () => {
    try {
      const [electionRes, votersRes] = await Promise.all([
        axios.get(`/api/elections/${electionId}`),
        axios.get(`/api/voters/${electionId}`),
      ]);
      setElection(electionRes.data.data);
      setVoters(votersRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoter = async () => {
    if (!newVoter.voterId || !newVoter.walletAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await axios.post('/api/voters/bulk', {
        electionId,
        voters: [newVoter],
      });
      toast.success('Voter added successfully');
      setNewVoter({ voterId: '', walletAddress: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add voter');
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter((line) => line.trim());
        const voters = lines.map((line) => {
          const [voterId, walletAddress] = line.split(',').map((s) => s.trim());
          return { voterId, walletAddress };
        }).filter((v) => v.voterId && v.walletAddress);

        await axios.post('/api/voters/bulk', {
          electionId,
          voters,
        });
        toast.success(`Successfully registered ${voters.length} voters`);
        fetchData();
      } catch (error) {
        toast.error('Failed to upload voters');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(`/admin/election/${electionId}`)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Manage Voter Eligibility - {election?.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Add Single Voter
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Voter ID"
                  value={newVoter.voterId}
                  onChange={(e) => setNewVoter({ ...newVoter, voterId: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Wallet Address"
                  value={newVoter.walletAddress}
                  onChange={(e) => setNewVoter({ ...newVoter, walletAddress: e.target.value })}
                  fullWidth
                />
                <Button variant="contained" onClick={handleAddVoter}>
                  Add Voter
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Bulk Upload
              </Typography>
              <Alert severity="info" sx={{ mb: 2, mt: 2 }}>
                Upload a CSV file with format: voterId,walletAddress (one per line)
              </Alert>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
                disabled={uploading}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Upload CSV'}
                <input
                  type="file"
                  hidden
                  accept=".csv,.txt"
                  onChange={handleBulkUpload}
                />
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Registered Voters ({voters.length})
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Voter ID</TableCell>
                  <TableCell>Wallet Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Vote Committed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voters.map((voter) => (
                  <TableRow key={voter._id}>
                    <TableCell>{voter.voterId}</TableCell>
                    <TableCell>
                      {`${voter.walletAddress.slice(0, 10)}...${voter.walletAddress.slice(-8)}`}
                    </TableCell>
                    <TableCell>
                      {voter.registeredOnChain ? (
                        <Chip label="Registered" color="success" size="small" />
                      ) : (
                        <Chip label="Pending" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {voter.voteCommitted ? (
                        <Chip label="Yes" color="success" size="small" />
                      ) : (
                        <Chip label="No" color="default" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ManageEligibility;
