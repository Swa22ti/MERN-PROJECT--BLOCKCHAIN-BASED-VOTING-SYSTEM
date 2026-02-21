import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useBlockchain } from '../../context/BlockchainContext';

const VoterDashboard = () => {
  const navigate = useNavigate();
  const { account, isConnected, connectWallet } = useBlockchain();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligibilityChecks, setEligibilityChecks] = useState({});

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (account && elections.length > 0) {
      checkEligibilities();
    }
  }, [account, elections]);

  const fetchElections = async () => {
    try {
      const res = await axios.get('/api/elections');
      const openElections = res.data.data.filter((e) => e.status === 'open');
      setElections(openElections);
    } catch (error) {
      toast.error('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibilities = async () => {
    const checks = {};
    for (const election of elections) {
      try {
        const res = await axios.get(
          `/api/voters/check/${election._id}/${account}`
        );
        checks[election._id] = res.data.eligible;
      } catch (error) {
        checks[election._id] = false;
      }
    }
    setEligibilityChecks(checks);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'closed':
        return 'warning';
      default:
        return 'default';
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Available Elections
        </Typography>
        {!isConnected && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Please connect your wallet to vote. Click the "Connect Wallet" button in the navigation bar.
          </Alert>
        )}
        {isConnected && account && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Connected: {account.slice(0, 10)}...{account.slice(-8)}
          </Alert>
        )}
      </Box>

      {elections.length === 0 ? (
        <Alert severity="info">
          No open elections available at the moment.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {elections.map((election) => {
            const isEligible = eligibilityChecks[election._id];
            const canVote = isConnected && isEligible && election.status === 'open';

            return (
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
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Start:</strong> {format(new Date(election.startTime), 'PPp')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>End:</strong> {format(new Date(election.endTime), 'PPp')}
                      </Typography>
                    </Box>
                    {account && (
                      <Box sx={{ mt: 2 }}>
                        {isEligible === true && (
                          <Chip
                            icon={<CheckIcon />}
                            label="Eligible to vote"
                            color="success"
                            size="small"
                          />
                        )}
                        {isEligible === false && (
                          <Chip
                            icon={<InfoIcon />}
                            label="Not registered"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<VoteIcon />}
                      onClick={() => navigate(`/voter/cast-vote/${election._id}`)}
                      disabled={!canVote}
                    >
                      {canVote ? 'Cast Vote' : !isConnected ? 'Connect Wallet' : !isEligible ? 'Not Eligible' : 'Election Closed'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Verify Your Vote
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter a transaction hash to verify your vote on the blockchain
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/voter/verify')}
              startIcon={<CheckIcon />}
            >
              Verify Vote
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default VoterDashboard;
