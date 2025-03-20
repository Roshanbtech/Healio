// // components/StatCard.jsx
// import React from "react";
// import { motion } from "framer-motion";
// import CountUp from "react-countup";

// const StatCard = ({ title, value, icon, bgColor, iconBg }) => {
//   return (
//     <motion.div
//       whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
//       className={`${bgColor} rounded-xl overflow-hidden transition-all duration-300 h-full`}
//     >
//       <div className="p-6 text-white">
//         <div className="flex justify-between items-center">
//           <div>
//             <p className="text-white text-opacity-80 text-sm font-medium mb-1">{title}</p>
//             <h3 className="text-2xl font-bold">
//               {typeof value === "number" ? (
//                 <CountUp end={value} duration={2.5} separator="," />
//               ) : (
//                 value
//               )}
//             </h3>
//           </div>
//           <div className={`p-3 rounded-full ${iconBg} text-${bgColor.split('-')[1]}-600`}>
//             {icon}
//           </div>
//         </div>
        
//         <div className="mt-4">
//           <div className="h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: "70%" }}
//               transition={{ duration: 1.5, delay: 0.5 }}
//               className="h-full bg-white"
//             ></motion.div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default StatCard;

import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor, iconBg }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className={`${bgColor} rounded-xl overflow-hidden transition-all duration-300 h-full`}
    >
      <div className="p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-opacity-80 text-sm font-medium mb-1">
              {title}
            </p>
            <h3 className="text-2xl font-bold">
              {typeof value === "number" ? (
                <CountUp end={value} duration={2.5} separator="," />
              ) : (
                value
              )}
            </h3>
          </div>
          <div className={`p-3 rounded-full ${iconBg} text-${bgColor.split('-')[1]}-600`}>
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <div className="h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "70%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-full bg-white"
            ></motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
