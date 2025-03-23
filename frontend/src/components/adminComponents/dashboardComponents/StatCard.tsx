import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  iconBg: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  iconBg,
  textColor,
}) => {
  return (
    <motion.div
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.15)" 
      }}
      initial={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
      className={`${bgColor} rounded-xl overflow-hidden transition-all duration-300 h-full`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className={`${textColor} text-opacity-80 text-sm font-medium mb-2`}>
              {title}
            </p>
            <h3 className={`text-3xl font-bold ${textColor}`}>
              {typeof value === "number" ? (
                <CountUp end={value} duration={2.5} separator="," />
              ) : (
                value
              )}
            </h3>
          </div>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`p-4 rounded-full ${iconBg} shadow-md`}
          >
            {icon}
          </motion.div>
        </div>
        <div className="mt-6">
          <div className={`h-1.5 ${textColor} bg-opacity-20 rounded-full overflow-hidden`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "70%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className={`h-full ${textColor} bg-opacity-80`}
            ></motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;