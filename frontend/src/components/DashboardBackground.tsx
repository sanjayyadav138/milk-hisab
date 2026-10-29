import React from 'react';

export default function DashboardBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Top Panoramic Farm Banner with Soft Gradient Fade */}
      <div className="absolute top-0 left-0 right-0 h-44 sm:h-56 overflow-hidden opacity-25">
        <img 
          src="/media/banner-image-2.jpg" 
          alt="" 
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f9fafb]/10 via-[#f9fafb]/70 to-[#f9fafb]" />
      </div>

      {/* Left Gutter: Fluid 3D Milk Wave Splash Background Art */}
      <img 
        src="/media/milk-image2.png" 
        alt="" 
        className="fixed -left-12 2xl:left-0 top-24 w-80 2xl:w-[28rem] opacity-20 hidden lg:block drop-shadow-sm transition duration-700"
      />

      {/* Right Gutter: Fresh Milk Splash Droplets Background Art */}
      <img 
        src="/media/milk-image.png" 
        alt="" 
        className="fixed -right-6 2xl:right-4 top-28 w-72 2xl:w-88 opacity-20 hidden lg:block drop-shadow-sm transition duration-700"
      />

      {/* Right Bottom: Subtle Desi Cow Watermark */}
      <img 
        src="/media/cow-image.png" 
        alt="" 
        className="fixed right-6 2xl:right-16 bottom-10 w-44 2xl:w-56 opacity-15 hidden xl:block"
      />
    </div>
  );
}
