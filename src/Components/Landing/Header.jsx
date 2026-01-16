import React from 'react';

import { useNavigate } from 'react-router';
import { AppRoute } from '../../types';
const logo = '/logo/Logo.png';
const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 py-4 md:py-6 relative z-50 bg-white/20 backdrop-blur-md border-b border-white/20 md:bg-transparent md:backdrop-blur-none md:border-none">
      <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(AppRoute.HOME)}>
          <span className="font-bold text-xl text-[#1A1A1A] tracking-tighter uppercase flex items-center gap-2">
            <img className='w-10 h-10 md:w-16 md:h-16' src={logo} alt="" />
            <span className="md:inline">AI MALL</span>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
