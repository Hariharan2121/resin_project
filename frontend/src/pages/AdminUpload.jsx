import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle, 
  X, 
  FileSearch, 
  Info, 
  FileDown, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { uploadProductsExcel } from '../services/api';

const AdminUpload = () => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showErrors, setShowErrors] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;

        const allowedMime = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/octet-stream',
            'application/excel',
            'application/x-excel',
            'application/x-msexcel'
        ];
        
        const extension = selectedFile.name.split('.').pop().toLowerCase();
        const isExcelExt = ['xlsx', 'xls'].includes(extension);

        if (!allowedMime.includes(selectedFile.type) && !isExcelExt) {
            toast.error('Only .xlsx and .xls files are allowed');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setResult(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setError(null);
        setResult(null);

        try {
            const data = await uploadProductsExcel(formData);
            setResult(data.summary);
            toast.success('Product catalogue synced successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Upload failed';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    const downloadSample = () => {
        const sampleData = [
            {
                name:         'Ocean Whisper',
                collection:   'Coastal Collection',
                price:        249,
                image_url:    '',
                description:  'Ocean-inspired blue resin keychain',
                is_available: 'true'
            },
            {
                name:         'Forever Bloom',
                collection:   'Forever Collection',
                price:        899,
                image_url:    '',
                description:  'Real rose in resin frame - 5inch (Heart)',
                is_available: 'true'
            },
            {
                name:         'Aqua Chrono',
                collection:   'Chrono Collection',
                price:        2199,
                image_url:    '',
                description:  'A resin wall clock with a coastal design',
                is_available: 'true'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        XLSX.writeFile(wb, 'RKLTrove_Products_Sample.xlsx');
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB'][i];
    };

    return (
        <div className="min-h-screen bg-[#FBF5EE] py-12 px-6 font-dm-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounceIcon {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes progressLine {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .dot-bg {
                    background-image: radial-gradient(#DEC5A8 1px, transparent 1px);
                    background-size: 24px 24px;
                }
            `}} />
            
            <div className="max-w-[680px] mx-auto dot-bg p-8 rounded-3xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <img src="/images/logo.png" alt="RKL Logo" className="w-10 h-10 object-contain" onError={(e) => e.target.style.display='none'} />
                        <span className="text-[#9C7B65] text-xs font-semibold tracking-widest uppercase">Admin Panel</span>
                    </div>
                    <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-[#C87941] to-[#8B4513] bg-clip-text text-transparent mb-3">
                        Product Catalogue Upload
                    </h1>
                    <p className="text-[#9C7B65] italic text-sm">
                        Upload an Excel file to add or update products in bulk
                    </p>
                </div>

                {/* Format Guide */}
                <div className="bg-[#FEF9F3] border border-[#EDD9C0] rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-[#C87941]" />
                        <span className="text-[#5C3D2A] text-sm font-semibold">Required Excel Format</span>
                    </div>
                    
                    <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse border border-[#EDD9C0]">
                            <thead>
                                <tr className="bg-[#F5EDE3]">
                                    <th className="border border-[#EDD9C0] p-2 text-left text-[0.78rem] font-bold text-[#7A5542]">Column</th>
                                    <th className="border border-[#EDD9C0] p-2 text-left text-[0.78rem] font-bold text-[#7A5542]">Required</th>
                                    <th className="border border-[#EDD9C0] p-2 text-left text-[0.78rem] font-bold text-[#7A5542]">Type</th>
                                    <th className="border border-[#EDD9C0] p-2 text-left text-[0.78rem] font-bold text-[#7A5542]">Example</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">name</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#2E7D32] font-bold">✓ Yes</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">Text</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">Ocean Whisper</td>
                                </tr>
                                <tr>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">collection</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#9C7B65]">Optional</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">Text</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">Coastal Collection</td>
                                </tr>
                                <tr>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">price</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#2E7D32] font-bold">✓ Yes</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">Number</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">249</td>
                                </tr>
                                <tr>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">image_url</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#9C7B65]">Optional</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">URL</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">https://...</td>
                                </tr>
                                <tr>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">description</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#9C7B65]">Optional</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">Text</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">Ocean-inspired keychain</td>
                                </tr>
                                <tr>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">is_available</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#9C7B65]">Optional</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">Boolean</td>
                                    <td className="border border-[#EDD9C0] p-2 text-[0.82rem] text-[#3D2B1A]">true / false</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <p className="text-[#B08060] text-[0.78rem] italic leading-relaxed">
                                ⚠ Row 1 must be the header row. Name is used as the unique identifier for updates.
                            </p>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontStyle: 'italic', color: '#7A5542', marginTop: '4px' }}>
                                💡 'name' should be the specific product name only (e.g., 'Ocean Whisper', not 'Coastal Collection - Ocean Whisper'). Use 'collection' column for the collection name separately.
                            </p>
                        </div>
                        <button 
                            onClick={downloadSample}
                            className="flex items-center gap-2 border-1.5 border-[#C87941] text-[#C87941] bg-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#FEF0E3] transition-colors whitespace-nowrap"
                        >
                            <FileDown className="w-4 h-4" />
                            Download Sample Excel
                        </button>
                    </div>
                </div>

                {/* Main Action Area */}
                {!result && !error && (
                    <>
                        {!file ? (
                            <div 
                                className={`bg-white border-2 border-dashed rounded-[20px] p-12 text-center cursor-pointer transition-all duration-300 ${
                                    isDragging ? 'border-[#C87941] bg-[#FEF0E3] scale-[1.01] shadow-lg shadow-[#C8794115]' : 'border-[#DEC5A8]'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <UploadCloud 
                                    className={`w-[52px] h-[52px] text-[#C87941] mx-auto mb-4 ${isDragging ? 'animate-[bounceIcon_0.6s_ease_infinite]' : ''}`} 
                                />
                                <h3 className="font-playfair text-xl font-semibold text-[#2C1810] mb-2">Drag & Drop your Excel file here</h3>
                                <p className="text-[#9C7B65] text-sm mb-6">or</p>
                                
                                <button className="flex items-center gap-2 bg-gradient-to-r from-[#C87941] to-[#8B4513] text-white px-6 py-2.5 rounded-xl font-semibold shadow-md mx-auto hover:translate-y-[-2px] hover:shadow-lg transition-all">
                                    <FileSearch className="w-4 h-4" />
                                    Browse File
                                </button>
                                
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange}
                                    accept=".xlsx,.xls"
                                />
                                <p className="text-[#B08060] text-[0.75rem] italic mt-4">Supports: .xlsx, .xls — Max size: 5MB</p>
                            </div>
                        ) : (
                            <div className="animate-[fadeSlideUp_0.3s_ease] space-y-6">
                                <div className="bg-white border-1.5 border-[#C87941] rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-[#C8794110]">
                                    <div className="bg-[#FEF0E3] p-2.5 rounded-xl">
                                        <FileSpreadsheet className="w-10 h-10 text-[#C87941]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[#2C1810] font-semibold text-[0.95rem] truncate">
                                            {file.name.length > 35 ? file.name.substring(0, 35) + '...' : file.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[#9C7B65] text-[0.8rem]">{formatSize(file.size)}</span>
                                            <span className="bg-[#FEF0E3] text-[#C87941] text-[0.65rem] font-bold px-1.5 py-0.5 rounded uppercase">XLSX</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setFile(null)}
                                        className="text-[#9C7B65] hover:text-[#C0392B] transition-colors p-1"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-[#2E7D32] text-sm font-medium justify-center">
                                    <CheckCircle className="w-4 h-4" />
                                    Ready to upload
                                </div>

                                <button 
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className={`w-full h-14 bg-gradient-to-r from-[#C87941] to-[#8B4513] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(200,121,65,0.35)] hover:translate-y-[-2px] hover:shadow-[0_6px_25px_rgba(200,121,65,0.45)] transition-all ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isUploading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing Excel file...
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-5 h-5" />
                                            Upload & Sync Products
                                        </>
                                    )}
                                </button>
                                
                                {isUploading && (
                                    <div className="h-1 bg-[#EDD9C0] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#C87941] animate-[progressLine_3s_ease-in-out_infinite]"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Success Result */}
                {result && (
                    <div className="animate-[scaleIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
                        <div className={`border-1.5 rounded-2xl p-8 ${result.errors === 0 ? 'bg-gradient-to-br from-[#F0FFF4] to-[#E8F5E9] border-[#2E7D32]' : 'bg-gradient-to-br from-[#FFFBF0] to-[#FEF3E2] border-[#E67E22]'}`}>
                            <div className="text-center mb-6">
                                <CheckCircle className={`w-[52px] h-[52px] mx-auto mb-3 animate-[scaleIn_0.4s_ease] ${result.errors === 0 ? 'text-[#2E7D32]' : 'text-[#E67E22]'}`} />
                                <h2 className={`font-playfair text-2xl font-bold ${result.errors === 0 ? 'text-[#1B5E20]' : 'text-[#874B16]'}`}>
                                    {result.errors === 0 ? 'Upload Successful!' : 'Upload Complete with Warnings'}
                                </h2>
                                <p className="text-[#9C7B65] text-sm mt-1">Your product catalogue has been synced.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-xl border border-[#EDD9C0] text-center">
                                    <div className="font-playfair text-2xl font-bold text-[#2C1810]">{result.total}</div>
                                    <div className="text-[0.7rem] text-[#7A5542] uppercase font-semibold tracking-wider">Total Rows</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-[#EDD9C0] text-center">
                                    <div className="font-playfair text-2xl font-bold text-[#2E7D32]">{result.inserted}</div>
                                    <div className="text-[0.7rem] text-[#7A5542] uppercase font-semibold tracking-wider">New Products</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-[#EDD9C0] text-center">
                                    <div className="font-playfair text-2xl font-bold text-[#C87941]">{result.updated}</div>
                                    <div className="text-[0.7rem] text-[#7A5542] uppercase font-semibold tracking-wider">Updated</div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-[#EDD9C0] text-center">
                                    <div className={`font-playfair text-2xl font-bold ${result.errors > 0 ? 'text-[#C0392B]' : 'text-[#9C7B65]'}`}>{result.errors}</div>
                                    <div className="text-[0.7rem] text-[#7A5542] uppercase font-semibold tracking-wider">Skipped</div>
                                </div>
                            </div>

                            {result.errors > 0 && (
                                <div className="bg-white/50 rounded-xl overflow-hidden border border-[#EDD9C0]">
                                    <button 
                                        onClick={() => setShowErrors(!showErrors)}
                                        className="w-full flex items-center justify-between p-3 text-[0.8rem] font-semibold text-[#5C3D2A] hover:bg-white/80 transition-colors"
                                    >
                                        <span>Show skipped rows ({result.errors})</span>
                                        {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    
                                    {showErrors && (
                                        <div className="max-h-[200px] overflow-y-auto p-3 border-t border-[#EDD9C0] bg-white">
                                            <table className="w-full text-[0.75rem]">
                                                <thead className="sticky top-0 bg-white">
                                                    <tr className="border-bottom border-[#EDD9C0]">
                                                        <th className="text-left font-bold py-1">Row Name</th>
                                                        <th className="text-left font-bold py-1">Skip Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.errorDetails.map((err, i) => (
                                                        <tr key={i} className="border-t border-[#F5EDE3]">
                                                            <td className="py-2 text-[#2C1810] pr-4">{err.name || 'Unknown'}</td>
                                                            <td className="py-2 text-[#C0392B] italic">{err.reason}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <button 
                                onClick={() => {setResult(null); setFile(null);}}
                                className="flex-1 border-1.5 border-[#C87941] text-[#C87941] rounded-xl py-3 font-semibold hover:bg-[#FEF0E3] transition-colors"
                            >
                                Upload Another File
                            </button>
                            <button 
                                onClick={() => navigate('/home')}
                                className="flex-1 bg-gradient-to-r from-[#C87941] to-[#8B4513] text-white rounded-xl py-3 font-semibold shadow-md hover:translate-y-[-2px] transition-all"
                            >
                                View Products
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Result */}
                {error && (
                    <div className="animate-[scaleIn_0.4s_ease]">
                        <div className="bg-[#FFF5F5] border-1.5 border-[#C0392B] rounded-2xl p-8 text-center">
                            <AlertCircle className="w-[52px] h-[52px] text-[#C0392B] mx-auto mb-4" />
                            <h2 className="font-playfair text-2xl font-bold text-[#C0392B] mb-2">Upload Failed</h2>
                            <p className="text-[#9C7B65] text-sm mb-6">{error}</p>
                            <button 
                                onClick={() => setError(null)}
                                className="bg-[#C0392B] text-white px-8 py-2.5 rounded-xl font-semibold shadow-md hover:translate-y-[-2px] transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUpload;
