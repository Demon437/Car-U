// import { motion } from "framer-motion";
// import { Shield, CheckCircle, Star, TrendingUp } from "lucide-react";
// import whyChooseImg from "@/assets/herrier.png";

// const whyChooseUs = [
//   { icon: Shield, title: "Verified Cars", description: "Every car goes through 200+ inspection points" },
//   { icon: CheckCircle, title: "No Hidden Charges", description: "Transparent pricing with no surprise fees" },
//   { icon: Star, title: "Best Prices", description: "Get the best market value for your car" },
//   { icon: TrendingUp, title: "Easy Finance", description: "Quick loan approval with low EMI options" },
// ];

// export const WhyChooseUs = () => (
//   <section className="py-24 overflow-hidden">
//     <div className="container mx-auto px-4">
//       <div className="grid lg:grid-cols-2 gap-16 items-center">
//         <motion.div
//           initial={{ opacity: 0, x: -50 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="space-y-8"
//         >
//           <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
//             Why Prajapati Mukati Motors is the <span className="text-primary">Trusted Choice</span>
//           </h2>
//           <p className="text-lg text-muted-foreground">
//             We've redefined the car buying experience with a focus on trust, speed, and luxury service.
//           </p>
//           <div className="grid sm:grid-cols-2 gap-6">
//             {whyChooseUs.map((item) => (
//               <div key={item.title} className="flex gap-4 p-4 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors">
//                 <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                   <item.icon className="w-5 h-5 text-primary" />
//                 </div>
//                 <div>
//                   <h4 className="font-bold">{item.title}</h4>
//                   <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//           className="relative aspect-square rounded-3xl overflow-hidden group"
//         >
//           <img src={whyChooseImg} alt="Why Choose" className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700" />
//           <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-transparent to-primary/20" />
//           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
//           <div className="absolute inset-0 rounded-3xl ring-1 ring-primary/20" />
//         </motion.div>
//       </div>
//     </div>
//   </section>
// );

import { motion } from "framer-motion";
import { Shield, CheckCircle, Star, TrendingUp } from "lucide-react";
import VideoImageshow from "@/pages/VideoImageshow";

const whyChooseUs = [
  { icon: Shield, title: "Verified Cars", description: "Every car goes through 200+ inspection points" },
  { icon: CheckCircle, title: "No Hidden Charges", description: "Transparent pricing with no surprise fees" },
  { icon: Star, title: "Best Prices", description: "Get the best market value for your car" },
  { icon: TrendingUp, title: "Easy Finance", description: "Quick loan approval with low EMI options" },
];

export const WhyChooseUs = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">

        {/* LEFT - CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
            Why <span className="text-blue-600"> United Motors</span> <br />
            is the Trusted Choice
          </h2>

          <p className="text-gray-600 max-w-xl text-lg">
            We've redefined the car buying experience with trust, speed, and premium service.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="flex gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT - VIDEO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="h-full"
        >
          <div className="bg-gray-100 rounded-xl p-4 h-full">
            <VideoImageshow />
          </div>
        </motion.div>

      </div>
    </div>
  </section>
);