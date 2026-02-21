import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const VerifyVote = () => {
  const [txHash, setTxHash] = useState('');
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!txHash.trim()) {
      toast.error('Please enter a transaction hash');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/votes/verify/${txHash}`);
      setVerification(res.data.data);
      toast.success('Verification complete');
    } catch (error) {
      toast.error('Failed to verify vote');
      setVerification(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Verify Your Vote
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Enter Transaction Hash
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter the transaction hash you received when you cast your vote to verify it on the blockchain.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Transaction Hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
            />
            <Button
              variant="contained"
              onClick={handleVerify}
              disabled={loading || !txHash.trim()}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify'}
            </Button>
          </Box>

          {verification && (
            <Box>
              <Alert
                severity={verification.verified ? 'success' : 'warning'}
                icon={<VerifiedIcon />}
                sx={{ mb: 3 }}
              >
                {verification.verified
                  ? 'Vote verified successfully on blockchain!'
                  : 'Unable to verify vote on blockchain'}
              </Alert>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                Vote Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Election
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {verification.vote.election}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                Transaction Information
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Transaction Hash:
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(verification.transaction.hash)}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Chip
                  label={verification.transaction.hash}
                  onClick={() => copyToClipboard(verification.transaction.hash)}
                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Block Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {verification.transaction.blockNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={verification.transaction.status}
                    color={verification.transaction.status === 'Success' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Gas Used
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {verification.transaction.gasUsed?.toLocaleString() || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Confirmations
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {verification.transaction.confirmations || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default VerifyVote;
