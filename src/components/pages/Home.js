import React from 'react';
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
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Dashboard as DashboardIcon,
  Lock as LockIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Tamper-Evident',
      description: 'All votes are recorded on blockchain ensuring immutability and transparency',
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Verifiable Results',
      description: 'Every vote can be verified using transaction IDs and block numbers',
    },
    {
      icon: <LockIcon sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Privacy Protected',
      description: 'Commit-reveal scheme ensures vote privacy during the voting period',
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Audit Trail',
      description: 'Complete transaction history with timestamps and confirmation counts',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pt: 8,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8, color: 'white' }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Blockchain-Based Voting System
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Secure, Transparent, and Verifiable Elections on the Blockchain
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            {!isAuthenticated ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/voter/dashboard')}
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                    px: 4,
                  }}
                >
                  Start Voting
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                    px: 4,
                  }}
                >
                  Admin Login
                </Button>
              </>
            ) : user?.role === 'admin' ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/admin/dashboard')}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                  px: 4,
                }}
              >
                Go to Admin Dashboard
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                startIcon={<VoteIcon />}
                onClick={() => navigate('/voter/dashboard')}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                  px: 4,
                }}
              >
                Cast Your Vote
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  p: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center', color: 'white' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  1. Admin Creates Election
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administrator sets up the election with candidates and voting period
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  2. Voters Cast Votes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Eligible voters commit their encrypted vote to the blockchain
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  3. Reveal & Tally
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  After voting closes, votes are revealed and tallied automatically
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
