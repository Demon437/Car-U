// import { Link } from "react-router-dom";
// import { Car, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

// const Footer = () => {
//   return (
//     <footer
//       className="
//     bg-gradient-to-b from-black via-black/90 to-black
//     border-t border-blue-500/20
//     text-gray-300
//   "
//     >
//       <div className="container mx-auto px-4 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

//           {/* Brand */}
//           <div className="space-y-6">
//             <Link to="/" className="flex items-center gap-3">
//               <img
//                 src="/logo.png"
//                 alt="Prajapati Mukati Motors Logo"
//                 className="
//               h-20 w-full object-contain 
//               drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]
//               transition-transform duration-300 hover:scale-105
//             "
//               />
//             </Link>

//             <p className="text-gray-400 text-sm leading-relaxed">
//               Your trusted partner for buying and selling cars. Over 10,000+ satisfied customers and counting.
//             </p>

//             <div className="flex gap-4">
//               {[
//                 { icon: <Facebook className="w-5 h-5" />, link: "https://www.facebook.com/share/1BgHRsefef/?mibextid=wwXIfr" },
//                 { icon: <Twitter className="w-5 h-5" />, link: "#" },
//                 { icon: <Instagram className="w-5 h-5" />, link: "#" },
//                 { icon: <Youtube className="w-5 h-5" />, link: "https://youtube.com/@rahulmukati796?si=JHdiMy1HZBSXnabM" },
//               ].map((item, i) => (
//                 <a
//                   key={i}
//                   href={item.link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="
//                 w-10 h-10 rounded-full
//                 bg-white/5 border border-white/10
//                 flex items-center justify-center
//                 text-gray-400
//                 hover:bg-[rgb(194_171_49)]
//                 hover:text-black
//                 transition-all
//               "
//                 >
//                   {item.icon}
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div className="space-y-6">
//             <h4 className="font-display font-semibold text-white">Quick Links</h4>
//             <ul className="space-y-3">
//               {["Buy Car", "Sell Car", "Compare Cars", "Car Valuation", "Book Test Drive"].map((link) => (
//                 <li key={link}>
//                   <a href="#" className="text-gray-400 text-sm hover:text-[rgb(194_171_49)] transition-colors">
//                     {link}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Popular Brands */}
//           <div className="space-y-6">
//             <h4 className="font-display font-semibold text-white">Popular Brands</h4>
//             <ul className="space-y-3">
//               {["BMW", "Mercedes-Benz", "Audi", "Toyota", "Honda", "Hyundai"].map((brand) => (
//                 <li key={brand}>
//                   <a href="#" className="text-gray-400 text-sm hover:text-[rgb(194_171_49)] transition-colors">
//                     {brand}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Contact */}
//           <div className="space-y-6">
//             <h4 className="font-display font-semibold text-white">Contact Us</h4>
//             <ul className="space-y-4">
//               <li className="flex items-start gap-3">
//                 <MapPin className="w-5 h-5 text-[rgb(194_171_49)] flex-shrink-0 mt-0.5" />
//                 <span className="text-gray-400 text-sm">
//                   Rau Circle, Over Bridge Near Baba Ram Dev Restaurant<br />
//                   Rau, 453331<br />
//                   Madhya Pradesh, India
//                 </span>
//               </li>



//               <li className="flex items-center gap-3">
//                 <Phone className="w-5 h-5 text-[rgb(194_171_49)] flex-shrink-0" />
//                 <a href="tel:+911234567890" className="text-gray-400 text-sm hover:text-[rgb(194_171_49)] transition-colors">
//                   +91 7000366498
//                 </a>
//               </li>
//               <li className="flex items-center gap-3">
//                 <Phone className="w-5 h-5 text-[rgb(194_171_49)] flex-shrink-0" />
//                 <a href="tel:+911234567890" className="text-gray-400 text-sm hover:text-[rgb(194_171_49)] transition-colors">
//                   +91 7000366498
//                 </a>
//               </li>

//               <li className="flex items-center gap-3">
//                 <Mail className="w-5 h-5 text-[rgb(194_171_49)] flex-shrink-0" />
//                 <a href="mailto:prajapatimukatimotors@gmail.com" className="text-gray-400 text-sm hover:text-[rgb(194_171_49)] transition-colors">
//                  demo@gmail.com
//                 </a>
//               </li>
//             </ul>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="border-t border-blue-500/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
//           <p className="text-gray-500 text-sm">
//             © 2024 Prajapati Mukati Motors. All rights reserved.
//           </p>

//           <div className="flex gap-6">
//             <a href="#" className="text-gray-500 text-sm hover:text-[rgb(194_171_49)] transition-colors">
//               Privacy Policy
//             </a>
//             <a href="#" className="text-gray-500 text-sm hover:text-[rgb(194_171_49)] transition-colors">
//               Terms of Service
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>


//   );
// };

// export default Footer;

import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#f6f7f9] border-t border-gray-200 text-gray-600">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">

            </Link>

            <p className="text-gray-500 text-sm leading-relaxed">
              Your trusted partner for buying and selling cars. Over 10,000+ satisfied customers and counting.
            </p>

            <div className="flex gap-4">
              {[
                { icon: <Facebook className="w-5 h-5" />, link: "https://www.facebook.com/share/1BgHRsefef/?mibextid=wwXIfr" },
                { icon: <Twitter className="w-5 h-5" />, link: "#" },
                { icon: <Instagram className="w-5 h-5" />, link: "https://www.instagram.com/united_motors_indore?igsh=MXVvbHF2czJ0YWZvaQ==" },
                { icon: <Youtube className="w-5 h-5" />, link: "https://youtube.com/@rahulmukati796?si=JHdiMy1HZBSXnabM" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-10 h-10 rounded-full
                    bg-white border border-gray-200
                    flex items-center justify-center
                    text-gray-500
                    hover:bg-red-600 hover:text-white hover:border-red-600
                    transition-all duration-300
                  "
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900">Quick Links</h4>
            <ul className="space-y-3">
              {["Buy Car", "Sell Car", "Compare Cars", "Car Valuation", "Book Test Drive"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-500 text-sm hover:text-red-600 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Brands */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900">Popular Brands</h4>
            <ul className="space-y-3">
              {["BMW", "Mercedes-Benz", "Audi", "Toyota", "Honda", "Hyundai"].map((brand) => (
                <li key={brand}>
                  <a href="#" className="text-gray-500 text-sm hover:text-red-600 transition-colors">
                    {brand}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-500 text-sm">
                  Ganesh Mandir Gate, Ring Road,<br />
                  near Khajrana Road, Khajrana Square,<br />
                  Ganeshpuri, Khajrana, Indore,<br />
                  Madhya Pradesh 452016
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-600" />
                <a href="tel:+917000366498" className="text-gray-500 text-sm hover:text-red-600">
                  +91 7000366498
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-600" />
                <a href="tel:+919425092196" className="text-gray-500 text-sm hover:text-red-600">
                  +91 9425092196
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-red-600" />
                <a href="mailto:sale@unitedmotorsindia.com" className="text-gray-500 text-sm hover:text-red-600">
                  sale@unitedmotorsindia.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 United Motors. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a href="#" className="text-gray-400 text-sm hover:text-red-600">Privacy Policy</a>
            <a href="#" className="text-gray-400 text-sm hover:text-red-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
