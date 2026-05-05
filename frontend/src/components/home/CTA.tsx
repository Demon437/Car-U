// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { ArrowRight, Zap, CheckCircle, ShieldCheck } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export const CTA = () => (
//   <section className="py-24 relative overflow-hidden">
//     {/* Background Decorative Elements */}
//     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
//       <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary rounded-full blur-[100px] animate-pulse" />
//       <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-accent rounded-full blur-[100px] animate-pulse" />
//     </div>

//     <div className="container mx-auto px-4 relative z-10">
//       <motion.div 
//         initial={{ opacity: 0, y: 40 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//         className="relative rounded-[3.5rem] overflow-hidden bg-card border border-border/50 p-12 md:p-24 text-center group shadow-2xl"
//       >
//         {/* Animated Gradient Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 group-hover:from-primary/20 transition-all duration-700" />
        
//         {/* Pattern Overlay */}
//         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />

//         <div className="relative z-10 max-w-4xl mx-auto space-y-10">
//           {/* Informative Badges */}
//           <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-4">
//             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/50 px-4 py-2 rounded-full border border-border/50">
//               <Zap className="w-4 h-4 text-primary" />
//               <span>Instant Valuation</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/50 px-4 py-2 rounded-full border border-border/50">
//               <CheckCircle className="w-4 h-4 text-primary" />
//               <span>Best Market Price</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/50 px-4 py-2 rounded-full border border-border/50">
//               <ShieldCheck className="w-4 h-4 text-primary" />
//               <span>Paperwork Handled</span>
//             </div>
//           </div>

//           <div className="space-y-6">
//             <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-none text-foreground">
//               Ready to Sell <br /> 
//               <span className="text-[rgb(194_171_49)]">In Just 24 Hours?</span>
//             </h2>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
//               Don't let your car sit. Join 10,000+ satisfied sellers who got the best value for their premium vehicles without the stress. 
//             </p>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
//             <Button variant="hero" size="xl" className="h-16 px-10 text-lg shadow-glow-primary group w-full sm:w-auto" asChild>
//               <Link to="/sell">
//                 Get Free Valuation 
//                 <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
//               </Link>
//             </Button>
            
//             <Button variant="outline" size="xl" className="h-16 px-10 text-lg backdrop-blur-sm w-full sm:w-auto" asChild>
//               <Link to="/buy">
//                 Browse Collection
//               </Link>
//             </Button>
//           </div>

//           {/* Trust Disclaimer */}
//           <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold opacity-60">
//             No obligation • Free home inspection • Immediate payment
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   </section>
// );


import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTA = () => (
  <section className="py-24 bg-[#f6f7f9]">
    <div className="max-w-7xl mx-auto px-6 xl:px-0">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="
          rounded-3xl bg-white border border-gray-200
          p-10 md:p-16 text-center
          shadow-[0_20px_50px_rgba(239,68,68,0.08)]
        "
      >
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {[
              { icon: Zap, label: "Instant Valuation" },
              { icon: CheckCircle, label: "Best Market Price" },
              { icon: ShieldCheck, label: "Paperwork Handled" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="
                  flex items-center gap-2 text-sm text-gray-600
                  bg-gray-50 px-4 py-2 rounded-full
                  hover:bg-red-50 transition-colors duration-300
                "
              >
                <item.icon className="w-4 h-4 text-red-600" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Heading */}
          <div className="space-y-5">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Ready to sell your car?
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Join thousands of satisfied sellers who received the best value
              for their vehicles with a fast, transparent, and hassle-free process.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 pt-4">
            <Button
              variant="hero"
              size="xl"
              className="
                h-14 px-8 text-base group
                bg-red-600 hover:bg-red-700 text-white
                shadow-[0_12px_30px_rgba(239,68,68,0.25)]
              "
              asChild
            >
              <Link to="/sell">
                Get Free Valuation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="xl"
              className="
                h-14 px-8 text-base
                border-gray-300 text-gray-700
                hover:bg-gray-100
              "
              asChild
            >
              <Link to="/buy">Browse Collection</Link>
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium pt-2">
            No obligation • Free inspection • Immediate payment
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);
