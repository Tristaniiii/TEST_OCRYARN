import React from 'react';
import Link from 'next/link';
import '../styles/globals.css';
import _app from "/pages/index"



function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav>
        
       
        <h1>Hi</h1>




        
        
 
       
       
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
