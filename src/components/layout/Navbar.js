import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  Dashboard as DashboardIcon,
  AccountCircle,
  ExitToApp,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useBlockchain } from '../../context/BlockchainContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { account, isConnected, connectWallet, disconnectWallet } = useBlockchain();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleWalletAction = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Toolbar>
        <VoteIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4, fontWeight: 700 }}>
          Blockchain Voting
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{
              backgroundColor: isActive('/') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            }}
          >
            Home
          </Button>

          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/admin/dashboard"
                startIcon={<DashboardIcon />}
                sx={{
                  backgroundColor: isActive('/admin/dashboard') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                }}
              >
                Admin Dashboard
              </Button>
            </>
          )}

          <Button
            color="inherit"
            component={Link}
            to="/voter/dashboard"
            sx={{
              backgroundColor: isActive('/voter/dashboard') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            }}
          >
            Vote
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {account && (
            <Chip
              icon={<LockIcon />}
              label={`${account.slice(0, 6)}...${account.slice(-4)}`}
              color="default"
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
            />
          )}

          {!isConnected && (
            <Button
              color="inherit"
              variant="outlined"
              onClick={handleWalletAction}
              sx={{ borderColor: 'white', color: 'white' }}
            >
              Connect Wallet
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <IconButton
                onClick={handleMenuOpen}
                sx={{ color: 'white' }}
              >
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  <AccountCircle />
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box>
              <Button
                color="inherit"
                component={Link}
                to="/login"
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
                variant="outlined"
                sx={{ ml: 1, borderColor: 'white', color: 'white' }}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
