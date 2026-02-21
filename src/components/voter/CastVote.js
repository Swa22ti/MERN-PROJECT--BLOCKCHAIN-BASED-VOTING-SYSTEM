import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { Web3 } from 'web3';
import toast from 'react-hot-toast';
import { useBlockchain } from '../../context/BlockchainContext';

const CastVote = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { account, isConnected, web3: web3Context } = useBlockchain();
  const [election, setElection] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState(null);

  useEffect(() => {
    fetchElection();
  }, [electionId]);

  const fetchElection = async () => {
    try {
      const res = await axios.get(`/api/elections/${electionId}`);
      setElection(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch election details');
      navigate('/voter/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedChoice) {
      toast.error('Please select a candidate');
      return;
    }

    if (!isConnected || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    setSubmitting(true);

    try {
      // Generate salt and create commitment
      const web3 = web3Context || new Web3(window.ethereum);
      const salt = web3.utils.randomHex(32);
      const commitment = web3.utils.keccak256(
        web3.utils.encodePacked(selectedChoice, salt)
      );

      // Submit vote to backend
      const res = await axios.post('/api/votes', {
        electionId,
        choice: selectedChoice,
        walletAddress: account,
        salt: salt,
      });

      setVoteReceipt({
        commitment: res.data.data.commitment,
        salt: res.data.data.salt,
        transactionHash: res.data.data.transactionHash,
        blockNumber: res.data.data.blockNumber,
      });

      toast.success('Vote committed successfully! Save your receipt.');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cast vote';
      toast.error(message);
    } finally {
      setSubmitting(false);
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
    return null;
  }

  if (election.status !== 'open') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          This election is not currently open for voting.
        </Alert>
        <Button
          sx={{ mt: 2 }}
          onClick={() => navigate('/voter/dashboard')}
          startIcon={<BackIcon />}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (voteReceipt) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Vote Committed Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your vote has been committed to the blockchain. Save this receipt.
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                IMPORTANT: Save your salt for the reveal phase!
              </Typography>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Transaction Hash"
                value={voteReceipt.transactionHash}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Block Number"
                value={voteReceipt.blockNumber}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Salt (SAVE THIS!)"
                value={voteReceipt.salt}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
                helperText="You will need this salt to reveal your vote after the election closes"
              />
              <TextField
                fullWidth
                label="Commitment Hash"
                value={voteReceipt.commitment}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/voter/dashboard')}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/voter/dashboard')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Cast Your Vote
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {election.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {election.description}
          </Typography>

          {!isConnected && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please connect your wallet to vote.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                Select Your Candidate
              </FormLabel>
              <RadioGroup
                value={selectedChoice}
                onChange={(e) => setSelectedChoice(e.target.value)}
              >
                {election.candidates.map((candidate, index) => (
                  <FormControlLabel
                    key={index}
                    value={candidate.name}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {candidate.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {candidate.party}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 1, border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Alert severity="info" sx={{ mt: 3, mb: 2 }}>
              Your vote will be encrypted using a commit-reveal scheme. The actual choice will only be revealed after the election closes.
            </Alert>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!selectedChoice || !isConnected || submitting}
              sx={{ mt: 3 }}
            >
              {submitting ? 'Submitting...' : 'Commit Vote'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CastVote;
