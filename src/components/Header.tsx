import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sun, Moon, User, LogOut, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Live Performs', href: '/live-performs' },
    { name: 'Statistics', href: '/statistics' },
    { name: 'Conversions', href: '/conversions' },
    { name: 'Performs Team', href: '/performs-team' },
  ];

  const mobileNavigation = [
    { name: 'Live Performs', label: 'Live Performs', href: '/live-performs' },
    { name: 'Stats', label: 'Stats', href: '/statistics' },
    { name: 'Conv', label: 'Conv', href: '/conversions' },
    { name: 'Perform', label: 'Perform', href: '/performs-team' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="px-3 sm:px-6 lg:px-8">
        {/* MOBILE HEADER */}
        <div className="flex flex-col md:hidden items-center py-2 gap-2 w-full">
          {/* Logo Center */}
          <Link to="/" className="text-lg font-bold text-primary text-center w-full">REALTIME</Link>
          {/* Menu Horizontal */}
          <nav className="w-full flex overflow-x-auto scrollbar-hide whitespace-nowrap">
            {mobileNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`inline-block min-w-max text-center px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Icon Center */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-8 h-8 p-0"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={handleLogout}
              title="Logout"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* DESKTOP HEADER */}
        <div className="hidden md:flex flex-row justify-between items-center h-auto py-2 gap-2">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="text-lg sm:text-xl font-bold text-primary">
              REALTIME
            </Link>
          </div>
          {/* Navigation */}
          <nav className="flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 p-0"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 sm:w-9 sm:h-9 p-0"
              onClick={handleLogout}
              title="Logout"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
