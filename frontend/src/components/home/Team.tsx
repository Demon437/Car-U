import { motion } from "framer-motion";
import founderImg from "@/assets/CEO.png";
import inspectorImg from "@/assets/co-founder.jpg";

const team = [
  {
    name: "RISHI SINGH",
    role: "Founder & CEO",
    description: "15+ years in the luxury automobile industry.",
    image: founderImg,
  },
  {
    name: "SHIVAM",
    role: "Head of Inspections",
    description: "Expert in 200-point car verification.",
    image: inspectorImg,
  },
];

export const Team = () => {
  return (
    <section className="py-24 bg-[#f8fafc]">
      
      {/* CONTAINER */}
      <div className="max-w-4xl mx-auto px-4">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Meet The <span className="text-red-600">Visionaries</span>
          </h2>
        </motion.div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-8 justify-items-center">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group w-[320px] bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
            >

              {/* IMAGE */}
              <div className="relative overflow-hidden aspect-[4/5]">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                />

                {/* BADGE */}
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                  Team
                </div>
              </div>

              {/* DETAILS */}
              <div className="p-5 space-y-2">

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition">
                    {member.name}
                  </h3>

                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md">
                    Expert
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  {member.role}
                </p>

                <p className="text-sm text-gray-400 leading-relaxed">
                  {member.description}
                </p>

              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};