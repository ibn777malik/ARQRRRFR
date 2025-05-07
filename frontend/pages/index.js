import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Welcome to the Web AR Platform
      </motion.h1>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-md text-lg font-medium hover:bg-green-700 transition-colors"
          >
            Register
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}