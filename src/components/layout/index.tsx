import React from 'react';
import { Outlet } from 'react-router-dom';
import 'styles/globals.css';
import Footer from 'components/footer';
import Metadata from 'components/metadata';
import ContactButton from 'components/contact-button';

const Layout: React.FC = () => {
  return (
    <div>
      <Metadata />
      <Outlet />
      <Footer />
      <ContactButton />
    </div>
  );
}

export default Layout;