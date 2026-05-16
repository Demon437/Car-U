import React, { useEffect, useRef } from 'react'

const MapComponent = () => {
  const mapRef = useRef<HTMLIFrameElement>(null);

  // Default location (you can change this to your business location)
  const businessLocation = {
    lat: 22.7745,
    lng: 75.8945,
    address: "Ganesh Mandir Gate, Ring Road, near Khajrana Road, Khajrana Square, Ganeshpuri, Khajrana, Indore, Madhya Pradesh 452016"
  };

  // Generate Google Maps embed URL
  const mapUrl = `https://maps.google.com/maps?q=${businessLocation.lat},${businessLocation.lng}&z=15&output=embed`;

  return (
    <div className="w-full h-full min-h-[400px]">
      {/* Map Container */}
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
        <iframe
          ref={mapRef}
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full min-h-[400px]"
          title="Business Location Map"
        />

        {/* Map Overlay Info */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-3 max-w-xs">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <svg
              className="w-4 h-4 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            Our Location
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {businessLocation.address}
          </p>
        </div>

        {/* Get Directions Button */}
        <div className="absolute bottom-4 right-4">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${businessLocation.lat},${businessLocation.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Get Directions
          </a>
        </div>
      </div>

      {/* Additional Contact Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Visit Our Showroom</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p> {businessLocation.address}</p>
          <p> Mon-Sat: 10:00 AM - 6:30 PM</p>
          <p> Sunday: Off </p>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;