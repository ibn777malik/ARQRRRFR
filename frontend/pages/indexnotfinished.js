import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cube3d, 
  ChefHat, 
  Sparkles, 
  ArrowRight, 
  Check, 
  QrCode, 
  Smartphone,
  Eye,
  Users
} from "lucide-react";

export default function EnhancedHomepage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const features = [
    {
      title: "Interactive 3D Models",
      description: "Showcase your restaurant menu items in lifelike 3D. Let customers view dishes from every angle before ordering.",
      icon: <Cube3d className="w-8 h-8 text-blue-400" />,
      color: "from-blue-400 to-indigo-600"
    },
    {
      title: "QR Menu Integration",
      description: "Generate custom QR codes that link directly to your interactive AR menu. Easy to display and access.",
      icon: <QrCode className="w-8 h-8 text-emerald-400" />,
      color: "from-emerald-400 to-teal-600"
    },
    {
      title: "Restaurant Brand Builder",
      description: "Create a memorable dining experience that sets your restaurant apart with cutting-edge technology.",
      icon: <ChefHat className="w-8 h-8 text-orange-400" />,
      color: "from-orange-400 to-pink-600"
    },
    {
      title: "Instant Mobile AR",
      description: "No app downloads required. Customers can experience AR directly in their mobile browser.",
      icon: <Smartphone className="w-8 h-8 text-purple-400" />,
      color: "from-purple-400 to-fuchsia-600"
    },
  ];

  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [features.length]);

  // Animated 3D effect for the hero cube
  const cubeVariants = {
    hover: {
      rotateY: 360,
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop"
      }
    },
    rest: {
      rotateY: 0
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-blue-500 opacity-20 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
              ],
              x: [
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
              ],
            }}
            transition={{
              duration: 10 + Math.random() * 30,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              width: Math.random() * 20 + 10 + "px",
              height: Math.random() * 20 + 10 + "px",
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-gray-900 bg-opacity-90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link href="/" className="flex items-center">
                  <div className="relative w-8 h-8 mr-2">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md"
                      animate={isHovering ? "hover" : "rest"}
                      variants={cubeVariants}
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      <Cube3d className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    ARMenu
                  </span>
                </Link>
              </motion.div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md bg-transparent border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Log In
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300"
                >
                  Sign Up
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  Transform Your Menu
                </span>{" "}
                <br />
                With Augmented Reality
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-gray-300 mb-8 max-w-xl"
            >
              Bring your restaurant menu to life with interactive 3D models. Let customers see exactly what they're ordering before they order.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-lg font-medium text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-lg font-medium text-white hover:bg-gray-700 transition-colors duration-300"
                >
                  View Demo
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* 3D Model Display Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative aspect-square max-w-md mx-auto lg:mx-0 lg:ml-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-3xl"></div>
            <div className="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-8 bg-gray-900 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="pt-8 pb-4 p-4">
                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-bold">Signature Dish</h3>
                  <button className="bg-blue-600 px-3 py-1 rounded-md text-sm">
                    View in AR
                  </button>
                </div>
                <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                  {/* Simulated 3D model viewing area */}
                  <motion.div
                    className="relative w-48 h-48"
                    animate={{ 
                      rotateY: [0, 360],
                      rotateZ: [0, 10, 0, -10, 0]
                    }}
                    transition={{ 
                      duration: 10, 
                      repeat: Infinity,
                      easings: ["easeInOut"]
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-70 blur-sm"></div>
                    <div className="absolute inset-4 bg-gradient-to-br from-orange-300 to-red-600 rounded-full"></div>
                    <div className="absolute inset-8 bg-gradient-to-tr from-white to-yellow-200 rounded-full opacity-50"></div>
                    <div className="absolute inset-[4.5rem] bg-gradient-to-tr from-yellow-400 to-red-500 rounded-full"></div>
                    <div className="absolute -bottom-4 -left-4 -right-4 h-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full"></div>
                  </motion.div>
                  <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-70 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-300">
                    360° View
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Deluxe Burger</h4>
                    <p className="text-sm text-gray-400">$14.99</p>
                  </div>
                  <button className="text-blue-400 text-sm">See Details</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="features">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Bring Your Menu To{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Life
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our platform makes it easy to create immersive augmented reality experiences for your restaurant customers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl ${
                  activeFeature === index
                    ? "bg-gray-800 border-l-4 border-blue-500 shadow-lg"
                    : "bg-gray-900 border-l-4 border-gray-800"
                } transition-all duration-300 cursor-pointer hover:bg-gray-800`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} mr-4`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative rounded-xl overflow-hidden aspect-square max-w-md mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-3xl"></div>
            <div className="relative h-full bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  {activeFeature === 0 && (
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="text-xl font-bold text-center mb-4">Interactive 3D Models</h3>
                      <div className="flex-grow flex items-center justify-center relative">
                        <motion.div
                          className="w-64 h-64 relative"
                          animate={{ 
                            rotateY: [0, 360],
                            rotateX: [0, 15, 0, -15, 0]
                          }}
                          transition={{ 
                            duration: 8, 
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg opacity-50"></div>
                          <div className="absolute inset-8 bg-gradient-to-tr from-blue-400 to-indigo-600 rounded-lg"></div>
                          <div className="absolute inset-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg"></div>
                          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
                            <Cube3d className="w-12 h-12" />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 1 && (
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="text-xl font-bold text-center mb-4">QR Menu Integration</h3>
                      <div className="flex-grow flex items-center justify-center">
                        <motion.div
                          className="w-64 h-64 bg-white p-8 rounded-lg flex items-center justify-center"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        >
                          <QrCode className="w-full h-full text-black" />
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 2 && (
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="text-xl font-bold text-center mb-4">Restaurant Brand Builder</h3>
                      <div className="flex-grow flex items-center justify-center">
                        <motion.div
                          className="relative"
                          animate={{ 
                            y: [0, -10, 0],
                            rotateZ: [0, 5, 0, -5, 0]
                          }}
                          transition={{ 
                            duration: 5, 
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        >
                          <ChefHat className="w-32 h-32 text-orange-400" />
                          <motion.div
                            className="absolute top-0 right-0"
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              repeatType: "loop"
                            }}
                          >
                            <Sparkles className="w-12 h-12 text-yellow-400" />
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {activeFeature === 3 && (
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="text-xl font-bold text-center mb-4">Instant Mobile AR</h3>
                      <div className="flex-grow flex items-center justify-center">
                        <motion.div
                          className="relative w-48 h-80 border-8 border-gray-700 rounded-3xl bg-gray-900 overflow-hidden"
                          animate={{ 
                            rotateY: [0, 5, 0, -5, 0]
                          }}
                          transition={{ 
                            duration: 6, 
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        >
                          <div className="absolute top-0 w-1/2 h-6 bg-gray-800 rounded-b-xl left-1/4"></div>
                          <div className="p-4 h-full flex flex-col">
                            <div className="h-1/2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                              <Cube3d className="w-16 h-16 text-white" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-800 rounded w-full"></div>
                              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                              <div className="h-8 bg-blue-600 rounded w-full mt-4"></div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How it works section */}
      <div className="py-20 bg-gray-900/50" id="how-it-works">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Works
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Get started in minutes. Our platform makes it easy to create and share augmented reality experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Models",
                description: "Upload your 3D models or use our library of pre-made models for common menu items.",
                icon: <Upload className="w-8 h-8 text-blue-400" />,
                color: "from-blue-400 to-indigo-600"
              },
              {
                step: "02",
                title: "Create Your Menu",
                description: "Design your interactive menu with our easy-to-use editor. Add descriptions, prices, and AR views.",
                icon: <Edit className="w-8 h-8 text-green-400" />,
                color: "from-green-400 to-teal-600"
              },
              {
                step: "03",
                title: "Share with Customers",
                description: "Generate a custom QR code for your menu. Place it on tables, takeout menus, or your website.",
                icon: <Share className="w-8 h-8 text-purple-400" />,
                color: "from-purple-400 to-pink-600"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-gray-800 via-gray-800 to-transparent p-2 w-24 text-right">
                  <span className="text-3xl font-bold text-gray-700">{step.step}</span>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${step.color} inline-block mb-4`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="demo">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            See It In{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              Action
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Watch how customers interact with your menu in augmented reality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold">Enhance Customer Experience</h3>
            <p className="text-gray-400">
              With AR Menu, customers can see exactly what they're ordering before they order. This leads to:
            </p>
            <ul className="space-y-4">
              {[
                "Higher customer satisfaction",
                "Increased order accuracy",
                "More social media shares",
                "Higher average order value"
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-3">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
            <div className="pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-lg font-medium text-white shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 transition-all duration-300"
                >
                  Try It Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative aspect-video rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur-3xl"></div>
            <div className="relative h-full border border-gray-700 rounded-xl overflow-hidden">
              {/* Demo video placeholder */}
              <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-16 h-16 bg-white