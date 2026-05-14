import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div style={{ marginLeft: '240px', padding: '24px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;