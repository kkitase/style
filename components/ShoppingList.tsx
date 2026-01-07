import React from 'react';

export interface ProductItem {
    title: string;
    url: string;
    imageUrl?: string;
    price?: string;
}

interface ShoppingListProps {
    items: ProductItem[];
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items }) => {
    if (items.length === 0) return null;

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                </span>
                おすすめアイテム (通販検索)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all group"
                    >
                        <div className="aspect-square bg-gray-50 overflow-hidden relative">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600">
                                {item.title}
                            </h4>
                            {item.price && (
                                <p className="text-sm font-bold text-gray-500">{item.price}</p>
                            )}
                            <span className="text-xs text-blue-500 hover:underline">商品を見る &rarr;</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ShoppingList;
