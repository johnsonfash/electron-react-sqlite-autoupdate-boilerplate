import { Toaster } from 'react-hot-toast';
import { Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { InternetProvider } from './context/InternetContext';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Users from './pages/Users';
import Container from './component/Container';

export default function App() {

  return (
    <InternetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Container><Outlet /></Container>} >
            <Route index element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="*" element={<>404</>} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </InternetProvider>
  );
}
