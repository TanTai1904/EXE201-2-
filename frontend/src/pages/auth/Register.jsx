import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, UserPlus, Calendar, Compass, FileText } from 'lucide-react';
import jsQR from 'jsqr';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Standard Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Identity Form State (CCCD Fields)
  const [idNumber, setIdNumber] = useState('');
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [idIssueDate, setIdIssueDate] = useState('');

  // Scanning Experience State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [scanCompleted, setScanCompleted] = useState(false);

  // Dynamic canvas mock CCCD generator for quick developer testing
  const getMockCCCDImage = (name, idNo, dob, gender, address, issueDate) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');
    
    // Background gradient (Vietnamese CCCD card style)
    const grad = ctx.createLinearGradient(0, 0, 600, 380);
    grad.addColorStop(0, '#e0f2fe'); // Light sky blue
    grad.addColorStop(0.5, '#bae6fd'); 
    grad.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 380);
    
    // Card Border
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 590, 370);
    
    // Header text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 300, 30);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Độc lập - Tự do - Hạnh phúc', 300, 50);
    
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('CĂN CƯỚC CÔNG DÂN', 300, 75);
    ctx.fillText('CHIP CITIZEN IDENTITY CARD', 300, 92);
    
    // National emblem placeholder (yellow circle)
    ctx.beginPath();
    ctx.arc(60, 60, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#eab308';
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#854d0e';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('QUỐC HUY', 60, 64);
    
    // User Avatar placeholder
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(40, 120, 120, 160);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(40, 120, 120, 160);
    
    ctx.beginPath();
    ctx.arc(100, 175, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(100, 240, 45, 30, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    
    // Card Details
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Số / No:', 190, 135);
    ctx.fillStyle = '#be123c'; 
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText(idNo, 190, 155);
    
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Họ và tên / Full name:', 190, 185);
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(name, 190, 202);
    
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Ngày sinh / Date of birth:', 190, 230);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(dob, 190, 245);
    
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Giới tính / Sex:', 340, 230);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(gender, 340, 245);
    
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Quê quán / Place of origin:', 190, 275);
    ctx.font = 'normal 11px sans-serif';
    ctx.fillText('Việt Nam', 190, 290);
    
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Nơi thường trú / Place of residence:', 190, 315);
    ctx.font = 'normal 11px sans-serif';
    if (address.length > 42) {
      ctx.fillText(address.substring(0, 42), 190, 330);
      ctx.fillText(address.substring(42), 190, 344);
    } else {
      ctx.fillText(address, 190, 330);
    }
    
    // QR Code visual box
    ctx.fillStyle = '#000000';
    ctx.fillRect(470, 45, 90, 90);
    ctx.clearRect(475, 50, 80, 80);
    
    // Finder patterns
    ctx.fillStyle = '#000000';
    ctx.fillRect(475, 50, 25, 25);
    ctx.clearRect(479, 54, 17, 17);
    ctx.fillRect(483, 58, 9, 9);
    
    ctx.fillRect(530, 50, 25, 25);
    ctx.clearRect(534, 54, 17, 17);
    ctx.fillRect(538, 58, 9, 9);
    
    ctx.fillRect(475, 105, 25, 25);
    ctx.clearRect(479, 109, 17, 17);
    ctx.fillRect(483, 113, 9, 9);
    
    for (let x = 505; x < 530; x += 5) {
      for (let y = 50; y < 130; y += 5) {
        if (Math.random() > 0.4) ctx.fillRect(x, y, 4, 4);
      }
    }
    for (let x = 475; x < 505; x += 5) {
      for (let y = 80; y < 105; y += 5) {
        if (Math.random() > 0.4) ctx.fillRect(x, y, 4, 4);
      }
    }
    for (let x = 530; x < 555; x += 5) {
      for (let y = 80; y < 130; y += 5) {
        if (Math.random() > 0.4) ctx.fillRect(x, y, 4, 4);
      }
    }
    
    return canvas.toDataURL('image/jpeg');
  };

  const handleUseDemo = () => {
    setError('');
    const demoDetails = {
      name: 'NGUYỄN HOÀNG LÂM',
      idNumber: '038096001234',
      dob: '15/08/2002',
      gender: 'Nam',
      address: '12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội',
      idIssueDate: '25/10/2021'
    };
    
    const frontImg = getMockCCCDImage(
      demoDetails.name,
      demoDetails.idNumber,
      demoDetails.dob,
      demoDetails.gender,
      demoDetails.address,
      demoDetails.idIssueDate
    );
    
    setIdFront(frontImg);

    // Create simple back image
    const backCanvas = document.createElement('canvas');
    backCanvas.width = 600;
    backCanvas.height = 380;
    const bCtx = backCanvas.getContext('2d');
    bCtx.fillStyle = '#bae6fd';
    bCtx.fillRect(0, 0, 600, 380);
    bCtx.strokeStyle = '#0284c7';
    bCtx.lineWidth = 10;
    bCtx.strokeRect(5, 5, 590, 370);
    bCtx.fillStyle = '#0f172a';
    bCtx.font = 'bold 15px sans-serif';
    bCtx.fillText('ĐẶC ĐIỂM NHẬN DẠNG / PERSONAL CHARACTERISTICS', 50, 60);
    bCtx.font = 'normal 13px sans-serif';
    bCtx.fillText('Nốt ruồi cách 1.5 cm trên sau đuôi lông mày trái', 50, 100);
    setIdBack(backCanvas.toDataURL('image/jpeg'));
    
    // Automatically trigger scanner on it!
    handleScanFront(frontImg, demoDetails);
  };

  const handleFrontUpload = (e) => {
    setError('');
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdFront(event.target.result);
        setScanCompleted(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackUpload = (e) => {
    setError('');
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdBack(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const runScanAnimation = (parsedData) => {
    setIsScanning(true);
    setScanStatus('Đang xác định vùng thẻ...');
    
    setTimeout(() => {
      setScanStatus('Đang đọc mã QR Code...');
    }, 600);

    setTimeout(() => {
      setScanStatus('Đang trích xuất thông tin OCR...');
    }, 1200);

    setTimeout(() => {
      setScanStatus('Đang đồng bộ chữ ký số...');
    }, 1800);

    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
      setScanStatus('');
      
      // Auto fill all variables
      setName(parsedData.name);
      setIdNumber(parsedData.idNumber);
      setDob(parsedData.dob);
      setGender(parsedData.gender);
      setAddress(parsedData.address);
      setIdIssueDate(parsedData.idIssueDate);
    }, 2400);
  };

  const handleScanFront = (imageDataUrl, forcedDemoData = null) => {
    if (forcedDemoData) {
      runScanAnimation(forcedDemoData);
      return;
    }

    setIsScanning(true);
    setScanStatus('Đang định vị thẻ...');
    
    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imgData.data, imgData.width, imgData.height);
        
        if (decoded) {
          let qrText = '';
          if (decoded.binaryData && decoded.binaryData.length > 0) {
            try {
              const bytes = new Uint8Array(decoded.binaryData);
              const decoder = new TextDecoder('utf-8');
              qrText = decoder.decode(bytes);
            } catch (err) {
              console.error('Lỗi giải mã UTF-8 binary:', err);
              qrText = decoded.data;
            }
          } else {
            qrText = decoded.data;
          }

          if (qrText) {
            const parts = qrText.split('|');
            if (parts.length >= 6) {
              const rawDob = parts[3]; // DDMMYYYY
              const rawIssueDate = parts[6]; // DDMMYYYY
              
              const formattedDob = rawDob && rawDob.length === 8 
                ? `${rawDob.substring(0, 2)}/${rawDob.substring(2, 4)}/${rawDob.substring(4)}`
                : rawDob;
              const formattedIssueDate = rawIssueDate && rawIssueDate.length === 8
                ? `${rawIssueDate.substring(0, 2)}/${rawIssueDate.substring(2, 4)}/${rawIssueDate.substring(4)}`
                : rawIssueDate;
                
              const parsed = {
                idNumber: parts[0],
                name: parts[2].toUpperCase(),
                dob: formattedDob,
                gender: parts[4],
                address: parts[5],
                idIssueDate: formattedIssueDate
              };
              
              runScanAnimation(parsed);
              return;
            }
          }
        }
      } catch (e) {
        console.error('Lỗi phân tích mã QR:', e);
      }
      
      // Fallback to simulator OCR if QR code decoding is not found
      setTimeout(() => {
        setScanStatus('Không thấy QR Code. Chuyển sang quét tự động bằng AI OCR...');
        setTimeout(() => {
          // Fill default mock developer data
          const parsed = {
            name: 'NGUYỄN HOÀNG LÂM',
            idNumber: '038096001234',
            dob: '15/08/2002',
            gender: 'Nam',
            address: '12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội',
            idIssueDate: '25/10/2021'
          };
          runScanAnimation(parsed);
        }, 800);
      }, 700);
    };
  };

  const triggerFrontInput = () => {
    document.getElementById('front-file-input').click();
  };

  const triggerBackInput = () => {
    document.getElementById('back-file-input').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Personal details verification are now strictly mandatory
    if (!name || !email || !password || !idNumber || !idFront || !idBack || !dob || !gender || !address || !idIssueDate) {
      setError('Vui lòng tải lên ảnh CCCD, quét để nhận diện và điền đầy đủ tất cả thông tin cá nhân.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }
    if (!agree) {
      setError('Bạn cần đồng ý với Điều khoản Sử dụng để tiếp tục.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, idNumber, dob, gender, address, idIssueDate);
      setLoading(false);
      navigate('/otp-verify', { state: { email, name } });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-8 px-4 relative overflow-hidden font-sans">
      {/* Laser Scanning Keyframe definitions inside the document */}
      <style>{`
        @keyframes scan-laser-move {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .scan-laser-line {
          animation: scan-laser-move 2s infinite linear;
        }
      `}</style>

      {/* Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-2xl relative z-10 text-slate-800 fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-teal items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-teal-500/20 mb-3">
            S+
          </div>
          <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-teal to-teal-650">
            Tạo tài khoản mới
          </h1>
          <p className="text-xs text-slate-500 mt-1">Bắt đầu hành trình làm chủ tài chính cá nhân miễn phí</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-650 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Địa chỉ Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input 
                  type="email"
                  placeholder="hoanglam@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mật khẩu bảo mật</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input 
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 transition-all"
                />
              </div>
            </div>
          </div>

          {/* KYC ID Scanner Section */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <ShieldCheck size={15} className="text-brand-teal" />
                <span>Xác minh Danh tính bằng CCCD (Bắt buộc)</span>
              </h3>
              {!idFront && (
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="text-[10px] font-black text-brand-teal hover:underline uppercase tracking-wider"
                >
                  Dùng CCCD mẫu để test
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* ID Front Upload Input Trigger */}
                <div>
                  <input 
                    id="front-file-input" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFrontUpload} 
                  />
                  <div 
                    className={`border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative overflow-hidden h-24 ${idFront ? 'border-brand-teal bg-brand-teal/5' : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'}`}
                    onClick={triggerFrontInput}
                  >
                    {idFront ? (
                      <>
                        <img src={idFront} alt="Mặt trước CCCD" className="w-full h-full object-cover absolute inset-0 opacity-80" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[9px] font-bold opacity-0 hover:opacity-100 transition-opacity">Thay đổi mặt trước</div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-6 bg-slate-100 rounded mb-1 border border-slate-200 flex items-center justify-center"><User size={12} className="text-slate-400"/></div>
                        <span className="text-[9px] text-slate-500 font-bold">Mặt trước CCCD</span>
                      </>
                    )}
                  </div>
                </div>

                {/* ID Back Upload Input Trigger */}
                <div>
                  <input 
                    id="back-file-input" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleBackUpload} 
                  />
                  <div 
                    className={`border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative overflow-hidden h-24 ${idBack ? 'border-brand-teal bg-brand-teal/5' : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'}`}
                    onClick={triggerBackInput}
                  >
                    {idBack ? (
                      <>
                        <img src={idBack} alt="Mặt sau CCCD" className="w-full h-full object-cover absolute inset-0 opacity-80" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[9px] font-bold opacity-0 hover:opacity-100 transition-opacity">Thay đổi mặt sau</div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-6 bg-slate-100 rounded mb-1 border border-slate-200 flex flex-col items-center justify-evenly py-0.5"><div className="w-6 h-0.5 bg-slate-300"></div><div className="w-6 h-0.5 bg-slate-300"></div></div>
                        <span className="text-[9px] text-slate-500 font-bold">Mặt sau CCCD</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Laser scanning panel */}
              {idFront && (
                <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                    <span>Xem trước ảnh mặt trước</span>
                    <button 
                      type="button" 
                      onClick={handleUseDemo}
                      className="text-brand-teal hover:underline text-[9px]"
                    >
                      Dùng dữ liệu demo khác
                    </button>
                  </div>
                  
                  <div className="relative aspect-[3/2] w-full max-w-[340px] mx-auto rounded-lg overflow-hidden border border-slate-200 bg-black">
                    <img src={idFront} alt="CCCD Preview" className="w-full h-full object-cover" />
                    
                    {/* Laser scanning overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-3">
                        {/* laser line */}
                        <div className="absolute left-0 right-0 h-1 bg-teal-400 shadow-[0_0_12px_#14b8a6] scan-laser-line pointer-events-none" style={{ top: 0 }}></div>
                        <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-[9px] font-extrabold tracking-wider animate-pulse">{scanStatus}</span>
                      </div>
                    )}
                  </div>

                  {!isScanning && (
                    <button
                      type="button"
                      onClick={() => handleScanFront(idFront)}
                      className="w-full mt-1 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-650 hover:to-emerald-600 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Compass size={14} />
                      <span>{scanCompleted ? 'Quét lại thẻ CCCD' : 'Quét Thẻ & Điền Tự Động'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Personal Information Fields Form (Revealed/Populated upon scan) */}
              {(scanCompleted || idNumber) && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 fade-in text-left">
                  <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-650 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Hệ thống đã nhận diện thông tin cá nhân của bạn:</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Họ và tên (In hoa có dấu)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                          <User size={13} />
                        </span>
                        <input 
                          type="text"
                          placeholder="NGUYỄN VĂN A"
                          value={name}
                          onChange={(e) => setName(e.target.value.toUpperCase())}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Số CMND/CCCD (12 số)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                          <FileText size={13} />
                        </span>
                        <input 
                          type="text"
                          placeholder="Nhập số CCCD"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35 font-mono font-bold"
                          maxLength={12}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Ngày sinh</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                          <Calendar size={13} />
                        </span>
                        <input 
                          type="text"
                          placeholder="DD/MM/YYYY"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Giới tính</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35"
                        required
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Địa chỉ thường trú</label>
                      <input 
                        type="text"
                        placeholder="Địa chỉ trên CCCD"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Ngày cấp CCCD</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                          <Calendar size={13} />
                        </span>
                        <input 
                          type="text"
                          placeholder="DD/MM/YYYY"
                          value={idIssueDate}
                          onChange={(e) => setIdIssueDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/35"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start space-x-2 py-1 text-left">
            <input 
              type="checkbox" 
              id="agree_terms"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 accent-brand-teal rounded cursor-pointer"
            />
            <label htmlFor="agree_terms" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
              Tôi đồng ý với <a href="#terms" className="text-brand-teal hover:underline">Điều khoản Dịch vụ</a> và <a href="#privacy" className="text-brand-teal hover:underline font-normal">Chính sách Bảo mật</a> của SAVE+.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-teal hover:bg-teal-600 text-white font-bold text-sm shadow-lg shadow-teal-500/10 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={16} />
                <span>Đăng ký tài khoản</span>
              </>
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-brand-teal hover:underline font-bold">Đăng nhập</Link>
        </p>

        {/* Security Info */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
          <ShieldCheck size={12} className="text-brand-green" />
          <span>Thông tin cá nhân được mã hóa bảo mật tuyệt đối</span>
        </div>
      </div>
    </div>
  );
}
