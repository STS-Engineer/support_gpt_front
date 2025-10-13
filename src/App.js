import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Switch,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import axios from "axios";
import {
  Email,
  Send,
  AddComment,
  Dashboard,
  Settings,
  Person,
  SmartToy,
  ChatBubble,
  Schedule,
  CheckCircle,
  Cancel,
  Search,
  Refresh,
  Lightbulb,
} from "@mui/icons-material";

// Azure backend
const API_BASE = "https://support-ia.azurewebsites.net/api/support";
const API_CONFIRM = "https://support-ia.azurewebsites.net/api/support/confirm";

const drawerWidth = 280;

function App() {
  const theme = useTheme();
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState("");
  const [assistantName, setAssistantName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Filter comments based on search
  const filteredComments = comments.filter(comment =>
    comment.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.assistant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const stats = {
    total: comments.length,
    confirmed: comments.filter(c => c.confirmed).length,
    pending: comments.filter(c => !c.confirmed).length,
  };

  // Fetch comments
  const fetchComments = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(API_BASE);
      setComments(res.data.comments.map((c) => ({ ...c, confirmed: false })));
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to fetch comments", severity: "error" });
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Handle submit
  const handleSubmit = async () => {
    if (!username || !assistantName || !commentText) {
      setSnackbar({ open: true, message: "Please fill all fields", severity: "warning" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(API_BASE, {
        username,
        assistant_name: assistantName,
        comment: commentText,
      });
      setUsername("");
      setAssistantName("");
      setCommentText("");
      fetchComments();
      setSnackbar({ open: true, message: "Comment added successfully! 🎉", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to submit comment", severity: "error" });
    }
    setLoading(false);
  };

  // Confirm before sending email
  const handleConfirm = async (commentId, usernameEmail) => {
    if (!window.confirm(`Send confirmation email to ${usernameEmail}?`)) return;

    try {
      await axios.post(API_CONFIRM, { comment_id: commentId, email: usernameEmail });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, confirmed: true } : c))
      );
      setSnackbar({ open: true, message: `✅ Email sent to ${usernameEmail}`, severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to send email", severity: "error" });
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Enhanced Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #2c3e50 0%, #3498db 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Toolbar sx={{ 
          background: 'rgba(255,255,255,0.1)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb sx={{ fontSize: 32, color: '#f39c12' }} />
            <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', color: 'white' }}>
              SupportAI
            </Typography>
          </Box>
        </Toolbar>
        
        <List sx={{ px: 2, mt: 2 }}>
          <ListItem 
            button 
            sx={{ 
              borderRadius: 3,
              mb: 1,
              background: 'rgba(255,255,255,0.15)',
              '&:hover': { background: 'rgba(255,255,255,0.25)' }
            }}
          >
            <Dashboard sx={{ mr: 2 }} />
            <ListItemText 
              primary="Support Comments" 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
          <ListItem 
            button 
            sx={{ 
              borderRadius: 3,
              background: 'rgba(255,255,255,0.1)',
              '&:hover': { background: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Settings sx={{ mr: 2 }} />
            <ListItemText 
              primary="Settings" 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
        </List>

        {/* Stats Card in Sidebar */}
        <Box sx={{ p: 2, mt: 'auto', mb: 2 }}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total:</Typography>
                <Chip label={stats.total} size="small" color="primary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Confirmed:</Typography>
                <Chip label={stats.confirmed} size="small" color="success" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Pending:</Typography>
                <Chip label={stats.pending} size="small" color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        {/* Enhanced Navbar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            color: '#2c3e50'
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              flexGrow: 1
            }}>
              Support Dashboard
            </Typography>
            
            <Tooltip title="Refresh Comments">
              <IconButton 
                onClick={fetchComments} 
                disabled={refreshing}
                sx={{ 
                  mr: 1,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  '&:hover': { background: 'linear-gradient(45deg, #5a6fd8, #6a4190)' }
                }}
              >
                <Refresh sx={{ transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s' }} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Toolbar /> {/* spacing for AppBar */}
        
        <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
          {/* Stats Overview */}
          <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
            <Card sx={{ 
              flex: 1, 
              minWidth: 200,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                <Typography variant="body2">Total Comments</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ 
              flex: 1, 
              minWidth: 200,
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">{stats.confirmed}</Typography>
                <Typography variant="body2">Confirmed</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ 
              flex: 1, 
              minWidth: 200,
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)'
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">{stats.pending}</Typography>
                <Typography variant="body2">Pending</Typography>
              </CardContent>
            </Card>
          </Box>

        

          {/* Enhanced Comments Table */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                All Comments
              </Typography>
              
              <TextField
                placeholder="Search comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Table size="small" sx={{ 
              '& .MuiTableHead-root': { background: 'linear-gradient(45deg, #667eea, #764ba2)' },
              '& .MuiTableCell-head': { color: 'white', fontWeight: 'bold' },
              '& .MuiTableRow-root:hover': { background: 'rgba(102, 126, 234, 0.04)' }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Assistant</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComments.map((c) => (
                  <TableRow 
                    key={c.id} 
                    sx={{ 
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                    }}
                  >
                    <TableCell>
                      <Chip label={`#${c.id}`} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                          <Email sx={{ fontSize: 16 }} />
                        </Avatar>
                        {c.username}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={c.assistant_name} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Tooltip title={c.comment}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {c.comment}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {new Date(c.created_at).toLocaleString()}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={c.confirmed ? "Email Sent" : "Send Confirmation Email"}>
                        <Switch
                          checked={c.confirmed}
                          onChange={() => handleConfirm(c.id, c.username)}
                          disabled={c.confirmed}
                          color="success"
                          icon={<Cancel />}
                          checkedIcon={<CheckCircle />}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredComments.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  {searchTerm ? "No comments match your search" : "No comments available"}
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>

        {/* Enhanced Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ 
              width: "100%",
              borderRadius: 2,
              fontWeight: 'medium',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default App;