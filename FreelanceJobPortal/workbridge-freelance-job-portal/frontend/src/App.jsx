import { Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() { return <div className="app-shell"><Header /><main className="flex-grow-1"><Routes><Route path="/" element={<Home />} /><Route path="/jobs" element={<Jobs />} /><Route path="/jobs/:id" element={<JobDetail />} /><Route path="/login" element={<Auth mode="login" />} /><Route path="/register" element={<Auth mode="register" />} /><Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /><Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} /><Route path="*" element={<NotFound />} /></Routes></main><Footer /></div>; }

