import React from 'react';

import { useNavigate } from 'react-router';
import { AppRoute } from '../../types';
const logo = '/logo/Logo.png';
const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="py-6 relative z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(AppRoute.HOME)}>

          <span className="font-bold text-xl text-[#1A1A1A] tracking-tighter uppercase"><img className='w-12 h-12 md:w-16 md:h-16' src={logo} alt="" /> AI MALL</span>
        </div>

      </div>
    </header>
  );
};

export default Header;
