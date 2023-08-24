import React from 'react';
import { useRouter } from 'next/router';





const HomePage = () => {
  const router = useRouter();

  const navigateToOCRPage = () => {
    // Navigate to the OCR page route
    console.log('Navigating to OCR Page');

    router.push('/components/ocr');
  };

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <button onClick={navigateToOCRPage}>check</button>
    </div>
  );
};


export default HomePage;


