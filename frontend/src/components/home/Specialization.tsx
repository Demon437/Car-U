// import { motion } from "framer-motion";
// import { Sparkles, Award, TrendingUp, Shield } from "lucide-react";

// const specializations = [
//   { icon: Sparkles, title: "Luxury Sedans", count: "250+", description: "Premium comfort and performance" },
//   { icon: Award, title: "Sport SUVs", count: "180+", description: "Power meets versatility" },
//   { icon: TrendingUp, title: "Electric Vehicles", count: "90+", description: "The future of sustainable driving" },
//   { icon: Shield, title: "Vintage Classics", count: "45+", description: "Timeless pieces for collectors" },
// ];

// export const Specialization = () => (
//   <section className="py-24 bg-secondary/10 relative">
//     <div className="container mx-auto px-4 text-center max-w-3xl mb-20">
//       <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Our Expertise</h2>
//       <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6" />
//       <p className="text-muted-foreground text-lg">We specialize in niche categories to ensure you find exactly what your heart desires.</p>
//     </div>
//     <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//       {specializations.map((spec, idx) => (
//         <motion.div key={spec.title} whileHover={{ y: -10 }} className="bg-card p-10 rounded-2xl border border-border/50 text-center group shadow-sm hover:shadow-glow transition-all">
//           <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
//             <spec.icon className="w-8 h-8" />
//           </div>
//           <h3 className="text-primary text-4xl font-bold mb-2 tracking-tighter">{spec.count}</h3>
//           <h4 className="text-xl font-display font-semibold mb-3">{spec.title}</h4>
//           <p className="text-sm text-muted-foreground leading-relaxed">{spec.description}</p>
//         </motion.div>
//       ))}
//     </div>
//   </section>
// );


import { motion } from "framer-motion";
import { Sparkles, Award, TrendingUp, Shield } from "lucide-react";

const specializations = [
  { icon: Sparkles, title: "Luxury Sedans", count: "250+", description: "Premium comfort and performance" },
  { icon: Award, title: "Sport SUVs", count: "180+", description: "Power meets versatility" },
  { icon: TrendingUp, title: "Electric Vehicles", count: "90+", description: "The future of sustainable driving" },
  { icon: Shield, title: "Vintage Classics", count: "45+", description: "Timeless pieces for collectors" },
];

export const Specialization = () => (
  <section className="relative py-24 bg-[#f8fafc] overflow-hidden">

    {/* 🔥 SOFT BACKGROUND GLOW */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-100 blur-[120px] rounded-full opacity-40" />

    {/* HEADING */}
    <div className="relative max-w-7xl mx-auto px-6 text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
        Browse by <span className="text-red-600">Category</span>
      </h2>

      <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
        Discover vehicles across carefully curated categories tailored for every lifestyle.
      </p>
    </div>

    {/* CARDS */}
    <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

      {specializations.map((spec, index) => (
        <motion.div
          key={spec.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="
            group relative p-8 rounded-2xl text-center
            bg-white
            border border-gray-200
            shadow-sm
            hover:shadow-xl
            transition-all duration-300
          "
        >

          {/* ICON */}
          <div className="
            w-14 h-14 mx-auto mb-6
            rounded-xl
            bg-red-50
            flex items-center justify-center
            transition group-hover:bg-red-100
          ">
            <spec.icon className="w-6 h-6 text-red-500" />
          </div>

          {/* COUNT */}
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {spec.count}
          </h3>

          {/* TITLE */}
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            {spec.title}
          </h4>

          {/* DESC */}
          <p className="text-sm text-gray-500 leading-relaxed">
            {spec.description}
          </p>

          {/* 🔥 HOVER BORDER GLOW */}
          <div className="absolute inset-0 rounded-2xl border border-red-500/0 group-hover:border-red-400/40 transition" />

        </motion.div>
      ))}

    </div>
  </section>
);