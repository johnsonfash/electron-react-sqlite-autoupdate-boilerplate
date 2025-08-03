import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { InternetProvider } from './context/InternetContext';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Users from './pages/Users';

export default function App() {

  return (
    <InternetProvider>
      <Router>
        <div className="flex flex-col h-screen">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="*" element={<>404</>} />
              </Routes>
            </div>
          </div>
        </div>
        <Toaster />
      </Router>
    </InternetProvider>
  );
}
