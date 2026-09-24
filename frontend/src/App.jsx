import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminPortal from './pages/AdminPortal';
import UserPortal from './pages/UserPortal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes */}
        <Route 
          path="/admin" 
          element={
            localStorage.getItem('token') ? (
              <AdminPortal />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        <Route 
          path="/user" 
          element={
            localStorage.getItem('token') ? (
              <UserPortal />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;