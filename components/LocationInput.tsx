import React, { useState } from 'react';

interface LocationInputProps {
    onLocationSubmit: (location: string) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationSubmit }) => {
    const [location, setLocation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (location.trim()) {
            onLocationSubmit(location);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">お出かけ先はどこですか？</h3>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="例: 北海道、渋谷、ディズニーランド..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={!location.trim()}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    決定
                </button>
            </form>
        </div>
    );
};

export default LocationInput;
