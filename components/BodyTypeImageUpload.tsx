import React, { useState, useRef } from 'react';
import { BodyType } from '../types';
import { GeminiService } from '../services/geminiService';

interface BodyTypeImageUploadProps {
    onComplete: (result: BodyType) => void;
}

const BodyTypeImageUpload: React.FC<BodyTypeImageUploadProps> = ({ onComplete }) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const gemini = new GeminiService();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setError("ファイルサイズは5MB以下にしてください");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        try {
            const result = await gemini.predictBodyType(image);
            console.log("Diagnosis result:", result);
            // 診断理由を表示したい場合はここでハンドリング拡張が必要だが、
            // 今回はまずタイプ判定完了として親に通知する
            alert(`診断結果: ${result.type}\n理由: ${result.reason}`);
            onComplete(result.type);
        } catch (err) {
            console.error(err);
            setError("診断に失敗しました。もう一度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-50 max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                写真で骨格診断
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
                全身が写った写真をアップロードしてください。<br />
                AIがあなたの骨格タイプを分析します。
            </p>

            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 mb-8 transition-colors ${image ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                    }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {image ? (
                    <div className="relative">
                        <img src={image} alt="Upload preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setImage(null);
                            }}
                            className="absolute -top-3 -right-3 bg-white text-gray-500 rounded-full p-2 shadow-sm hover:text-red-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div
                        className="cursor-pointer py-10"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">クリックまたはドラッグ＆ドロップ</p>
                        <p className="text-gray-400 text-xs mt-2">JPEG, PNG (最大5MB)</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-red-500 text-sm mb-6 bg-red-50 py-2 px-4 rounded-lg inline-block">
                    {error}
                </p>
            )}

            <button
                onClick={analyzeImage}
                disabled={!image || loading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${!image || loading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-orange-400 to-rose-400 text-white hover:shadow-orange-200 hover:-translate-y-0.5'
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        AI分析中...
                    </span>
                ) : (
                    'この写真で診断する'
                )}
            </button>
        </div>
    );
};

export default BodyTypeImageUpload;
