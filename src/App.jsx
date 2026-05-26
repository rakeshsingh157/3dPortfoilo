import React, { Suspense, lazy, useEffect } from 'react';
import Hero from './components/Hero';
import Navbar from './components/Navbar';

// Lazy load non-critical sections for performance
const About = lazy(() => import('./components/About'));
const Services = lazy(() => import('./components/Services'));
const Portfolio = lazy(() => import('./components/Portfolio'));
const FrameScrollAnimation = lazy(() => import('./components/FrameScrollAnimation'));
const Contact = lazy(() => import('./components/Contact'));

function App() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      
      <Suspense fallback={<div className="h-screen bg-black" />}>
        {/* Welcome to Portfolio Section */}
        <FrameScrollAnimation frameCount={240} />
        <About />
        <Portfolio />
        <Services />
        <Contact />
      </Suspense>
    </>
  );
}

export default App;
