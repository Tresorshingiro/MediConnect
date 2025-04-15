import React, { useContext, useEffect } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllPointments from './pages/Admin/AllPointments';
import DoctorsList from './pages/Admin/DoctorsList';
import AddDoctor from './pages/Admin/AddDoctor';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';

const App = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Only redirect if user is at root path or just logged in
    if ((aToken || dToken) && location.pathname === '/') {
      if (aToken) {
        navigate('/admin-dashboard');
      } else if (dToken) {
        navigate('/doctor-dashboard');
      }
    }
  }, [aToken, dToken, navigate, location.pathname]);

  // If no tokens are present, show the login page
  if (!aToken && !dToken) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    )
  }

  // If tokens are present, show the appropriate dashboard
  return (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          {/* Root path redirects to appropriate dashboard */}
          <Route path='/' element={aToken ? <Navigate to="/admin-dashboard" /> : <Navigate to="/doctor-dashboard" />} />
          
          {/* Admin Routes */}
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllPointments />} />
          <Route path='/add-doctor' element={<AddDoctor />}/>
          <Route path='/doctor-list' element={<DoctorsList />}/>

          {/* Doctor Routes */}
          <Route path='/doctor-dashboard' element={<DoctorDashboard/>}/>
          <Route path='/doctor-appointments' element={<DoctorAppointments/>}/>
          <Route path='/doctor-profile' element={<DoctorProfile/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App