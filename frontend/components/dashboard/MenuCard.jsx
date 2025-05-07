import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const MenuCard = ({ menu, onGenerateQR }) => {
  const router = useRouter();

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <h3 className="font-medium text-lg">{menu.name || 'Menu'}</h3>
        <p className="text-sm opacity-90">{menu.restaurant || 'Restaurant'}</p>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Categories: <span className="font-medium">{menu.categories?.length || 0}</span>
          </p>
          <p className="text-sm text-gray-600">
            Items: <span className="font-medium">{menu.items?.length || 0}</span>
          </p>
        </div>

        {menu.qrCodeUrl ? (
          <div className="flex items-center mb-4">
            <img
              src={menu.qrCodeUrl}
              alt="QR Code"
              className="w-16 h-16 mr-4"
            />
            <div>
              <p className="text-sm text-gray-600 mb-1">QR Code Ready</p>
              <a
                href={menu.qrCodeUrl}
                download
                className="text-sm text-blue-600 hover:underline"
              >
                Download
              </a>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onGenerateQR(menu._id)}
            className="w-full py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors mb-4"
          >
            Generate QR Code
          </button>
        )}

        <div className="flex justify-between gap-2">
          <button
            onClick={() => window.open(menu.menuUrl || `/menu/${menu._id}`, '_blank')}
            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
          >
            View Menu
          </button>
          <button
            onClick={() => router.push(`/menu-editor?id=${menu._id}`)}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            Edit Menu
          </button>
        </div>
      </div>
    </motion.div>
  );
};

MenuCard.propTypes = {
  menu: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    restaurant: PropTypes.string,
    categories: PropTypes.array,
    items: PropTypes.array,
    qrCodeUrl: PropTypes.string,
    menuUrl: PropTypes.string,
  }).isRequired,
  onGenerateQR: PropTypes.func.isRequired,
};

export default MenuCard;
