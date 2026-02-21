import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';

import PrivateRoute from './components/routing/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import CreateElection from './components/admin/CreateElection';
import ManageEligibility from './components/admin/ManageEligibility';
import ElectionDetails from './components/admin/ElectionDetails';
import VoterDashboard from './components/voter/VoterDashboard';
import CastVote from './components/voter/CastVote';
import VerifyVote from './components/voter/VerifyVote';
import Home from './components/pages/Home';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      dark: '#5568d3',
      light: '#8b9ef7',
    },
    secondary: {
      main: '#764ba2',
      dark: '#5d3a7f',
      light: '#926bc5',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BlockchainProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route
                  path="/admin/*"
                  element={
                    <PrivateRoute>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="create-election" element={<CreateElection />} />
                        <Route path="election/:id" element={<ElectionDetails />} />
                        <Route path="eligibility/:electionId" element={<ManageEligibility />} />
                        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
                      </Routes>
                    </PrivateRoute>
                  }
                />
                
                <Route
                  path="/voter/*"
                  element={
                    <Routes>
                      <Route path="dashboard" element={<VoterDashboard />} />
                      <Route path="cast-vote/:electionId" element={<CastVote />} />
                      <Route path="verify" element={<VerifyVote />} />
                      <Route path="" element={<Navigate to="/voter/dashboard" replace />} />
                    </Routes>
                  }
                />
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4caf50',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#f44336',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </BlockchainProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
