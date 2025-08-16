import React from 'react';
import { NavLink } from 'react-router-dom';
// An icon could go here, for now using a simple text logo
// import { RocketLaunchIcon } from '@heroicons/react/24/solid';

const navLinks = [
  { name: 'Add Trade', href: '/add' },
  { name: 'Journal', href: '/journal' },
  { name: 'Analytics', href: '/' },
  { name: 'Settings', href: '/settings' },
];

const Sidebar = () => {
  const baseLinkStyle = "flex items-center px-4 py-3 text-neutral-text font-mono transition-all duration-200 ease-in-out rounded-lg";
  const hoverStyle = "hover:bg-highlight hover:text-background hover:shadow-glow-highlight";
  const activeStyle = "bg-highlight text-background shadow-glow-highlight";

  return (
    <aside className="w-64 h-full bg-background border-r border-border-dark flex flex-col p-4">
      <div className="flex items-center mb-10 px-2">
        {/* <RocketLaunchIcon className="h-8 w-8 text-highlight mr-2" /> */}
        <h1 className="text-2xl font-bold text-highlight font-mono">TradeLog</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            end={link.href === '/'} // `end` prop for home link to prevent matching all routes
            className={({ isActive }) =>
              `${baseLinkStyle} ${isActive ? activeStyle : hoverStyle}`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 text-center text-xs text-border-light font-mono">
        <p>v1.0.0</p>
        <p>Offline Mode</p>
      </div>
    </aside>
  );
};

export default Sidebar;
