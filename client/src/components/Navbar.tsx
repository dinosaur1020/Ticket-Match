import { Link, useNavigate } from 'react-router-dom';
import { Ticket, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user && Array.isArray(user.roles) && user.roles.includes('Admin');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TicketMatch</span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Events</Link>
            <Link to="/listings" className="text-gray-600 hover:text-blue-600 font-medium">Listings</Link>
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{user.user_name || user.email}</span>
                </Link>
                <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-600"
                    title="Logout"
                >
                    <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/register" className="text-gray-600 hover:text-blue-600 font-medium">
                  Register
                </Link>
                <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-colors">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

