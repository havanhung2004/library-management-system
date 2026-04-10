import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Search from './pages/Search';
import BookDetails from './pages/BookDetails';
import Profile from './pages/Profile';
import Fines from './pages/Fines';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminCategories from './pages/admin/AdminCategories';
import AdminLoans from './pages/admin/AdminLoans';
import AdminFines from './pages/admin/AdminFines';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import ProjectGuide from './pages/ProjectGuide';
import TechnicalGuide from './pages/TechnicalGuide';
import Chatbot from './components/ai/Chatbot';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/books/:bookId" element={<BookDetails />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/fines" element={
                <ProtectedRoute>
                  <Fines />
                </ProtectedRoute>
              } />
              <Route path="/guide" element={<ProjectGuide />} />
              <Route path="/tech-guide" element={<TechnicalGuide />} />
              <Route path="/admin/*" element={
                <ProtectedRoute roles={['admin', 'librarian', 'superadmin']}>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/books" element={<AdminBooks />} />
                      <Route path="/categories" element={<AdminCategories />} />
                      <Route path="/loans" element={<AdminLoans />} />
                      <Route path="/fines" element={<AdminFines />} />
                      <Route path="/documents" element={<AdminDocuments />} />
                      <Route path="/users" element={<AdminUsers />} />
                      <Route path="/reports" element={<AdminReports />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Chatbot />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
