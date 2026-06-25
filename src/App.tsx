import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Toaster, toast as sonnerToast } from 'sonner';
import {
  Users,
  UserCheck,
  BookOpen,
  Calendar as CalendarIcon,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Home,
  Activity,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Share2,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Menu,
  X,
  CheckSquare,
  Briefcase,
  Bell,
  AlertCircle,
  Eye,
  RefreshCw,
  Trash,
  ArchiveRestore,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  MessageSquare,
  GraduationCap,
  Clock,
  Hash,
  User,
  Award,
  QrCode,
  Quote,
  Cloud,
  CloudOff,
  Sun,
  CloudRain,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer
} from 'lucide-react';

declare global {
  interface Window {
    html2canvas?: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}

const COLORS = {
  bg: '#0B0F19',
  sidebar: '#0A0E17',
  card: '#151B26',
  accent: '#00D4FF',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

const GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbw1OiJpEMcjKPGm_s88gzYzWP3qTna6AY0p7F9e7KaM5iQ77g24G6b9DVjls0uy668Y/exec';
const LOGO_URL =
  'https://englishclub.my.id/wp-content/uploads/2026/05/cropped-English-Club-Gresik-Reborn-1080-x-1350-px-2.png';

const LEVELS = [
  'Kindergarten',
  'Elementary School',
  'Junior High School',
  'Senior High School',
  'University',
  'Working Professional',
];

const CLASS_MAPPING = {
  Kindergarten: ['PAUD', 'TK A', 'TK B'],
  'Elementary School': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
  'Junior High School': ['Grade 7', 'Grade 8', 'Grade 9'],
  'Senior High School': ['Grade 10'],
  University: ['University'],
  'Working Professional': ['Professional'],
};

const SESSIONS = [
  'Sesi PAUD - TK A - TK B',
  'Sesi SD Kelas 1 - 2',
  'Sesi SD Kelas 3 - 4',
  'Sesi SD Kelas 5 - 6',
  'Sesi SMP - SMA - UNI - PRO',
];

const getSessionGroup = (className) => {
  if (['PAUD', 'TK A', 'TK B'].includes(className)) return SESSIONS[0];
  if (['Grade 1', 'Grade 2'].includes(className)) return SESSIONS[1];
  if (['Grade 3', 'Grade 4'].includes(className)) return SESSIONS[2];
  if (['Grade 5', 'Grade 6'].includes(className)) return SESSIONS[3];
  return SESSIONS[4];
};

// PERBAIKAN KRITIS: Memaksa aplikasi menggunakan waktu lokal perangkat (Local Time) 
// untuk menghindari pergeseran tanggal UTC saat aplikasi diakses pagi hari (sebelum jam 7 pagi WIB).
const getTodayDateLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const calculateDaysLeft = (targetDate, todayDate) => {
  // PERBAIKAN KRITIS: Parsing string secara eksplisit agar bebas dari pengaruh Timezone Browser
  const [tYear, tMonth, tDay] = targetDate.split('-').map(Number);
  const [dYear, dMonth, dDay] = todayDate.split('-').map(Number);
  
  const t = new Date(tYear, tMonth - 1, tDay).getTime();
  const d = new Date(dYear, dMonth - 1, dDay).getTime();
  const diff = Math.round((t - d) / (1000 * 3600 * 24));
  
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0) return 'Passed';
  return `${diff} Days Left`;
};

const getPerformanceCat = (score) => {
  if (score >= 90) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
  if (score >= 80) return { label: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (score >= 70) return { label: 'Good', color: 'text-teal-600', bg: 'bg-teal-100' };
  if (score >= 60) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
};

// AUTO-GENERATE TEACHER COMMENTS ALGORITHM
const generateAutoComment = (student, attRate, avgScore, assessments) => {
  const isKids = ['Kindergarten', 'PAUD', 'TK A', 'TK B'].includes(student.level) || student.class.includes('TK') || student.class.includes('PAUD');
  const name = student.name.split(' ')[0];
  let latestAss = assessments.length > 0 ? assessments[assessments.length - 1] : null;

  let highSubj = '';
  let lowSubj = '';
  if (latestAss && latestAss.scores) {
       const scores = Object.entries(latestAss.scores).filter(([k]) => k !== 'material' && typeof latestAss.scores[k] === 'number');
       if(scores.length > 0) {
           scores.sort((a,b) => (b[1] as number) - (a[1] as number));
           highSubj = scores[0][0];
           lowSubj = scores[scores.length - 1][0];
       }
  }

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let comment = "";

  if (isKids) {
       if (avgScore >= 85 || avgScore === 0) {
           const intros = [
               `${name} sangat ceria dan antusias dalam mengikuti kegiatan kelas. `,
               `${name} menunjukkan semangat belajar yang luar biasa dan selalu aktif berpartisipasi. `,
               `Kami sangat senang melihat perkembangan ${name} yang semakin berani dan percaya diri. `
           ];
           const strengths = highSubj ? [
               `Kemampuan ${highSubj}-nya patut diacungi jempol. `,
               `Perkembangannya dalam ${highSubj} terlihat sangat pesat. `
           ] : [`Perkembangan bahasa Inggrisnya menunjukkan kemajuan yang sangat positif. `];
           const closings = [
               `Terus pertahankan semangat belajar yang luar biasa ini ya!`,
               `Tetap semangat bermain dan belajar bahasa Inggris bersama teman-teman!`,
               `Good job!, ${name}! Teruslah berprestasi.`
           ];
           comment = pick(intros) + pick(strengths) + pick(closings);
       } else if (avgScore >= 70) {
           const intros = [
               `${name} menunjukkan ketertarikan yang baik selama sesi belajar bersama teman-teman. `,
               `Perkembangan ${name} di kelas cukup baik dan semakin terbiasa dengan lingkungan belajar. `
           ];
           const strengths = highSubj ? `Pemahaman ${highSubj} sudah mulai terlihat dengan baik. ` : '';
           const improvements = (lowSubj && lowSubj !== highSubj) ? `Dengan sedikit bimbingan lebih pada ${lowSubj}, hasilnya pasti akan lebih maksimal. ` : `Mari kita terus dorong keberaniannya dalam berekspresi. `;
           const closings = [`Tetap semangat berlatih di rumah ya!`, `Mari kita terus berikan motivasi agar ${name} semakin hebat.`];
           comment = pick(intros) + strengths + improvements + pick(closings);
       } else {
           const intros = [
               `${name} adalah anak yang hebat dan sedang terus belajar beradaptasi dengan baik. `,
               `Kami melihat potensi yang baik pada diri ${name} selama mengikuti kegiatan. `
           ];
           const improvements = lowSubj ? `Mari kita bersama-sama memberi dukungan lebih agar ${name} semakin percaya diri, khususnya dalam pengenalan ${lowSubj}. ` : `Bimbingan lebih lanjut akan sangat membantu pemahamannya. `;
           const closings = [`Semangat terus belajarnya ya, ${name}!`, `Kami yakin ${name} bisa jauh lebih baik lagi.`];
           comment = pick(intros) + improvements + pick(closings);
       }
  } else {
       if (avgScore >= 85 || avgScore === 0) {
           const intros = [
               `Proses belajar ${name} menunjukkan hasil yang sangat memuaskan, terlihat dari partisipasi aktif di kelas. `,
               `Kami sangat bangga dengan pencapaian akademik ${name} sejauh ini yang terus konsisten. `,
               `Selama periode ini, ${name} memperlihatkan dedikasi belajar yang luar biasa. `
           ];
           const strengths = highSubj ? [
               `Penguasaan pada aspek ${highSubj} sangat menonjol. `,
               `Kemampuan analitis dan pemahaman ${highSubj} berkembang pesat. `
           ] : [`Pemahaman materi secara komprehensif sangat patut diapresiasi. `];
           const closings = [
               `Terus pertahankan prestasi dan dedikasi cemerlang ini untuk tantangan akademik ke depannya.`,
               `Kami berharap ${name} dapat terus mempertahankan momentum positif ini.`,
               `Keep up the excellent work!`
           ];
           comment = pick(intros) + pick(strengths) + pick(closings);
       } else if (avgScore >= 70) {
           const intros = [
               `${name} memiliki pemahaman dasar yang baik dan cukup konsisten dalam mengikuti kelas. `,
               `Performa akademik ${name} menunjukkan progress yang stabil selama periode pembelajaran ini. `
           ];
           const strengths = highSubj ? `Keterampilan ${highSubj} merupakan salah satu kekuatan utamanya. ` : '';
           const improvements = lowSubj ? `Fokus tambahan pada area ${lowSubj} sangat disarankan untuk hasil yang lebih terpadu. ` : `Terdapat ruang untuk peningkatan yang lebih baik dalam kelancaran komunikasi. `;
           const closings = [
               `Terus tingkatkan intensitas latihan agar pencapaian akademik semakin maksimal.`,
               `Jangan ragu untuk terus berlatih dan bertanya. Semangat!`
           ];
           comment = pick(intros) + strengths + improvements + pick(closings);
       } else {
           const intros = [
               `${name} telah berusaha dengan baik untuk mengikuti ritme pembelajaran di kelas bahasa Inggris ini. `,
               `Kami menghargai setiap usaha yang ditunjukkan oleh ${name} selama mengikuti sesi kelas. `
           ];
           const improvements = lowSubj ? `Diperlukan dedikasi lebih dan fokus tambahan, khususnya pada keterampilan ${lowSubj}, agar dapat mengejar target pembelajaran. ` : `Dibutuhkan konsistensi ekstra untuk memahami konsep dasar yang diberikan. `;
           const closings = [
               `Jangan ragu untuk berdiskusi lebih aktif dengan tutor. Kami siap membantu!`,
               `Tingkatkan terus semangat belajarnya untuk mengejar ketertinggalan.`
           ];
           comment = pick(intros) + improvements + pick(closings);
       }
  }

  if (attRate < 75 && attRate > 0) {
      const attWarnings = [
          ` Selain itu, kami berharap tingkat kehadiran ${name} dapat lebih ditingkatkan agar tidak tertinggal materi penting.`,
          ` Peningkatan kehadiran di kelas juga akan sangat berdampak positif bagi progress belajarnya.`
      ];
      comment += pick(attWarnings);
  }

  return comment;
};

const Card = ({ children, className = '', id, onClick }: any) => (
  <div
    id={id}
    onClick={onClick}
    className={`bg-[#151B26] border border-gray-800 rounded-xl p-6 shadow-xl ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  icon: Icon,
  disabled = false,
}: any) => {
  const baseStyle =
    'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-[#00D4FF] text-[#0B0F19] hover:bg-[#00b8e6] shadow-[0_0_15px_rgba(0,212,255,0.3)]',
    secondary:
      'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700',
    danger:
      'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
    ghost: 'hover:bg-gray-800 text-gray-300 hover:text-white',
  };
  return (
    <button
      type={type as 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
  placeholder = '',
  className = '',
}) => {
  const baseClass =
    'w-full bg-[#0B0F19] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all disabled:opacity-50';
  return (
    <div className={`mb-4 w-full ${className}`}>
      {label && (
        <label className="block text-sm text-gray-400 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={baseClass}
          required={required}
        >
          <option value="">Select...</option>
          {options.map((opt, i) => (
            <option key={i} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={baseClass}
          required={required}
          placeholder={placeholder}
          min={type === 'number' ? '0' : undefined}
          max={type === 'number' ? '100' : undefined}
        />
      )}
    </div>
  );
};

const Badge = ({ status }) => {
  const styles = {
    Active: 'bg-green-500/10 text-green-400 border-green-500/20',
    Inactive: 'bg-red-500/10 text-red-400 border-red-500/20',
    Present: 'bg-green-500/10 text-green-400 border-green-500/20',
    Sick: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Excused: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Absent: 'bg-red-500/10 text-red-400 border-red-500/20',
    Paid: 'bg-green-500/10 text-green-400 border-green-500/20',
    Unpaid: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
        styles[status] || 'bg-gray-800 text-gray-300 whitespace-nowrap'
      }`}
    >
      {status}
    </span>
  );
};

const CustomModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animation-fade-in print:hidden">
      <div className="bg-[#151B26] border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0A0E17]">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const generateDummyDatabase = () => {
  const db = {
    users: [
      {
        id: 'ADM-001',
        username: 'admin',
        password: 'password',
        role: 'admin',
        name: 'Admin ECG',
        active: 'Active',
      },
    ],
    students: [],
    tutors: [],
    studentAttendance: [],
    tutorAttendance: [],
    journals: [],
    assessments: [],
    payments: [],
    payroll: [],
    calendar: [],
    announcements: [],
    recycleBin: [],
  };

  const names = [
    'Budi Santoso', 'Siti Aminah', 'Rudi Hermawan', 'Dewi Lestari', 'Andi Saputra',
    'Ayu Wandira', 'Joko Widodo', 'Mega Pertiwi', 'Dian Sastro', 'Putra Pratama',
    'Rina Nose', 'Eko Patrio', 'Sari Roti', 'Agus Yudhoyono', 'Nina Zatulini',
  ];

  for (let i = 1; i <= 10; i++) {
    db.tutors.push({
      id: `TUT-2026-${String(i).padStart(3, '0')}`,
      name: `Tutor ${names[i % names.length]}`,
      username: `tutor${i}`,
      password: 'password',
      teachingSession: SESSIONS[i % SESSIONS.length],
      status: 'Active',
    });
  }

  let studentCounter = 1;
  LEVELS.forEach((level) => {
    CLASS_MAPPING[level].forEach((cls) => {
      for (let i = 0; i < 5; i++) {
        db.students.push({
          id: `STU-2026-${String(studentCounter++).padStart(3, '0')}`,
          name: `${names[studentCounter % names.length]} ${cls}`,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          level,
          class: cls,
          status: 'Active',
          teacherComment: '',
        });
      }
    });
  });

  const today = new Date();
  for (let i = 0; i < 10; i++) {
    db.announcements.push({
      id: `ANN-${i}`,
      title: `Information Update ${i + 1}`,
      content:
        'Please check your schedule for the upcoming assessment week. Ensure all journals are submitted on time for review.\n\nThank you for your continuous support.\nBest Regards,\nAdmin',
      date: new Date(today.getTime() - i * 86400000).toISOString().split('T')[0],
      author: 'Admin ECG',
    });
  }
  for (let i = 0; i < 20; i++) {
    const eventDate = new Date(today.getTime() + (i - 5) * 86400000).toISOString().split('T')[0];
    const assignedTutor = db.tutors[i % db.tutors.length];
    db.calendar.push({
      id: `CAL-${i}`,
      sessionGroup: assignedTutor.teachingSession,
      date: eventDate,
      startTime: '15:00',
      endTime: '16:30',
      tutor: assignedTutor.name,
    });
  }

  return db;
};

// COMPONENT UNTUK FORCE PASSWORD CHANGE SISWA PADA LOGIN PERTAMA
function ForcePasswordChangeScreen({ user, db, setDb, setCurrentUser, showToast }) {
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) return showToast('Passwords do not match!', 'error');
    if (newPwd.length < 6) return showToast('Password must be at least 6 characters.', 'warning');

    if (user.role === 'tutor') {
      setDb(prev => ({
        ...prev,
        tutors: prev.tutors.map(t => t.id === user.id ? { ...t, password: newPwd, mustChangePassword: false } : t)
      }));
    } else {
      setDb(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === user.id ? { ...u, password: newPwd, mustChangePassword: false } : u)
      }));
    }

    setCurrentUser(prev => ({ ...prev, password: newPwd, mustChangePassword: false }));
    showToast('Password updated successfully! Welcome to Academic Suite.', 'success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-4 font-sans text-white">
      <Card className="w-full max-w-md border border-[#00D4FF]/20 shadow-[0_0_30px_rgba(0,212,255,0.1)]">
        <h2 className="text-2xl font-bold mb-2 text-[#00D4FF]">Set New Password</h2>
        <p className="text-gray-400 mb-6 text-sm">For your security, please change your temporary password before continuing to Academic Suite.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="New Password" type="password" value={newPwd} onChange={setNewPwd} required placeholder="Min. 6 characters" />
          <Input label="Confirm New Password" type="password" value={confirmPwd} onChange={setConfirmPwd} required placeholder="Re-type new password" />
          <Button type="submit" className="w-full mt-4 py-3">Save and Continue</Button>
        </form>
      </Card>
    </div>
  );
}

function LoginScreen({ onLogin, isDbLoaded = true }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ecg_remembered_user');
    if (saved) {
      try {
        const { username: savedUsername, password: savedPassword } = JSON.parse(saved);
        setUsername(savedUsername);
        setPassword(savedPassword);
        setRememberMe(true);
      } catch (e) {}
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    setTimeout(() => {
      const success = onLogin(username, password, rememberMe);
      if (!success) {
        setLoginError('Invalid username or password. Please try again.');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#051126] font-['Poppins',sans-serif] selection:bg-[#00C2FF] selection:text-[#051126] overflow-hidden">
      
      {/* LEFT SIDE - 60% PREMIUM BRANDING */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col justify-center p-12 xl:p-24 overflow-hidden bg-gradient-to-br from-[#0A3D91] to-[#051126]">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00C2FF]/20 blur-[120px] rounded-full pointer-events-none"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#00C2FF]/10 blur-[150px] rounded-full pointer-events-none"></div>

         <div className="relative z-10 max-w-3xl animation-fade-in">
           <div className="flex items-center gap-6 mb-8">
             <img src={LOGO_URL} alt="ECG Logo" className="h-20 xl:h-24 w-auto drop-shadow-[0_0_20px_rgba(0,194,255,0.4)]" />
             <div className="border-l-2 border-white/20 pl-6">
               <h1 className="text-3xl xl:text-[2.5rem] font-bold text-white tracking-tight leading-tight mb-1">English Club Gresik</h1>
               <h2 className="text-xl xl:text-2xl font-extrabold text-[#00C2FF] tracking-widest uppercase">Academic Suite</h2>
             </div>
           </div>
           
           <h3 className="text-2xl text-white mb-4 font-semibold tracking-tight">Educational Administration Platform</h3>
           <p className="text-base text-blue-100/70 mb-10 leading-relaxed max-w-xl">
             Manage students, tutors, attendance, assessments, learning journals, payments, reports, and academic activities through one integrated platform designed for modern education.
           </p>

           <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[24px] shadow-2xl max-w-2xl">
             <p className="text-xs text-[#00C2FF] font-black uppercase tracking-widest mb-6">Platform Capabilities</p>
             <div className="grid grid-cols-2 gap-x-8 gap-y-5">
               {[
                 'Student Management', 'Tutor Management', 'Attendance Tracking',
                 'Monthly Assessments', 'Learning Journals', 'Financial Management',
                 'Reports & Analytics', 'Academic Calendar'
               ].map((feature, i) => (
                 <div key={i} className="flex items-center gap-3 group">
                   <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00C2FF]/10 flex items-center justify-center border border-[#00C2FF]/30 group-hover:bg-[#00C2FF]/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_10px_rgba(0,194,255,0.1)]">
                     <CheckCircle2 size={12} className="text-[#00C2FF]" />
                   </div>
                   <span className="text-sm text-blue-100/80 font-medium group-hover:text-white transition-colors">{feature}</span>
                 </div>
               ))}
             </div>
           </div>
         </div>
      </div>

      {/* RIGHT SIDE - 40% LOGIN FORM */}
      <div className="w-full lg:w-[40%] relative flex flex-col justify-center items-center p-6 sm:p-12 z-20 bg-[#0B0F19]">
        <div className="lg:hidden flex flex-col items-center mb-8 text-center animation-fade-in w-full">
           <img src={LOGO_URL} alt="ECG Logo" className="h-16 w-auto mb-4 drop-shadow-[0_0_15px_rgba(0,194,255,0.4)]" />
           <h1 className="text-2xl font-bold text-white tracking-tight">English Club Gresik</h1>
           <h2 className="text-lg font-extrabold text-[#00C2FF] tracking-widest uppercase mt-1">Academic Suite</h2>
        </div>

        <div className="w-full max-w-[440px] bg-[#151B26]/80 backdrop-blur-2xl border border-gray-800 p-8 sm:p-10 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] animation-fade-in" style={{ animationDelay: '100ms' }}>
           <div className="mb-8">
             <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
             <p className="text-gray-400 text-sm font-medium">Sign in to continue to your dashboard</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
             {loginError && (
               <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3.5 rounded-xl flex items-start gap-2 animation-fade-in shadow-sm">
                 <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                 <span className="font-medium">{loginError}</span>
               </div>
             )}
             
             <div>
               <label className="block text-sm text-gray-400 mb-2 font-medium">Username / Email</label>
               <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF] transition-all shadow-inner placeholder-gray-600" placeholder="Enter your username" />
             </div>

             <div>
               <label className="block text-sm text-gray-400 mb-2 font-medium">Password</label>
               <div className="relative flex items-center">
                 <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl pl-4 pr-12 py-3.5 text-white focus:outline-none focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF] transition-all shadow-inner placeholder-gray-600" placeholder="••••••••" />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-500 hover:text-[#00C2FF] transition-colors focus:outline-none p-1">
                    <Eye size={20} className={showPassword ? "text-[#00C2FF]" : "opacity-60"} />
                 </button>
               </div>
             </div>

             <div className="flex items-center justify-between mt-2 pt-1">
               <label className="flex items-center gap-2 cursor-pointer group">
                 <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-700 text-[#00C2FF] focus:ring-[#00C2FF] bg-[#0B0F19] cursor-pointer" />
                 <span className="text-sm text-gray-400 group-hover:text-white transition-colors font-medium">Remember Me</span>
               </label>
               <a href="https://wa.link/uwdlzm" target="_blank" rel="noopener noreferrer" className="text-sm text-[#00C2FF] hover:text-[#00A3D9] transition-colors font-semibold">Forgot Password?</a>
             </div>

             <button type="submit" disabled={isLoading || !isDbLoaded} className="w-full mt-8 bg-[#00C2FF] hover:bg-[#00A3D9] text-[#051126] font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,194,255,0.25)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-base">
               {!isDbLoaded ? (
                 <span className="flex items-center gap-2 font-mono tracking-widest font-bold">
                   FINALIZING...
                 </span>
               ) : isLoading ? (
                 <><div className="w-5 h-5 border-2 border-[#051126]/20 border-t-[#051126] rounded-full animate-spin"></div>Authenticating...</>
               ) : (
                 'Sign In'
               )}
             </button>
           </form>
        </div>

        <div className="mt-12 text-center space-y-3 animation-fade-in" style={{ animationDelay: '200ms' }}>
           <p className="text-sm text-gray-500 font-medium">
             Need help? <a href="https://wa.link/9awys1" target="_blank" rel="noopener noreferrer" className="text-[#00C2FF] hover:underline font-semibold">Contact Support</a>
           </p>
           <div className="text-xs text-gray-600 flex gap-4 justify-center font-medium">
              <a href="https://www.englishclub.my.id" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">englishclub.my.id</a>
              <span>•</span>
              <a href="https://www.instagram.com/englishclubgresik/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">@englishclubgresik</a>
           </div>
        </div>
      </div>
    </div>
  );
}

  const KPICard = ({ title, value, subtext, icon: Icon, colorClass, onClick }: any) => (
    <Card onClick={onClick} className="cursor-pointer hover:-translate-y-1 transition-transform border-t-4 border-t-[#00D4FF]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
          {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </Card>
  );

// REPLACE THIS SECTION: DateTime Display Component
// Alasan: Mengurangi margin atas (mt-3) agar lebih merapat dengan teks sapaan dan ukuran tombol lebih ringkas di layar kecil.
const DateTimeDisplay = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Sinkronisasi pembaruan agar tepat setiap awal menit
    const secUntilNextMin = 60 - now.getSeconds();
    const timeout = setTimeout(() => {
      setNow(new Date());
      const interval = setInterval(() => setNow(new Date()), 60000);
      return () => clearInterval(interval);
    }, secUntilNextMin * 1000);
    return () => clearTimeout(timeout);
  }, [now]);

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 mt-3 text-gray-300 font-medium w-full">
      <div className="flex items-center gap-2 bg-[#0A0E17]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-700/50 text-xs sm:text-sm shadow-md hover:border-gray-600 transition-all w-full sm:w-auto">
        <CalendarIcon size={14} className="text-[#3B82F6]" />
        <span className="tracking-wide">{now.toLocaleDateString('en-US', dateOptions)}</span>
      </div>
      <div className="flex items-center gap-2 bg-[#00D4FF]/10 backdrop-blur-md text-[#00D4FF] px-3.5 py-2 rounded-xl border border-[#00D4FF]/20 text-xs sm:text-sm shadow-[0_4px_12px_rgba(0,212,255,0.05)] font-bold tracking-wider hover:bg-[#00D4FF]/15 transition-all w-full sm:w-auto">
        <Clock size={14} />
        <span>{now.toLocaleTimeString('en-US', timeOptions)}</span>
      </div>
    </div>
  );
};

// REPLACE THIS SECTION: Fetch data asli dari Open-Meteo & Layout Baru
// Alasan: Menghapus fixed min-width yang memaksa ruang kosong berlebih. Menggunakan w-full, h-full, dan justify-between agar menyesuaikan tinggi kontainer secara otomatis dan vertikalnya selaras.
const WeatherWidget = () => {
  const [weather, setWeather] = useState({ temp: 0, feelsLike: 0, humidity: 0, windSpeed: 0, code: 0, loading: true, error: false });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Fetch Real Weather Data for Kebomas, Gresik
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-7.169&longitude=112.641&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        setWeather({ 
          temp: Math.round(data.current.temperature_2m), 
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          code: data.current.weather_code, 
          loading: false,
          error: false
        });
      } catch (e) {
        setWeather(prev => ({ ...prev, loading: false, error: true })); 
      }
    };
    fetchWeather();
    const intervalId = setInterval(fetchWeather, 15 * 60 * 1000); // Auto-refresh setiap 15 menit
    return () => clearInterval(intervalId);
  }, []);

  if (weather.loading) {
    return <div className="animate-pulse bg-gradient-to-br from-[#0A0E17]/90 to-[#151B26]/90 border border-gray-700/50 h-[180px] w-full xl:w-[320px] rounded-[24px] shadow-lg"></div>;
  }

  if (weather.error) {
    return (
      <div className="flex flex-col justify-center items-center gap-3 p-6 bg-red-500/10 border border-red-500/20 rounded-[24px] w-full xl:w-[320px] shadow-lg min-h-[180px]">
        <CloudOff className="text-red-400" size={32} />
        <span className="text-sm text-red-400 font-bold tracking-wide">WEATHER UNAVAILABLE</span>
      </div>
    );
  }

  // WMO Weather code mapping
  const getWeatherDetails = (code) => {
    if (code === 0) return { icon: Sun, label: 'Sunny', color: 'text-amber-400', bg: 'bg-amber-400/10' };
    if (code >= 1 && code <= 3) return { icon: Cloud, label: 'Cloudy', color: 'text-blue-300', bg: 'bg-blue-400/10' };
    if (code >= 51 && code <= 65) return { icon: CloudRain, label: 'Rainy', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (code >= 95) return { icon: CloudLightning, label: 'Stormy', color: 'text-purple-400', bg: 'bg-purple-500/10' };
    return { icon: Cloud, label: 'Cloudy', color: 'text-gray-300', bg: 'bg-gray-500/10' };
  };

  const { icon: Icon, label, color, bg } = getWeatherDetails(weather.code);

  return (
    <div className="flex flex-col justify-between bg-gradient-to-br from-[#0A0E17]/90 to-[#151B26]/90 backdrop-blur-xl border border-gray-700/50 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-4 sm:p-5 hover:border-[#00D4FF]/30 transition-all duration-300 w-full cursor-default relative overflow-hidden group h-full">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00D4FF]/5 rounded-full blur-2xl group-hover:bg-[#00D4FF]/10 transition-colors pointer-events-none"></div>

      {/* Top Row: Main Temp & Location */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-700/50 relative z-10">
         <div className="flex items-center gap-3 sm:gap-4">
            <div className={`p-2.5 sm:p-3 rounded-2xl ${bg} border border-white/5 shadow-inner`}>
              <Icon size={24} className={color} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tighter">{weather.temp}°<span className="text-lg sm:text-xl text-gray-400 font-bold">C</span></span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#00D4FF] uppercase tracking-widest mt-1">{label}</span>
            </div>
         </div>
         <div className="text-right pl-2">
            <span className="block text-[11px] sm:text-xs text-gray-400 font-semibold leading-tight">Kebomas,</span>
            <span className="block text-xs sm:text-sm text-gray-200 font-bold tracking-wide">Gresik</span>
         </div>
      </div>
      
      {/* Bottom Row: Detail Cards */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
         <div className="flex flex-col items-center justify-center p-2 sm:p-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-xl border border-white/5">
            <Thermometer size={14} className="text-amber-400 mb-1" />
            <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5 font-bold">Feels</span>
            <span className="text-[11px] sm:text-xs font-black text-white">{weather.feelsLike}°C</span>
         </div>
         <div className="flex flex-col items-center justify-center p-2 sm:p-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-xl border border-white/5">
            <Droplets size={14} className="text-blue-400 mb-1" />
            <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5 font-bold">Humid</span>
            <span className="text-[11px] sm:text-xs font-black text-white">{weather.humidity}%</span>
         </div>
         <div className="flex flex-col items-center justify-center p-2 sm:p-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-xl border border-white/5">
            <Wind size={14} className="text-emerald-400 mb-1" />
            <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-0.5 font-bold">Wind</span>
            <span className="text-[11px] sm:text-xs font-black text-white flex items-baseline gap-0.5">{weather.windSpeed}<span className="text-[9px] font-semibold text-gray-400">km/h</span></span>
         </div>
      </div>
    </div>
  );
};

const GreetingCard = ({ userName, children, isCloudConnected }: any) => {
  const hour = new Date().getHours();
  let greeting = '';
  let emoji = '';
  let subtitle = '';

  if (hour >= 5 && hour < 11) {
    greeting = 'Good Morning';
    emoji = '☀️';
    subtitle = 'Start your day with enthusiasm and achieve your goals.';
  } else if (hour >= 11 && hour < 15) {
    greeting = 'Good Afternoon';
    emoji = '☁️';
    subtitle = 'Keep up the good work and stay productive.';
  } else if (hour >= 15 && hour < 18) {
    greeting = 'Good Evening';
    emoji = '🌤️';
    subtitle = "Finish today's tasks and prepare for tomorrow.";
  } else {
    greeting = 'Good Night';
    emoji = '🌙';
    subtitle = 'Take time to review your progress and recharge.';
  }

  const displayName = userName ? userName.split(' ')[0] : 'User';

  // REPLACE THIS SECTION: Perbaikan Rasio Responsif Desktop (~45%, ~35%, ~20%) dan pembungkus vertikal
  // Alasan: Membagi flex layout untuk Mobile (100%), Tablet (Baris 1: 55% + 40%, Baris 2: 100%), dan Desktop (45% + 35% + 20% satu baris). Memakai items-stretch agar tinggi selaras.
  return (
    <div className="w-full bg-[#151B26]/80 backdrop-blur-xl border border-[#00D4FF]/20 p-5 lg:p-6 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] animation-fade-in relative overflow-hidden flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap justify-between items-stretch gap-4 lg:gap-5 mb-6 sm:mb-8 transition-all">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#00D4FF]/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#3B82F6]/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* KIRI: Sapaan (~45% di Desktop, ~55% di Tablet) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10 w-full md:w-[55%] lg:w-[45%]">
        <div className="flex-shrink-0 bg-[#0A0E17]/60 p-3.5 rounded-2xl border border-white/5 shadow-inner flex items-center justify-center">
          <span className="text-4xl drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] select-none leading-none">
            {emoji}
          </span>
        </div>
        <div className="flex-1 w-full flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight leading-tight">
            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D4FF] to-[#3B82F6]">{displayName}</span>
          </h2>
          <p className="text-gray-400 font-medium text-xs sm:text-sm leading-relaxed max-w-sm lg:max-w-md">
            {subtitle}
          </p>
          <DateTimeDisplay />
        </div>
      </div>

      {/* TENGAH: Widget Cuaca (~35% di Desktop, ~40% di Tablet) */}
      <div className="relative z-10 w-full md:w-[40%] lg:w-[35%] shrink-0 flex">
         <WeatherWidget />
      </div>

      {/* KANAN: Cloud Status & Children (~20% di Desktop) */}
      <div className="relative z-10 w-full lg:w-[18%] lg:flex-1 flex flex-col md:flex-row lg:flex-col justify-center items-stretch md:items-center lg:items-end gap-3 shrink-0">
        
        {/* Status Cloud Real-time Badge */}
        <div className={`flex lg:flex-col xl:flex-row items-center gap-3 px-3.5 py-3 rounded-[20px] border backdrop-blur-md transition-all duration-500 shadow-md w-full justify-start xl:justify-center h-full sm:h-auto lg:h-full ${
            isCloudConnected 
            ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_8px_20px_rgba(16,185,129,0.1)]' 
            : 'bg-rose-500/10 border-rose-500/20 shadow-[0_8px_20px_rgba(244,63,94,0.1)]'
        }`}>
           <div className="relative flex items-center justify-center flex-shrink-0">
              <div className={`p-2 rounded-xl ${isCloudConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                 {isCloudConnected ? <Cloud size={20} /> : <CloudOff size={20} />}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  {isCloudConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 border-[2px] border-[#151B26] ${isCloudConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
           </div>
           <div className="flex flex-col lg:items-center xl:items-start text-left lg:text-center xl:text-left">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">System Status</span>
              <span className={`text-xs sm:text-sm font-black leading-none flex items-center justify-start lg:justify-center xl:justify-start gap-1 tracking-wide ${isCloudConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {isCloudConnected ? 'CONNECTED' : 'OFFLINE MODE'}
              </span>
           </div>
        </div>

        {/* Children Render */}
        {children && (
          <div className="w-full">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

const StudentDashboard = ({ db, user, setActiveTab, today, isCloudConnected }: any) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const studentRecord = db.students.find(s => s.id === user.studentId) || { class: '-', level: '-', name: user.name };
  const mySessionGroup = getSessionGroup(studentRecord.class);
  const currentMonthPrefix = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthStr = String(currentTime.getMonth() + 1);
  const currentYearStr = String(currentTime.getFullYear());

  const myAttAll = db.studentAttendance.filter(a => a.studentId === user.studentId);
  const myAttThisMonth = myAttAll.filter(a => a.date.startsWith(currentMonthPrefix));
  const totalSessionsThisMonth = myAttThisMonth.length;
  const presentThisMonth = myAttThisMonth.filter(a => a.status === 'Present').length;
  const attRateThisMonth = totalSessionsThisMonth > 0 ? Math.round((presentThisMonth / totalSessionsThisMonth) * 100) : 0;

  const myAssessments = db.assessments.filter(a => a.studentId === user.studentId).sort((a,b) => (b.year+b.month).localeCompare(a.year+a.month));
  const completedAssThisMonth = myAssessments.filter(a => a.month === currentMonthStr && a.year === currentYearStr).length;
  const pendingAss = Math.max(0, 1 - completedAssThisMonth);

  const journalEntriesThisMonth = db.journals.filter(j => j.sessionGroup === mySessionGroup && j.date.startsWith(currentMonthPrefix)).length;

  const myPayments = db.payments.filter(p => p.studentId === user.studentId && p.month === currentMonthStr && p.year === currentYearStr);
  const isPaid = myPayments.some(p => p.status === 'Paid');
  const paymentStatusText = isPaid ? 'Paid' : 'Unpaid';

  const latestAss = myAssessments.length > 0 ? myAssessments[0] : null;
  const avgScore = latestAss ? latestAss.average : 0;
  const currentGrade = latestAss ? latestAss.grade : '-';

  const upcomingClasses = db.calendar.filter(c => c.date >= today).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 5);
  const nextClass = upcomingClasses.length > 0 ? upcomingClasses[0] : null;

  const scores = latestAss && latestAss.scores ? latestAss.scores : {};
  const getScore = (subject) => Number(scores[subject]) || 0;
  
  const isKindergarten = studentRecord.level === 'Kindergarten' || ['PAUD', 'TK A', 'TK B'].includes(studentRecord.class);

  const skillProgress = isKindergarten ? [
     { label: 'Membaca', value: getScore('Membaca'), color: 'bg-blue-500' },
     { label: 'Menulis', value: getScore('Menulis'), color: 'bg-purple-500' },
     { label: 'Berhitung', value: getScore('Berhitung'), color: 'bg-emerald-500' },
     { label: 'Bahasa Inggris', value: getScore('Bahasa Inggris'), color: 'bg-amber-500' }
  ] : [
     { label: 'Speaking', value: getScore('Speaking'), color: 'bg-blue-500' },
     { label: 'Writing', value: getScore('Writing'), color: 'bg-purple-500' },
     { label: 'Reading', value: getScore('Reading'), color: 'bg-emerald-500' },
     { label: 'Listening', value: getScore('Listening'), color: 'bg-amber-500' }
  ];

  return (
     <div className="space-y-8 w-full max-w-full overflow-hidden animation-fade-in pb-8 font-sans">
        
        <GreetingCard userName={user?.name} isCloudConnected={isCloudConnected} />

        {/* TOP HERO SECTION */}
        <div className="bg-gradient-to-br from-[#0A3D91] to-[#051126] border border-[#00D4FF]/30 p-6 sm:p-10 rounded-[20px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 -mt-2">
           <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-[#00D4FF]/10 blur-[120px] rounded-full pointer-events-none"></div>
           
           <div className="relative z-10 w-full md:w-2/3">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Your Academic Overview</h2>
              <p className="text-blue-100/80 font-medium text-sm sm:text-base mb-8">What should I do today?</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                 <div>
                    <p className="text-xs text-blue-200/60 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5"><Clock size={12}/> Next Class</p>
                    <p className="text-white font-semibold text-sm line-clamp-1">{nextClass ? `${nextClass.sessionGroup || nextClass.name} @ ${nextClass.startTime}` : 'None today'}</p>
                 </div>
                 <div>
                    <p className="text-xs text-blue-200/60 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5"><CheckSquare size={12}/> Assignments</p>
                    <p className="text-white font-semibold text-sm">{pendingAss} Pending</p>
                 </div>
                 <div>
                    <p className="text-xs text-blue-200/60 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5"><UserCheck size={12}/> Attendance</p>
                    <p className="text-white font-semibold text-sm">{attRateThisMonth}%</p>
                 </div>
                 <div>
                    <p className="text-xs text-blue-200/60 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5"><Award size={12}/> Current Score</p>
                    <p className="text-white font-semibold text-sm">{avgScore || '-'} <span className="text-blue-300 font-medium text-xs ml-1">(Grade {currentGrade})</span></p>
                 </div>
              </div>
           </div>

           <div className="relative z-10 w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
              <Button onClick={() => setActiveTab('calendar')} className="w-full min-h-[48px] shadow-[0_0_25px_rgba(0,212,255,0.3)] text-sm font-bold rounded-xl hover:scale-105 transition-transform" icon={CalendarIcon}>Join Class</Button>
              <Button onClick={() => setActiveTab('my_assessments')} variant="secondary" className="w-full min-h-[48px] text-sm font-bold rounded-xl border-[#00D4FF]/30 hover:bg-[#00D4FF]/10 text-[#00D4FF]" icon={FileText}>View Assignments</Button>
           </div>
        </div>

        {/* QUICK STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
           <KPICard title="Attendance" value={`${attRateThisMonth}%`} subtext={`${presentThisMonth} sessions attended`} icon={UserCheck} colorClass={attRateThisMonth >= 80 ? "bg-emerald-500" : "bg-amber-500"} onClick={() => setActiveTab('my_attendance')} />
           <KPICard title="Assignments" value={pendingAss} subtext={pendingAss > 0 ? "Due this month" : "All caught up!"} icon={CheckSquare} colorClass={pendingAss === 0 ? "bg-emerald-500" : "bg-rose-500"} onClick={() => setActiveTab('my_assessments')} />
           <KPICard title="Learning Journal" value={journalEntriesThisMonth} subtext="Total entries" icon={BookOpen} colorClass="bg-purple-500" onClick={() => setActiveTab('my_journals')} />
           <KPICard title="Academic Score" value={avgScore || '-'} subtext={`Grade: ${currentGrade}`} icon={Award} colorClass="bg-indigo-500" onClick={() => setActiveTab('my_report')} />
           <KPICard title="Payment Status" value={paymentStatusText} subtext="Tuition fee" icon={DollarSign} colorClass={isPaid ? "bg-emerald-500" : "bg-rose-500"} onClick={() => setActiveTab('my_payments')} />
        </div>

        {/* TODAY'S ACTIVITY */}
        <div>
           <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Activity size={22} className="text-[#00D4FF]" /> Today's Activity</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Next Class */}
              <Card className="bg-[#151B26]/80 backdrop-blur-md border-t-4 border-t-emerald-400 p-5 sm:p-6 hover:-translate-y-1 transition-transform shadow-lg">
                 <div className="flex justify-between items-start mb-5">
                    <div className="p-3 bg-emerald-500/10 rounded-xl"><CalendarIcon size={24} className="text-emerald-400"/></div>
                    <span className="px-3 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-widest">Up Next</span>
                 </div>
                 <h4 className="font-bold text-white text-lg mb-1.5">{nextClass ? (nextClass.sessionGroup || nextClass.name) : 'No classes today'}</h4>
                 <p className="text-sm text-gray-400 mb-6">{nextClass ? `${nextClass.startTime} - ${nextClass.endTime} • ${nextClass.tutor}` : 'Take a break and review your notes.'}</p>
                 <Button variant="secondary" className="w-full text-sm font-semibold py-2.5 bg-emerald-500/10 border-none text-emerald-400 hover:bg-emerald-500/20 rounded-lg" disabled={!nextClass} onClick={() => setActiveTab('calendar')}>View Schedule</Button>
              </Card>

              {/* Assignments Due */}
              <Card className="bg-[#151B26]/80 backdrop-blur-md border-t-4 border-t-rose-400 p-5 sm:p-6 hover:-translate-y-1 transition-transform shadow-lg">
                 <div className="flex justify-between items-start mb-5">
                    <div className="p-3 bg-rose-500/10 rounded-xl"><CheckSquare size={24} className="text-rose-400"/></div>
                    {pendingAss > 0 && <span className="px-3 py-1 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full uppercase tracking-widest">Action Needed</span>}
                 </div>
                 <h4 className="font-bold text-white text-lg mb-1.5">{pendingAss > 0 ? `${pendingAss} Pending Assessment` : 'All Caught Up!'}</h4>
                 <p className="text-sm text-gray-400 mb-6">{pendingAss > 0 ? 'You have assessments due this month.' : 'No pending assignments at the moment.'}</p>
                 <Button variant="secondary" className="w-full text-sm font-semibold py-2.5 bg-rose-500/10 border-none text-rose-400 hover:bg-rose-500/20 rounded-lg" onClick={() => setActiveTab('my_assessments')}>Go to Assessments</Button>
              </Card>

              {/* Journal Reminder */}
              <Card className="bg-[#151B26]/80 backdrop-blur-md border-t-4 border-t-purple-400 p-5 sm:p-6 hover:-translate-y-1 transition-transform shadow-lg">
                 <div className="flex justify-between items-start mb-5">
                    <div className="p-3 bg-purple-500/10 rounded-xl"><BookOpen size={24} className="text-purple-400"/></div>
                 </div>
                 <h4 className="font-bold text-white text-lg mb-1.5">Learning Journal</h4>
                 <p className="text-sm text-gray-400 mb-6">Review the latest materials from your tutor.</p>
                 <Button variant="secondary" className="w-full text-sm font-semibold py-2.5 bg-purple-500/10 border-none text-purple-400 hover:bg-purple-500/20 rounded-lg" onClick={() => setActiveTab('my_journals')}>Open Journal</Button>
              </Card>
           </div>
        </div>

        {/* UPCOMING CLASSES */}
        <div>
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CalendarIcon size={22} className="text-emerald-400" /> Upcoming Classes</h3>
              <Button variant="ghost" className="text-xs px-4 py-2 bg-[#151B26] hover:bg-gray-800 rounded-lg" onClick={() => setActiveTab('calendar')}>See All</Button>
           </div>
           <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x">
              {upcomingClasses.length > 0 ? upcomingClasses.map(c => (
                 <Card key={c.id} className="min-w-[280px] sm:min-w-[320px] bg-[#151B26] p-5 border border-gray-800 shadow-md hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] transition-all snap-start">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1.5">
                           <span className="px-3 py-1.5 text-xs font-bold bg-[#0B0F19] text-emerald-400 border border-emerald-500/20 rounded-lg tracking-wide">{new Date(c.date).toLocaleDateString('en-US', {weekday: 'short', month:'short', day:'numeric'})}</span>
                           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{calculateDaysLeft(c.date, today)}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-800/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"><Clock size={12}/> {c.startTime}</span>
                    </div>
                    <h4 className="font-bold text-white text-lg mb-2 truncate">{c.sessionGroup || c.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User size={16} className="text-purple-400" />
                        <span className="truncate">{c.tutor}</span>
                    </div>
                 </Card>
              )) : (
                 <div className="w-full p-8 text-center bg-[#151B26] rounded-xl border border-gray-800">
                    <CalendarIcon size={40} className="mx-auto text-gray-700 mb-3" />
                    <p className="text-gray-400 font-medium text-sm">No upcoming classes scheduled.</p>
                 </div>
              )}
           </div>
        </div>

        {/* LEARNING PROGRESS & ANNOUNCEMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="bg-[#151B26] border-gray-800 shadow-lg p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20"><BarChart3 size={24} className="text-blue-400"/></div>
                  <h3 className="text-xl font-bold text-white">Learning Progress</h3>
              </div>
              <div className="space-y-7">
                 {latestAss ? skillProgress.map(skill => (
                    <div key={skill.label}>
                       <div className="flex justify-between items-end mb-2.5">
                          <span className="text-gray-300 font-semibold text-sm">{skill.label}</span>
                          <span className="text-white font-black text-lg leading-none">{skill.value}%</span>
                       </div>
                       <div className="w-full bg-gray-800/80 rounded-full h-3 overflow-hidden shadow-inner">
                          <div className={`h-full rounded-full transition-all duration-1000 ${skill.color} relative`} style={{ width: `${skill.value}%` }}>
                             <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full rounded-full"></div>
                          </div>
                       </div>
                    </div>
                 )) : (
                    <div className="flex flex-col items-center justify-center py-10">
                       <Award size={48} className="text-gray-700 mb-4" />
                       <p className="text-sm text-gray-500 font-medium">No assessment data available yet.</p>
                    </div>
                 )}
              </div>
           </Card>

           <Card className="bg-[#151B26] border-gray-800 shadow-lg p-0 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0A0E17]">
                 <h3 className="text-xl font-bold text-white flex items-center gap-3"><div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20"><Bell size={20} className="text-yellow-400"/></div> Announcements</h3>
                 <Button variant="ghost" className="text-xs py-2 px-4 bg-[#151B26] hover:bg-gray-800 rounded-lg" onClick={() => setActiveTab('announcements')}>View All</Button>
              </div>
              <div className="p-6 space-y-4 flex-1">
                 {db.announcements.slice(-3).reverse().map(a => (
                    <div key={a.id} className="p-5 bg-[#0B0F19] rounded-[16px] border border-gray-800 hover:border-gray-700 hover:shadow-lg transition-all group">
                       <h4 className="font-bold text-white group-hover:text-[#00D4FF] transition-colors text-base mb-1.5">{a.title}</h4>
                       <p className="text-[10px] text-gray-500 mb-3 font-semibold uppercase tracking-wider">{a.date} • {a.author}</p>
                       <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{a.content}</p>
                    </div>
                 ))}
                 {db.announcements.length === 0 && <p className="text-sm text-gray-500 text-center py-10">No announcements available.</p>}
              </div>
           </Card>
        </div>
     </div>
  );
};

const AdminDashboard = ({ db, user, setActiveTab, today, isCloudConnected }: any) => {
  const getActiveCount = (collection) => (db[collection] || []).filter((item) => item.status === 'Active' || item.active === 'Active').length;
  
  const totalStudents = getActiveCount('students');
  const totalTutors = getActiveCount('tutors');
  const studentAttToday = db.studentAttendance.filter(a => a.date === today && a.status === 'Present').length;
  const tutorCheckInToday = db.tutorAttendance.filter(a => a.date === today && a.status === 'Present').length;
  
  const dObj = new Date();
  const currentMonth = String(dObj.getMonth() + 1);
  const currentYear = String(dObj.getFullYear());
  
  const currentJournals = db.journals.filter(j => j.date.startsWith(`${currentYear}-${currentMonth.padStart(2, '0')}`)).length;
  const paidPayrollCount = db.payroll.filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'Paid').length;

  const activeStudentIds = db.students.filter(s => s.status === 'Active' || s.active === 'Active').map(s => s.id);
  const currentMonthPayments = db.payments.filter(p => p.month === currentMonth && p.year === currentYear && activeStudentIds.includes(p.studentId));
  const totalRevenueAmount = currentMonthPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const paidInvoicesCount = currentMonthPayments.filter(p => p.status === 'Paid').length;

  // NEW: Calculate meetings this month for Expected Revenue from Calendar PER SESSION
  const currentMonthPrefix = `${currentYear}-${currentMonth.padStart(2, '0')}`;
  
  let expectedRevenueAmount = 0;
  SESSIONS.forEach(session => {
      const studentsInSession = db.students.filter(s => (s.status === 'Active' || s.active === 'Active') && getSessionGroup(s.class) === session).length;
      const meetingsForSession = db.calendar.filter(c => c.date.startsWith(currentMonthPrefix) && (c.sessionGroup === session || c.name === session)).length;
      expectedRevenueAmount += (studentsInSession * meetingsForSession * 25000);
  });
  
  const totalOutstandingRevenueAmount = Math.max(0, expectedRevenueAmount - totalRevenueAmount);

  const sessionRevenueData = SESSIONS.map(session => {
      const sessionStudents = db.students.filter(s => s.status === 'Active' && getSessionGroup(s.class) === session).length;
      const sessionPayments = currentMonthPayments.filter(p => p.sessionGroup === session && p.status === 'Paid');
      const sessionCollected = sessionPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const sessionPaidCount = sessionPayments.length;
      const sessionOutstanding = sessionStudents - sessionPaidCount;
      
      return { session, students: sessionStudents, collected: sessionPaidCount, outstanding: sessionOutstanding, revenue: sessionCollected };
  });

  const upcomingCalendar = db.calendar
      .filter(c => c.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

  // DELETE THIS: "Add New Student" button from AdminDashboard
  return (
    <div className="space-y-4 sm:space-y-6 animation-fade-in w-full max-w-full overflow-hidden font-sans">
      <GreetingCard userName={user?.name} isCloudConnected={isCloudConnected} />

      {/* 6 Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
         <KPICard title="Total Students" value={totalStudents} icon={Users} colorClass="bg-blue-500" onClick={() => setActiveTab('students')} />
         <KPICard title="Total Tutors" value={totalTutors} icon={Briefcase} colorClass="bg-purple-500" onClick={() => setActiveTab('tutors')} />
         <KPICard title="Student Att. Today" value={studentAttToday} icon={UserCheck} colorClass="bg-emerald-500" onClick={() => setActiveTab('student_attendance')} />
         <KPICard title="Tutor Check-In" value={tutorCheckInToday} icon={CheckSquare} colorClass="bg-teal-500" onClick={() => setActiveTab('tutor_attendance')} />
         <KPICard title="Journals (Mo)" value={currentJournals} icon={BookOpen} colorClass="bg-yellow-500" onClick={() => setActiveTab('journals')} />
         <KPICard title="Paid Payroll" value={paidPayrollCount} icon={FileText} colorClass="bg-rose-500" onClick={() => setActiveTab('payroll')} />
      </div>

      {/* Total Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
         <Card className="bg-gradient-to-br from-amber-500/10 to-[#151B26] border-amber-500/20 hover:-translate-y-1 transition-transform cursor-pointer p-5 sm:p-6" onClick={() => setActiveTab('payments')}>
           <div className="flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-amber-500/20 rounded-xl"><DollarSign size={24} className="text-amber-400"/></div>
              <div>
                 <p className="text-xs sm:text-sm text-gray-400 font-medium">Outstanding Revenue</p>
                 <h3 className="text-xl sm:text-2xl font-bold text-white">Rp {totalOutstandingRevenueAmount.toLocaleString('id-ID')}</h3>
                 <p className="text-[10px] sm:text-xs text-amber-500/80 font-medium mt-0.5">Expected - Collected</p>
              </div>
           </div>
         </Card>
         <Card className="bg-gradient-to-br from-blue-500/10 to-[#151B26] border-blue-500/20 hover:-translate-y-1 transition-transform cursor-pointer p-5 sm:p-6" onClick={() => setActiveTab('payments')}>
           <div className="flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-blue-500/20 rounded-xl"><CheckCircle2 size={24} className="text-blue-400"/></div>
              <div>
                 <p className="text-xs sm:text-sm text-gray-400 font-medium">Invoices Paid</p>
                 <h3 className="text-xl sm:text-2xl font-bold text-white">{paidInvoicesCount} Invoices</h3>
              </div>
           </div>
         </Card>
         <Card className="bg-gradient-to-br from-purple-500/10 to-[#151B26] border-purple-500/20 p-5 sm:p-6">
           <div className="flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-purple-500/20 rounded-xl"><Activity size={24} className="text-purple-400"/></div>
              <div>
                 <p className="text-xs sm:text-sm text-gray-400 font-medium">Collection Progress</p>
                 <h3 className="text-xl sm:text-2xl font-bold text-white">{totalStudents > 0 ? Math.round((paidInvoicesCount / totalStudents) * 100) : 0}% Collected</h3>
              </div>
           </div>
         </Card>
      </div>

      {/* Revenue by Session Table & Big Card */}
      <Card className="p-0 overflow-hidden border-[#00D4FF]/20 shadow-lg">
         <div className="p-4 sm:p-5 bg-[#0A0E17] border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><BarChart3 size={20} className="text-[#00D4FF]" /> Revenue by Session <span className="text-[10px] sm:text-xs text-gray-400 ml-1 sm:ml-2 font-medium">({MONTHS[Number(currentMonth)-1]} {currentYear})</span></h3>
         </div>
         <div className="w-full overflow-x-auto custom-scrollbar">
           <table className="w-full text-left text-sm min-w-[600px] whitespace-nowrap">
             <thead className="bg-[#0B0F19] border-b border-gray-800 text-gray-400 uppercase tracking-wider text-[10px] sm:text-[11px] font-bold">
               <tr><th className="p-3 sm:p-4">Session</th><th className="p-3 sm:p-4 text-center">Students</th><th className="p-3 sm:p-4 text-center">Collected (Paid)</th><th className="p-3 sm:p-4 text-center">Outstanding</th><th className="p-3 sm:p-4 text-right">Revenue</th></tr>
             </thead>
             <tbody className="divide-y divide-gray-800">
               {sessionRevenueData.map(row => (
                  <tr key={row.session} className="hover:bg-[#0A0E17] transition-colors">
                    <td className="p-3 sm:p-4 font-bold text-white text-xs sm:text-sm">{row.session}</td>
                    <td className="p-3 sm:p-4 text-center text-gray-300">{row.students}</td>
                    <td className="p-3 sm:p-4 text-center text-emerald-400 font-bold">{row.collected}</td>
                    <td className="p-3 sm:p-4 text-center text-rose-400 font-bold">{row.outstanding}</td>
                    <td className="p-3 sm:p-4 text-right font-black text-[#00D4FF] text-sm sm:text-base">Rp {row.revenue.toLocaleString()}</td>
                  </tr>
               ))}
             </tbody>
           </table>
         </div>
         <div className="bg-gradient-to-r from-[#0A3D91] to-[#051126] p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-center sm:items-center border-t border-[#00D4FF]/30 gap-3 sm:gap-0">
            <div className="text-center sm:text-left w-full sm:w-auto">
               <p className="text-[#00D4FF] font-black tracking-widest uppercase text-xs sm:text-sm md:text-base drop-shadow-md">TOTAL REVENUE ALL SESSIONS</p>
               <p className="text-blue-200/60 text-[10px] sm:text-xs mt-1 font-medium">Accumulated from paid invoices this month</p>
            </div>
            <div className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg text-center sm:text-right w-full sm:w-auto break-words">
               Rp {totalRevenueAmount.toLocaleString()}
            </div>
         </div>
      </Card>

      {/* 2 Columns: Announcements & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
         <Card className="border-t-4 border-t-yellow-400 shadow-lg p-0 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-800 bg-[#151B26]">
               <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><Bell size={18} className="text-yellow-400"/> Recent Announcements</h3>
               <Button variant="ghost" className="text-xs py-2 px-3 min-h-[36px]" onClick={() => setActiveTab('announcements')}>View All</Button>
            </div>
            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 bg-[#151B26]">
               {db.announcements.slice(-3).reverse().map(a => (
                  <div key={a.id} className="p-3 sm:p-4 bg-[#0B0F19] rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                     <h4 className="font-bold text-[#00D4FF] text-sm sm:text-base mb-1">{a.title}</h4>
                     <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">{a.date}</p>
                     <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{a.content}</p>
                  </div>
               ))}
               {db.announcements.length === 0 && <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No announcements.</p>}
            </div>
         </Card>

         <Card className="border-t-4 border-t-emerald-400 shadow-lg p-0 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-800 bg-[#151B26]">
               <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><CalendarIcon size={18} className="text-emerald-400"/> Upcoming Calendar</h3>
               <Button variant="ghost" className="text-xs py-2 px-3 min-h-[36px]" onClick={() => setActiveTab('calendar')}>Full Calendar</Button>
            </div>
            <div className="p-4 sm:p-5 space-y-3 bg-[#151B26]">
               {upcomingCalendar.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 sm:p-4 bg-[#0B0F19] rounded-xl border border-gray-800 border-l-4 border-l-emerald-500 hover:bg-[#0A0E17] transition-colors gap-3">
                     <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base truncate">{c.sessionGroup || c.name}</p>
                        <p className="text-xs text-blue-400 font-medium truncate mt-0.5">{c.tutor}</p>
                        <div className="flex items-center flex-wrap gap-2 mt-1.5 text-[10px] sm:text-xs">
                           <span className="text-emerald-400 font-medium whitespace-nowrap">{new Date(c.date).toLocaleDateString('en-US', {weekday: 'short'})}, {c.date}</span>
                           <span className="text-gray-500 hidden sm:inline whitespace-nowrap">{c.startTime} - {c.endTime}</span>
                           <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded ml-auto">{calculateDaysLeft(c.date, today)}</span>
                        </div>
                     </div>
                  </div>
               ))}
               {upcomingCalendar.length === 0 && <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No upcoming events scheduled.</p>}
            </div>
         </Card>
      </div>
    </div>
  );
};

const TutorDashboard = ({ db, user, setActiveTab, today, isCloudConnected }: any) => {
  const dObj = new Date();
  const currentMonth = String(dObj.getMonth() + 1);
  const currentYear = String(dObj.getFullYear());
  const monthPrefix = `${currentYear}-${currentMonth.padStart(2, '0')}`;

  const mySession = user.teachingSession;
  const activeStudents = db.students.filter(s => s.status === 'Active');
  const myStudents = activeStudents.filter(s => getSessionGroup(s.class) === mySession).length;

  // Helper for Co-Teaching: Memisahkan string "Tutor A & Tutor B" untuk mencocokkan nama
  const isMyClass = (tutorString, myName) => tutorString && tutorString.split(' & ').includes(myName);

  const myClassesToday = db.calendar.filter(c => c.date === today && isMyClass(c.tutor, user.name));
  const todayClassesCount = myClassesToday.length;

  const myUpcomingClasses = db.calendar
      .filter(c => c.date >= today && isMyClass(c.tutor, user.name))
      .sort((a,b) => a.date.localeCompare(b.date))
      .slice(0, 5);

  const hasCheckedIn = db.tutorAttendance.some(a => a.tutorId === user.id && a.date === today && a.status === 'Present');
  const checkInText = hasCheckedIn ? 'Present' : 'Not Checked In';

  const journalsToday = db.journals.filter(j => j.tutorName === user.name && j.date === today).length;
  const pendingJournals = Math.max(0, todayClassesCount - journalsToday);

  const studentsInSessionIds = activeStudents.filter(s => getSessionGroup(s.class) === mySession).map(s => s.id);
  const attThisMonth = db.studentAttendance.filter(a => a.date.startsWith(monthPrefix) && studentsInSessionIds.includes(a.studentId));
  const attPresent = attThisMonth.filter(a => a.status === 'Present').length;
  const attendanceRate = attThisMonth.length > 0 ? Math.round((attPresent / attThisMonth.length) * 100) : 0;

  const assessmentsDone = db.assessments.filter(a => a.month === currentMonth && a.year === currentYear && a.sessionGroup === mySession).length;
  const assessmentsPending = Math.max(0, myStudents - assessmentsDone);

  const classesCompletedMonth = db.calendar.filter(c => isMyClass(c.tutor, user.name) && c.date.startsWith(monthPrefix) && c.date <= today).length;
  // REPLACE THIS SECTION: Mengubah pengali durasi kelas menjadi 1 jam
  const teachingHours = classesCompletedMonth * 1;

  // PERBAIKAN: Hanya tampilkan progress bar untuk kelas yang diajarkan oleh tutor ini saja
  const classProgressData = [mySession].map(session => {
     const studentsInSess = db.students.filter(s => s.status === 'Active' && getSessionGroup(s.class) === session).length;
     const assessed = db.assessments.filter(a => a.sessionGroup === session && a.month === currentMonth && a.year === currentYear).length;
     const pct = studentsInSess > 0 ? Math.round((assessed / studentsInSess) * 100) : 0;
     return { session, pct };
  });

  return (
    <div className="space-y-4 sm:space-y-6 animation-fade-in w-full max-w-full overflow-hidden font-sans">
      <GreetingCard userName={user?.name} isCloudConnected={isCloudConnected} />

      {/* First Row 4 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
         <KPICard title="My Students" value={myStudents} subtext="Total assigned to you" icon={Users} colorClass="bg-blue-500" onClick={() => setActiveTab('students')} />
         <KPICard title="Today's Classes" value={todayClassesCount} subtext="Scheduled today" icon={CalendarIcon} colorClass="bg-purple-500" onClick={() => setActiveTab('calendar')} />
         <KPICard title="Check-in Status" value={checkInText} subtext="Daily attendance" icon={CheckSquare} colorClass={hasCheckedIn ? "bg-emerald-500" : "bg-rose-500"} onClick={() => setActiveTab('tutor_attendance')} />
         <KPICard title="Pending Journals" value={pendingJournals} subtext="Not yet submitted" icon={BookOpen} colorClass={pendingJournals === 0 ? "bg-emerald-500" : "bg-amber-500"} onClick={() => setActiveTab('journals')} />
      </div>

      {/* Second Row 4 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
         <KPICard title="Attendance Rate" value={`${attendanceRate}%`} subtext="Session average" icon={BarChart3} colorClass="bg-teal-500" onClick={() => setActiveTab('student_attendance')} />
         <KPICard title="Assessments Pending" value={assessmentsPending} subtext="Monthly remaining" icon={FileText} colorClass={assessmentsPending === 0 ? "bg-emerald-500" : "bg-rose-500"} onClick={() => setActiveTab('assessments')} />
         <KPICard title="Teaching Hours" value={`${teachingHours}h`} subtext="This month" icon={Clock} colorClass="bg-indigo-500" />
         <KPICard title="Classes Completed" value={classesCompletedMonth} subtext="This month" icon={GraduationCap} colorClass="bg-blue-500" />
      </div>

      {/* 2 Columns: Today's Schedule & Tutor Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
         <Card className="border-t-4 border-t-[#00D4FF] shadow-lg p-0 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-800 bg-[#151B26]">
               <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><CalendarIcon size={18} className="text-[#00D4FF]"/> Next Schedule</h3>
               <Button variant="ghost" className="text-xs py-2 px-3 min-h-[36px]" onClick={() => setActiveTab('calendar')}>Full Calendar</Button>
            </div>
            <div className="p-4 sm:p-5 space-y-3 bg-[#151B26] flex-1">
               {myUpcomingClasses.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-3 sm:p-4 bg-[#0B0F19] rounded-xl border border-gray-800 border-l-4 border-l-[#00D4FF] hover:bg-[#0A0E17] transition-colors gap-3">
                     <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base truncate">{c.sessionGroup || c.name}</p>
                        <div className="flex items-center flex-wrap gap-2 mt-1 sm:mt-1.5 text-[10px] sm:text-xs">
                           <span className="text-[#00D4FF] font-medium whitespace-nowrap">
                             <CalendarIcon size={12} className="inline mr-1" />
                             {new Date(c.date).toLocaleDateString('en-US', {weekday: 'short'})}, {c.date}
                           </span>
                           <span className="text-gray-400 font-medium whitespace-nowrap"><Clock size={12} className="inline mr-1" />{c.startTime} - {c.endTime}</span>
                           <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded ml-auto">{calculateDaysLeft(c.date, today)}</span>
                        </div>
                     </div>
                  </div>
               ))}
               {myUpcomingClasses.length === 0 && <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No upcoming classes scheduled.</p>}
            </div>
         </Card>

         <Card className="border-t-4 border-t-purple-500 shadow-lg p-0 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-800 bg-[#151B26]">
               <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><CheckCircle2 size={18} className="text-purple-400"/> Tutor Tasks</h3>
            </div>
            <div className="p-4 sm:p-5 space-y-4 bg-[#151B26] flex-1 flex flex-col justify-center">
               <Button onClick={() => setActiveTab('journals')} className="w-full justify-start py-4 text-left border border-gray-700 bg-[#0B0F19] hover:bg-[#1A2234] hover:border-purple-500/50 transition-all text-white shadow-md rounded-xl" variant="secondary">
                 <BookOpen size={20} className="text-purple-400 mr-2" />
                 <div className="flex flex-col items-start">
                   <span className="font-bold">Fill Learning Journal</span>
                   <span className="text-xs text-gray-400 font-normal mt-0.5">Record today's teaching materials</span>
                 </div>
               </Button>
               <Button onClick={() => setActiveTab('student_attendance')} className="w-full justify-start py-4 text-left border border-gray-700 bg-[#0B0F19] hover:bg-[#1A2234] hover:border-teal-500/50 transition-all text-white shadow-md rounded-xl" variant="secondary">
                 <UserCheck size={20} className="text-teal-400 mr-2" />
                 <div className="flex flex-col items-start">
                   <span className="font-bold">Complete Attendance</span>
                   <span className="text-xs text-gray-400 font-normal mt-0.5">Mark students' presence</span>
                 </div>
               </Button>
               <Button onClick={() => setActiveTab('assessments')} className="w-full justify-start py-4 text-left border border-gray-700 bg-[#0B0F19] hover:bg-[#1A2234] hover:border-rose-500/50 transition-all text-white shadow-md rounded-xl" variant="secondary">
                 <FileText size={20} className="text-rose-400 mr-2" />
                 <div className="flex flex-col items-start">
                   <span className="font-bold">Submit Assessment</span>
                   <span className="text-xs text-gray-400 font-normal mt-0.5">Input monthly grades</span>
                 </div>
               </Button>
            </div>
         </Card>
      </div>

      {/* Bottom Section: Class Progress & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
         <Card className="border-t-4 border-t-emerald-400 shadow-lg p-0 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-800 bg-[#151B26]">
               <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><BarChart3 size={18} className="text-emerald-400"/> Class Progress</h3>
               <span className="text-xs text-gray-400">Assessments completed</span>
            </div>
            <div className="p-4 sm:p-6 space-y-6 bg-[#151B26] flex-1">
               {classProgressData.map((cls, idx) => {
                 const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                 const color = colors[idx % colors.length];
                 return (
                   <div key={cls.session}>
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-gray-300 font-semibold text-sm">{cls.session.replace('Sesi ', '')}</span>
                         <span className="text-white font-black text-sm leading-none">{cls.pct}%</span>
                      </div>
                      <div className="w-full bg-gray-800/80 rounded-full h-2.5 overflow-hidden shadow-inner">
                         <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${cls.pct}%` }}></div>
                      </div>
                   </div>
                 )
               })}
            </div>
         </Card>

         <Card className="border-t-4 border-t-yellow-400 shadow-lg p-0 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-800 bg-[#151B26]">
               <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><Bell size={18} className="text-yellow-400"/> Recent Announcements</h3>
               <Button variant="ghost" className="text-xs py-2 px-3 min-h-[36px]" onClick={() => setActiveTab('announcements')}>View All</Button>
            </div>
            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 bg-[#151B26] flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
               {db.announcements.slice(-3).reverse().map(a => (
                  <div key={a.id} className="p-3 sm:p-4 bg-[#0B0F19] rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                     <h4 className="font-bold text-[#00D4FF] text-sm sm:text-base mb-1">{a.title}</h4>
                     <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">{a.date}</p>
                     <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{a.content}</p>
                  </div>
               ))}
               {db.announcements.length === 0 && <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No announcements.</p>}
            </div>
         </Card>
      </div>
    </div>
  );
};

const Dashboard = ({ db, user, setActiveTab, isCloudConnected }: any) => {
  const today = getTodayDateLocal();
  if (user.role === 'student') {
    return <StudentDashboard db={db} user={user} setActiveTab={setActiveTab} today={today} isCloudConnected={isCloudConnected} />;
  }
  if (user.role === 'tutor') {
    return <TutorDashboard db={db} user={user} setActiveTab={setActiveTab} today={today} isCloudConnected={isCloudConnected} />;
  }
  return <AdminDashboard db={db} user={user} setActiveTab={setActiveTab} today={today} isCloudConnected={isCloudConnected} />;
};

export default function App() {
  const [db, setDb] = useState({
    users: [], students: [], tutors: [], studentAttendance: [], tutorAttendance: [],
    journals: [], assessments: [], payments: [], payroll: [], calendar: [], announcements: [], recycleBin: []
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  
  // State untuk Cloud Connection
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const prevCloudState = useRef(true);

  // Set browser tab title
  useEffect(() => {
    document.title = "ECG Academic Suite";
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // 1. MUAT DATA LOKAL LEBIH DULU AGAR INSTAN
      const saved = localStorage.getItem('ecg_db');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // PERBAIKAN: Jangan buat ulang DB dummy jika students kosong. Gunakan validasi users.
          if (!parsed.users || !Array.isArray(parsed.users))
            setDb(generateDummyDatabase());
          else setDb(parsed);
        } catch (e) {
          setDb(generateDummyDatabase());
        }
      } else {
        setDb(generateDummyDatabase());
      }
      
      // 2. LANGSUNG AKTIFKAN APLIKASI & TOMBOL LOGIN (Tanpa Menunggu Cloud)
      setIsDbLoaded(true);

      // 3. AMBIL DATA CLOUD DI LATAR BELAKANG SECARA DIAM-DIAM
      try {
        if (GOOGLE_APPS_SCRIPT_URL) {
          const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
          const data = await response.json();
          // PERBAIKAN: Validasi sinkronisasi cloud menggunakan users, bukan students
          if (data && data.users && Array.isArray(data.users)) {
            setDb(data);
            localStorage.setItem('ecg_db', JSON.stringify(data));
            setIsCloudConnected(true);
          }
        }
      } catch (e) {
        console.warn('Koneksi cloud gagal, menggunakan Local Storage', e);
        setIsCloudConnected(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // PERBAIKAN: Simpan perubahan ke local dan cloud asalkan struktur DB valid (ada users),
    // bahkan jika students atau data lainnya 0. Dibungkus dengan isDbLoaded agar tidak menimpa data awal.
    if (isDbLoaded && db && Array.isArray(db.users)) {
      localStorage.setItem('ecg_db', JSON.stringify(db));
      if (GOOGLE_APPS_SCRIPT_URL) {
        fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'sync', payload: db }),
        })
        .then(() => setIsCloudConnected(true))
        .catch((e) => {
           console.warn('GAS Sync failed', e);
           setIsCloudConnected(false);
        });
      }
    }
  }, [db, isDbLoaded]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Effect khusus untuk memunculkan notifikasi perubahan status cloud
  useEffect(() => {
    if (prevCloudState.current !== isCloudConnected) {
      if (isCloudConnected) {
        showToast('Cloud connection restored.', 'success');
      } else {
        showToast('Cloud connection lost. Running in offline mode.', 'warning');
      }
      prevCloudState.current = isCloudConnected;
    }
  }, [isCloudConnected]);

  const requestConfirm = (title, message, onConfirm) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      },
    });
  };

  const softDelete = (collection, id, itemName) => {
    requestConfirm(
      'Confirm Deletion',
      `Are you sure you want to delete ${itemName || 'this record'}? It will be moved to the Recycle Bin.`,
      () => {
        const item = db[collection].find((x) => x.id === id);
        const binItem = {
          binId: `BIN-${Date.now()}`,
          originalCollection: collection,
          deletedAt: new Date().toISOString(),
          data: item,
        };
        setDb((prev) => ({
          ...prev,
          [collection]: prev[collection].filter((x) => x.id !== id),
          recycleBin: [...(prev.recycleBin || []), binItem],
        }));
        showToast('Moved to Recycle Bin', 'warning');
      }
    );
  };

  const generateId = (prefix, collection) => {
    const currentYear = new Date().getFullYear();
    let maxCount = 0;

    const checkId = (idStr) => {
      if (idStr && idStr.startsWith(`${prefix}-${currentYear}-`)) {
        const numStr = idStr.split('-')[2];
        if (numStr) {
           const num = parseInt(numStr, 10);
           if (!isNaN(num) && num > maxCount) maxCount = num;
        }
      }
    };

    // Cari angka terbesar dari koleksi yang aktif
    (db[collection] || []).forEach((item) => checkId(item.id));
    
    // Cari angka terbesar dari recycle bin agar tidak memakai ulang ID yang sudah dihapus
    (db.recycleBin || []).forEach((binItem) => {
      if (binItem.originalCollection === collection && binItem.data) {
         checkId(binItem.data.id);
      }
    });

    const nextNum = (maxCount + 1).toString().padStart(3, '0');
    
    // PERBAIKAN KRITIS: Tambahkan 4 karakter acak (hash) di akhir ID
    // Contoh output: STU-2026-001-A4X9
    // Menjamin keamanan data 100% agar tidak tumpang tindih meskipun data lama dihapus permanen
    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${prefix}-${currentYear}-${nextNum}-${uniqueSuffix}`;
  };

  // LOGIN HANDLER: sekarang bisa login sebagai admin, tutor, maupun siswa (Student)
  const handleLogin = (username, password, rememberMe) => {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    const appUser = db.users.find(
      (u) => u.username === cleanUser && u.password === cleanPass && u.active === 'Active'
    );
    const tutor = db.tutors.find(
      (u) => u.username === cleanUser && u.password === cleanPass && u.status === 'Active'
    );

    if (appUser) {
      if (rememberMe) localStorage.setItem('ecg_remembered_user', JSON.stringify({ username: cleanUser, password: cleanPass }));
      else localStorage.removeItem('ecg_remembered_user');
      setCurrentUser(appUser);
      showToast(`Welcome back, ${appUser.name}`);
      return true;
    } else if (tutor) {
      if (rememberMe) localStorage.setItem('ecg_remembered_user', JSON.stringify({ username: cleanUser, password: cleanPass }));
      else localStorage.removeItem('ecg_remembered_user');
      setCurrentUser({ ...tutor, role: 'tutor' });
      showToast(`Welcome back, ${tutor.name}`);
      return true;
    } else {
      return false;
    }
  };

  const handleLogout = () => {
    setLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setLogoutConfirm(false);
    sonnerToast.success('You have successfully logged out');
  };

  const downloadPNG = async (elementId, filename) => {
    showToast('Generating PNG...', 'success');
    try {
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.body.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }
      const element = document.getElementById(elementId);
      const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = imgData;
      link.click();
      showToast('PNG Downloaded!');
    } catch (err) {
      console.error(err);
      showToast('PNG Generation Failed. Try printing to PDF.', 'error');
    }
  };

  const handleShareImage = async (elementId, filename, text) => {
    showToast('Preparing image for sharing...', 'success');
    try {
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }
      const element = document.getElementById(elementId);
      const canvas = await window.html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `${filename}.png`, { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: filename,
              text: text,
              files: [file]
            });
            showToast('Shared successfully!');
          } catch (err) {
            console.log('Share cancelled or failed.', err);
          }
        } else {
           const imgData = canvas.toDataURL('image/png');
           const link = document.createElement('a');
           link.download = `${filename}.png`;
           link.href = imgData;
           link.click();
           showToast('Image downloaded! (Direct file sharing not supported on this browser)', 'warning');
        }
      });
    } catch (err) {
       console.error(err);
       showToast('Failed to prepare image for sharing.', 'error');
    }
  };

  if (!currentUser) return <LoginScreen onLogin={handleLogin} isDbLoaded={isDbLoaded} />;

  // FORCE PASSWORD CHANGE JIKA DIMINTA
  if (currentUser.mustChangePassword) {
    return <ForcePasswordChangeScreen user={currentUser} db={db} setDb={setDb} setCurrentUser={setCurrentUser} showToast={showToast} />;
  }

  // NAVIGATION: Menambahkan akses menu khusus student
  const NAVIGATION = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'tutor', 'student'] },
    { id: 'announcements', label: 'Announcements', icon: Bell, roles: ['admin', 'student'] },
    { id: 'calendar', label: 'Academic Calendar', icon: CalendarIcon, roles: ['admin', 'tutor', 'student'] },
    { id: 'students', label: 'Students Directory', icon: Users, roles: ['admin', 'tutor'] },
    { id: 'tutors', label: 'Tutors Directory', icon: Briefcase, roles: ['admin'] },
    { id: 'student_attendance', label: 'Student Attendance', icon: UserCheck, roles: ['admin', 'tutor'] },
    { id: 'tutor_attendance', label: 'Tutor Check-In', icon: Activity, roles: ['admin', 'tutor'] },
    { id: 'my_attendance', label: 'My Attendance', icon: UserCheck, roles: ['student'] }, // Khusus Student
    { id: 'journals', label: 'Learning Journals', icon: BookOpen, roles: ['admin', 'tutor'] },
    { id: 'my_journals', label: 'My Learning Journal', icon: BookOpen, roles: ['student'] }, // Khusus Student
    { id: 'assessments', label: 'Monthly Assessment', icon: CheckSquare, roles: ['admin', 'tutor'] },
    { id: 'my_assessments', label: 'My Assessment', icon: Award, roles: ['student'] }, // Khusus Student
// ADD START
    { id: 'my_report', label: 'My Academic Report', icon: FileText, roles: ['student'] }, // Khusus Student
// ADD END
    { id: 'payments', label: 'Payments', icon: DollarSign, roles: ['admin'] },
    { id: 'my_payments', label: 'My Payment Status', icon: DollarSign, roles: ['student'] }, // Khusus Student
    { id: 'payroll', label: 'Payroll', icon: FileText, roles: ['admin'] },
    { id: 'history', label: 'History & Reports', icon: BarChart3, roles: ['admin', 'tutor'] },
    { id: 'settings', label: 'User Management', icon: Settings, roles: ['admin'] },
    { id: 'account_settings', label: 'Account Settings', icon: KeyRound, roles: ['tutor', 'student'] }, // Tutor & Student bisa ganti pass
    { id: 'recycle_bin', label: 'Recycle Bin', icon: ArchiveRestore, roles: ['admin'] },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard db={db} user={currentUser} setActiveTab={setActiveTab} isCloudConnected={isCloudConnected} />;
      case 'students':
        return <StudentsModule db={db} setDb={setDb} generateId={generateId} showToast={showToast} softDelete={softDelete} user={currentUser} />;
      case 'tutors':
        return <TutorsModule db={db} setDb={setDb} generateId={generateId} showToast={showToast} softDelete={softDelete} />;
      case 'student_attendance':
        return <StudentAttendanceModule db={db} setDb={setDb} showToast={showToast} softDelete={softDelete} />;
      case 'tutor_attendance':
        return <TutorAttendanceModule db={db} setDb={setDb} user={currentUser} showToast={showToast} softDelete={softDelete} />;
      case 'my_attendance': // STUDENT: Read Only Attendance
        return <StudentReadOnlyAttendanceModule db={db} user={currentUser} />;
      case 'journals':
        return <JournalsModule db={db} setDb={setDb} user={currentUser} showToast={showToast} generateId={generateId} softDelete={softDelete} />;
      case 'my_journals': // STUDENT: Read Only Journal
        return <StudentReadOnlyJournalsModule db={db} user={currentUser} />;
      case 'assessments':
        return <AssessmentsModule db={db} setDb={setDb} generateId={generateId} showToast={showToast} />;
      case 'my_assessments': // STUDENT: Read Only Assessment
        return <StudentReadOnlyAssessmentModule db={db} user={currentUser} />;
// ADD START
      case 'my_report': // STUDENT: Academic Report
        return <StudentReadOnlyReportModule db={db} user={currentUser} downloadPNG={downloadPNG} handleShareImage={handleShareImage} />;
// ADD END
      case 'payments':
        return (
          <PaymentsModule
            db={db}
            setDb={setDb}
            generateId={generateId}
            showToast={showToast}
            handlePrint={() => window.print()}
            handleShareImage={handleShareImage}
            downloadPNG={downloadPNG}
            softDelete={softDelete}
          />
        );
      case 'my_payments': // STUDENT: Read Only Payments
        return <StudentReadOnlyPaymentModule db={db} user={currentUser} />;
      case 'payroll':
        return (
          <PayrollModule
            db={db}
            setDb={setDb}
            generateId={generateId}
            showToast={showToast}
            handlePrint={() => window.print()}
            handleShareImage={handleShareImage}
            downloadPNG={downloadPNG}
            softDelete={softDelete}
            requestConfirm={requestConfirm}
          />
        );
      case 'calendar':
        return <CalendarModule db={db} setDb={setDb} generateId={generateId} user={currentUser} showToast={showToast} softDelete={softDelete} />;
      case 'announcements':
        return <AnnouncementsModule db={db} setDb={setDb} generateId={generateId} user={currentUser} showToast={showToast} softDelete={softDelete} setActiveTab={setActiveTab} />;
      case 'history':
        return <HistoryReportsModule db={db} setDb={setDb} showToast={showToast} handlePrint={() => window.print()} />;
      case 'settings':
        return <SettingsModule db={db} setDb={setDb} generateId={generateId} user={currentUser} showToast={showToast} requestConfirm={requestConfirm} />;
      case 'account_settings':
        return <AccountSettingsModule db={db} setDb={setDb} user={currentUser} setCurrentUser={setCurrentUser} showToast={showToast} />;
      case 'recycle_bin':
        return <RecycleBinModule db={db} setDb={setDb} showToast={showToast} requestConfirm={requestConfirm} />;
      default:
        return <div className="p-8 text-center text-gray-400">Module under construction</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-[#F3F4F6] font-['Poppins',sans-serif] overflow-hidden selection:bg-[#00D4FF] selection:text-[#0B0F19]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#151B26',
            color: '#F3F4F6',
            border: '1px solid #374151',
          },
        }}
      />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce print:hidden ${
            toast.type === 'error' ? 'bg-red-500' : toast.type === 'warning' ? 'bg-yellow-500 text-[#0B0F19]' : 'bg-[#00D4FF] text-[#0B0F19] font-semibold'
        }`}>
          {toast.type === 'error' ? <XCircle size={20} /> : toast.type === 'warning' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {toast.msg}
        </div>
      )}

      {logoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md print:hidden">
          <div className="bg-[#151B26] border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <LogOut size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Log Out</h3>
            </div>
            <p className="text-gray-400 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setLogoutConfirm(false)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white border-none shadow-none" onClick={confirmLogout}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animation-fade-in print:hidden">
          <div className="bg-[#151B26] border border-gray-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6">
            <h3 className="text-xl font-bold text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-gray-400 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmDialog(null)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white border-none shadow-none" onClick={confirmDialog.onConfirm}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0A0E17] border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 print:hidden flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <img src={LOGO_URL} alt="Logo" className="h-10 w-auto mb-2 opacity-90 drop-shadow-[0_0_8px_rgba(0,212,255,0.3)]" />
            <h1 className="text-xl font-bold text-[#00D4FF] leading-tight">ECG Academic<br />Suite</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {NAVIGATION.filter((nav) => nav.roles.includes(currentUser.role)).map((nav) => (
            <button
              key={nav.id}
              onClick={() => { setActiveTab(nav.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === nav.id ? 'bg-[#151B26] text-[#00D4FF] border-l-2 border-[#00D4FF] shadow-[inset_0_0_15px_rgba(0,212,255,0.05)]' : 'text-gray-400 hover:bg-[#151B26] hover:text-white'
              }`}
            >
              <nav.icon size={20} className={activeTab === nav.id ? 'text-[#00D4FF]' : ''} />
              <span className="font-medium text-sm">{nav.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#0B0F19]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#2563EB] flex items-center justify-center text-white font-bold shadow-lg shadow-[#00D4FF]/20">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-[#00D4FF] uppercase tracking-wider font-semibold">{currentUser.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors" icon={LogOut} onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:w-full print:absolute print:inset-0 print:bg-white print:text-black print:overflow-visible">
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0A0E17] border-b border-gray-800 print:hidden sticky top-0 z-30">
          <h2 className="font-bold text-[#00D4FF] tracking-wide">ECG Academic Suite</h2>
          <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar print:overflow-visible print:p-0">
          
          {/* ADDED: UNIVERSAL BACK TO DASHBOARD BUTTON */}
          {activeTab !== 'dashboard' && (
            <div className="sticky top-[-16px] md:top-[-32px] z-40 bg-[#0B0F19]/95 backdrop-blur-md pt-4 md:pt-8 pb-4 -mt-4 md:-mt-8 mb-6 border-b border-gray-800/80 print:hidden w-full max-w-7xl mx-auto">
              <Button
                variant="secondary"
                onClick={() => setActiveTab('dashboard')}
                icon={ArrowLeft}
                className="w-full md:w-max min-h-[44px] flex items-center justify-center bg-[#151B26] hover:bg-[#1E293B] border border-gray-700 hover:border-[#00D4FF]/60 text-gray-200 hover:text-white transition-all shadow-md rounded-xl px-6 font-semibold tracking-wide"
              >
                Back to Dashboard
              </Button>
            </div>
          )}
          {/* END OF ADDITION */}

          <div className="max-w-7xl mx-auto space-y-6 print:max-w-full print:space-y-0">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function StudentsModule({ db, setDb, generateId, showToast, softDelete, user }) {
  const [formData, setFormData] = useState({ id: '', name: '', gender: 'Male', level: LEVELS[0], class: CLASS_MAPPING[LEVELS[0]][0], status: 'Active', teacherComment: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  useEffect(() => {
    if (!formData.id && formData.level) {
      setFormData(prev => ({ ...prev, class: CLASS_MAPPING[prev.level][0] }));
    }
  }, [formData.level]);

  const handleSave = (e) => {
    e.preventDefault();
    const rec = { ...formData, id: formData.id || generateId('STU', 'students') };
    setDb((prev) => ({ ...prev, students: formData.id ? prev.students.map((s) => (s.id === formData.id ? rec : s)) : [...prev.students, rec] }));
    showToast('Student saved');
    setIsAdding(false);
  };

  const filtered = db.students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = filterLevel ? s.level === filterLevel : true;
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Students Directory</h2>
        {(!user || user.role === 'admin' || user.role === 'tutor') && (
          <Button onClick={() => { setFormData({ id: '', name: '', gender: 'Male', level: LEVELS[0], class: CLASS_MAPPING[LEVELS[0]][0], status: 'Active', teacherComment: '' }); setIsAdding(!isAdding); }} icon={Plus}>Add Student</Button>
        )}
      </div>
      {isAdding && (!user || user.role === 'admin' || user.role === 'tutor') && (
        <Card>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
            <Input label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
            <Input label="Gender" type="select" options={['Male', 'Female']} value={formData.gender} onChange={(v) => setFormData({ ...formData, gender: v })} required />
            <Input label="Level" type="select" options={LEVELS} value={formData.level} onChange={(v) => setFormData({ ...formData, level: v })} required />
            <Input label="Class" type="select" options={CLASS_MAPPING[formData.level] || []} value={formData.class} onChange={(v) => setFormData({ ...formData, class: v })} required />
            <Input label="Status" type="select" options={['Active', 'Inactive']} value={formData.status} onChange={(v) => setFormData({ ...formData, status: v })} />
            <div className="col-span-2 flex justify-center gap-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="p-0 overflow-x-auto">
        <div className="p-4 bg-[#0A0E17] border-b border-gray-800 flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="Search students..." className="flex-1 bg-[#151B26] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00D4FF]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="w-full md:w-64 bg-[#151B26] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00D4FF]" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="">All Levels</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0A0E17] border-b border-gray-800">
            <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Level</th><th className="p-4">Class</th><th className="p-4 text-center">Status</th>{(!user || user.role === 'admin' || user.role === 'tutor') && <th className="p-4 text-center">Actions</th>}</tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 font-mono text-gray-400">{s.id}</td>
                <td className="p-4 text-white font-medium">{s.name}</td>
                <td className="p-4 text-gray-400">{s.level}</td>
                <td className="p-4 text-[#00D4FF]">{s.class}</td>
                <td className="p-4 text-center"><Badge status={s.status} /></td>
                {(!user || user.role === 'admin' || user.role === 'tutor') && (
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button onClick={() => { setFormData(s); setIsAdding(true); const contentEl = document.querySelector('main'); setTimeout(() => { contentEl?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }} className="text-blue-400 p-1"><Edit2 size={16} /></button>
                    {(!user || user.role === 'admin') && (
                      <button onClick={() => softDelete('students', s.id, s.name)} className="text-red-400 p-1"><Trash2 size={16} /></button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function TutorsModule({ db, setDb, generateId, showToast, softDelete }) {
  const [formData, setFormData] = useState({ id: '', name: '', teachingSession: SESSIONS[0], status: 'Active' });
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    const rec = { ...formData, id: formData.id || generateId('TUT', 'tutors') };
    setDb((prev) => ({ ...prev, tutors: formData.id ? prev.tutors.map((s) => (s.id === formData.id ? rec : s)) : [...prev.tutors, rec] }));
    showToast('Tutor saved');
    setIsAdding(false);
  };

  const filtered = db.tutors.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSession = filterSession ? t.teachingSession === filterSession : true;
    return matchSearch && matchSession;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Tutors Directory</h2>
        <Button onClick={() => { setFormData({ id: '', name: '', teachingSession: SESSIONS[0], status: 'Active' }); setIsAdding(!isAdding); }} icon={Plus}>Add Tutor</Button>
      </div>
      {isAdding && (
        <Card>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
            <Input label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
            <Input label="Session Focus" type="select" options={SESSIONS} value={formData.teachingSession} onChange={(v) => setFormData({ ...formData, teachingSession: v })} required />
            <Input label="Status" type="select" options={['Active', 'Inactive']} value={formData.status} onChange={(v) => setFormData({ ...formData, status: v })} />
            <div className="col-span-2 flex justify-center gap-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="p-0 overflow-x-auto">
        <div className="p-4 bg-[#0A0E17] border-b border-gray-800 flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="Search tutors..." className="flex-1 bg-[#151B26] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00D4FF]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select className="w-full md:w-64 bg-[#151B26] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00D4FF]" value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
            <option value="">All Sessions</option>
            {SESSIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0A0E17] border-b border-gray-800">
            <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Session Focus</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 font-mono text-gray-400">{t.id}</td>
                <td className="p-4 text-white font-medium">{t.name}</td>
                <td className="p-4 text-[#00D4FF]">{t.teachingSession}</td>
                <td className="p-4 text-center"><Badge status={t.status} /></td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => { setFormData(t); setIsAdding(true); const contentEl = document.querySelector('main'); setTimeout(() => { contentEl?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }} className="text-blue-400 p-1"><Edit2 size={16} /></button>
                  <button onClick={() => softDelete('tutors', t.id, t.name)} className="text-red-400 p-1"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function StudentAttendanceModule({ db, setDb, showToast, softDelete }) {
  const [date, setDate] = useState(getTodayDateLocal());
  const [sessionGroup, setSessionGroup] = useState(SESSIONS[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  const activeStudents = useMemo(() => db.students.filter((s) => s.status === 'Active'), [db.students]);
  const targetStudents = useMemo(() => activeStudents.filter((s) => getSessionGroup(s.class) === sessionGroup), [activeStudents, sessionGroup]);
  const alreadyMarkedIds = useMemo(() => db.studentAttendance.filter((a) => a.date === date).map((a) => a.studentId), [db.studentAttendance, date]);
  const studentsToMark = useMemo(() => targetStudents.filter((s) => !alreadyMarkedIds.includes(s.id)), [targetStudents, alreadyMarkedIds]);

  useEffect(() => {
    const initial = {};
    studentsToMark.forEach((s) => (initial[s.id] = 'Present'));
    setAttendanceData(initial);
  }, [studentsToMark]);

  const handleSave = () => {
    if (Object.keys(attendanceData).length === 0) return;
    const newRecords = Object.entries(attendanceData).map(([studentId, status]) => {
      const student = activeStudents.find((s) => s.id === studentId);
      return { id: `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`, date, sessionGroup, studentId, studentName: student.name, class: student.class, status };
    });
    setDb((prev) => ({ ...prev, studentAttendance: [...prev.studentAttendance, ...newRecords] }));
    showToast('Attendance Saved');
    setAttendanceData({});
  };

  const saveEdit = (id) => {
    setDb((p) => ({ ...p, studentAttendance: p.studentAttendance.map((a) => a.id === id ? { ...a, status: editStatus } : a) }));
    setEditingId(null);
    showToast('Updated');
  };

  const statusColors = {
    Present: 'accent-green-500',
    Sick: 'accent-yellow-500',
    Excused: 'accent-purple-500',
    Absent: 'accent-red-500',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Student Attendance</h2>
      <Card className="flex gap-4 bg-[#0A0E17]">
        <Input label="Date" type="date" value={date} onChange={setDate} />
        <Input label="Session Group" type="select" options={SESSIONS} value={sessionGroup} onChange={setSessionGroup} />
      </Card>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#151B26] border-b border-gray-800">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4 text-center">Present</th>
              <th className="p-4 text-center">Sick</th>
              <th className="p-4 text-center">Excused</th>
              <th className="p-4 text-center">Absent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {studentsToMark.map((s) => (
              <tr key={s.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 text-white font-medium">{s.name} <span className="text-xs text-gray-500">({s.class})</span></td>
                {['Present', 'Sick', 'Excused', 'Absent'].map((status) => (
                  <td key={status} className="p-4 text-center">
                    <input type="radio" checked={attendanceData[s.id] === status} onChange={() => setAttendanceData((p) => ({ ...p, [s.id]: status }))} className={`w-5 h-5 cursor-pointer ${statusColors[status]}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-[#0A0E17] flex justify-end border-t border-gray-800">
          <Button onClick={handleSave} disabled={studentsToMark.length === 0}>Save Attendance</Button>
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold text-white mb-4">Edit Today's Records</h3>
        <div className="space-y-2">
          {db.studentAttendance.filter((a) => a.date === date && a.sessionGroup === sessionGroup).map((r) => (
            <div key={r.id} className="flex justify-between items-center p-3 bg-[#0B0F19] rounded-lg border border-gray-800">
              <div>
                <p className="text-white text-sm">{r.studentName}</p>
                <p className="text-xs text-gray-500">{r.class}</p>
              </div>
              <div className="flex gap-2 items-center text-center">
                {editingId === r.id ? (
                  <>
                    <select className="bg-[#151B26] border border-gray-700 rounded text-sm text-white p-1" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                      <option>Present</option><option>Sick</option><option>Excused</option><option>Absent</option>
                    </select>
                    <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => saveEdit(r.id)}>Save</Button>
                  </>
                ) : (
                  <>
                    <Badge status={r.status} />
                    <button onClick={() => { setEditingId(r.id); setEditStatus(r.status); }} className="text-blue-400 p-1"><Edit2 size={14} /></button>
                    <button onClick={() => softDelete('studentAttendance', r.id, `Attendance for ${r.studentName}`) } className="text-red-400 p-1"><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TutorAttendanceModule({ db, setDb, user, showToast, softDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  const handleCheckIn = () => {
    const dateObj = new Date();
    // Gunakan waktu lokal agar tidak terjadi lompatan hari zona waktu (UTC issue)
    const today = getTodayDateLocal();
    const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const existingRecords = db.tutorAttendance || [];
    if (existingRecords.find((a) => a.tutorId === user.id && a.date === today)) {
       return showToast('Already checked in today', 'warning');
    }
    
    setDb((prev) => ({ 
      ...prev, 
      tutorAttendance: [
        ...(prev.tutorAttendance || []), 
        { id: `TA-${Date.now()}`, tutorId: user.id, name: user.name, date: today, day, time, status: 'Present' }
      ] 
    }));
    showToast('Checked in successfully');
  };

  const saveEdit = (id) => {
    setDb((p) => ({ ...p, tutorAttendance: p.tutorAttendance.map((a) => a.id === id ? { ...a, status: editStatus } : a) }));
    setEditingId(null);
    showToast('Updated');
  };

  const tutorRecords = db.tutorAttendance || [];
  const displayList = user.role === 'admin' ? tutorRecords.slice().reverse() : tutorRecords.filter((a) => a.tutorId === user.id).slice().reverse();

  return (
    <div className="space-y-6">
      <Card className="text-center py-12">
        <Activity size={48} className="mx-auto text-[#00D4FF] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Tutor Self Check-In</h2>
        <Button onClick={handleCheckIn} className="mx-auto py-3 px-8 mt-4 text-lg">Check In Now</Button>
      </Card>

      <Card className="p-0 overflow-x-auto">
        <div className="p-4 bg-[#0A0E17] border-b border-gray-800"><h3 className="font-semibold text-white">{user.role === 'admin' ? 'All Tutors History' : 'My Check-In History'}</h3></div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0B0F19] border-b border-gray-800">
            <tr><th className="p-4 text-center">Date</th><th className="p-4 text-center">Day</th><th className="p-4 text-center">Time</th>{user.role === 'admin' && <th className="p-4 text-center">Tutor</th>}<th className="p-4 text-center">Status</th><th className="p-4 text-center">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {displayList.map((a) => (
              <tr key={a.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 text-center">{a.date}</td>
                <td className="p-4 text-center">{a.day || '-'}</td>
                <td className="p-4 text-center">{a.time || '-'}</td>
                {user.role === 'admin' && <td className="p-4 text-center text-white">{a.name}</td>}
                <td className="p-4 text-center">
                  {editingId === a.id ? (
                    <select className="bg-[#151B26] border border-gray-700 rounded text-sm text-white p-1" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                      <option>Present</option><option>Sick</option><option>Excused</option><option>Absent</option>
                    </select>
                  ) : <Badge status={a.status} />}
                </td>
                <td className="p-4 text-center flex justify-center gap-2">
                  {editingId === a.id ? (
                    <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => saveEdit(a.id)}>Save</Button>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(a.id); setEditStatus(a.status); }} className="text-blue-400 p-1"><Edit2 size={16} /></button>
                      <button onClick={() => softDelete('tutorAttendance', a.id, 'Tutor Attendance') } className="text-red-400 p-1"><Trash2 size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AssessmentsModule({ db, setDb, generateId, showToast }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [sessionGroup, setSessionGroup] = useState(SESSIONS[0]);
  const [tableData, setTableData] = useState({});
  const [materialFilterSession, setMaterialFilterSession] = useState('All');

  const activeStudents = useMemo(() => db.students.filter((s) => s.status === 'Active'), [db.students]);
  const targetStudents = useMemo(() => activeStudents.filter((s) => getSessionGroup(s.class) === sessionGroup), [activeStudents, sessionGroup]);

  const subjects = useMemo(() => {
    return sessionGroup === SESSIONS[0]
      ? ['Membaca', 'Menulis', 'Berhitung', 'Bahasa Inggris']
      : ['Speaking', 'Writing', 'Reading', 'Listening'];
  }, [sessionGroup]);

  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const allMeetingsThisMonth = useMemo(() => {
    return db.journals.filter(j => j.date.startsWith(monthPrefix)).sort((a, b) => a.date.localeCompare(b.date));
  }, [db.journals, monthPrefix]);

  const filteredMeetings = useMemo(() => {
    if (materialFilterSession === 'All') return allMeetingsThisMonth;
    return allMeetingsThisMonth.filter(j => j.sessionGroup === materialFilterSession);
  }, [allMeetingsThisMonth, materialFilterSession]);

  useEffect(() => {
    const initialData = {};
    targetStudents.forEach((student) => {
      const existing = db.assessments.find((a) => a.studentId === student.id && a.month == month && a.year == year);
      if (existing && existing.scores) {
        initialData[student.id] = { ...existing.scores };
      } else {
        initialData[student.id] = {};
        subjects.forEach((sub) => (initialData[student.id][sub] = ''));
      }
    });
    setTableData(initialData);
  }, [month, year, sessionGroup, targetStudents, db.assessments, subjects]);

  const handleScoreChange = (studentId, field, val) => {
    let num = val === '' ? '' : parseInt(val, 10);
    if (num !== '' && Number.isNaN(num as number)) return;
    if (num > 100) num = 100;
    if (num < 0) num = 0;
    setTableData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: num } }));
  };

  const handleSaveAll = () => {
    let newAssessments = [...db.assessments];
    let updatedCount = 0;

    targetStudents.forEach((student) => {
      const studentScores = tableData[student.id];
      if (!studentScores) return;

      const hasScores = subjects.some((sub) => studentScores[sub] !== '' && studentScores[sub] !== undefined);
      if (!hasScores) return;

      let total = 0, count = 0;
      subjects.forEach((sub) => {
        if (studentScores[sub] !== '' && studentScores[sub] !== undefined) {
          total += Number(studentScores[sub]);
          count++;
        }
      });
      const average = count > 0 ? Math.round(total / count) : 0;
      const grade = average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : 'D';

      const existingIdx = newAssessments.findIndex((a) => a.studentId === student.id && a.month == month && a.year == year);

      const cleanedScores = {};
      subjects.forEach((sub) => cleanedScores[sub] = studentScores[sub] === '' ? '' : Number(studentScores[sub]));

      const assessmentRecord = {
        id: existingIdx >= 0 ? newAssessments[existingIdx].id : generateId('ASS', 'assessments'),
        studentId: student.id, studentName: student.name, level: student.level, class: student.class, month: String(month), year: String(year), sessionGroup: sessionGroup, scores: cleanedScores, average, grade,
      };

      if (existingIdx >= 0) newAssessments[existingIdx] = assessmentRecord;
      else newAssessments.push(assessmentRecord);
      updatedCount++;
    });

    if (updatedCount > 0) {
      setDb((prev) => ({ ...prev, assessments: newAssessments }));
      showToast(`Assessment saved successfully for ${updatedCount} students.`);
    } else {
      showToast('No scores entered to save.', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-white mb-1">Monthly Assessment</h2><p className="text-gray-400 text-sm">Spreadsheet-style mass grading. Select a period to grade or edit existing records.</p></div>
      <div className="flex flex-col md:flex-row gap-4 items-end bg-[#0A0E17] p-4 rounded-xl border border-gray-800 shadow-sm">
        <Input label="Month" type="select" options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))} value={month} onChange={setMonth} className="mb-0" />
        <Input label="Year" type="number" value={year} onChange={setYear} className="mb-0" />
        <Input label="Session" type="select" options={SESSIONS} value={sessionGroup} onChange={setSessionGroup} className="mb-0" />
      </div>

      <div className="bg-[#151B26] border border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-800 bg-[#0A0E17] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-white font-bold text-sm">Learning Materials (From Journals)</h3>
          <select
            className="bg-[#0B0F19] border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]"
            value={materialFilterSession}
            onChange={e => setMaterialFilterSession(e.target.value)}
          >
            <option value="All">All Sessions</option>
            {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="p-4 max-h-48 overflow-y-auto custom-scrollbar bg-[#0B0F19]">
          {filteredMeetings.length > 0 ? (
            <ul className="space-y-3">
              {filteredMeetings.map((m) => (
                <li key={m.id} className="text-sm bg-[#151B26] p-3 rounded-lg border border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#00D4FF] font-medium">{m.sessionGroup}</span>
                    <span className="text-gray-500 text-xs">{new Date(m.date).toLocaleDateString('en-GB')}</span>
                  </div>
                  <span className="text-gray-300 font-medium">Topic: </span><span className="text-white">{m.topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">No materials recorded in Learning Journals for this month.</p>
          )}
        </div>
      </div>

      <div className="bg-[#151B26] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-[#0A0E17] flex justify-between items-center"><h3 className="text-white font-bold">Grading Table: {sessionGroup}</h3><span className="text-gray-400 text-sm font-medium">{MONTHS[month - 1]} {year}</span></div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-[#0B0F19] border-b border-gray-800 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-gray-400 font-medium text-sm whitespace-nowrap">Student Name</th>
                <th className="py-3 px-4 text-gray-400 font-medium text-sm whitespace-nowrap">Class</th>
                {subjects.map((s) => <th key={s} className="py-3 px-4 text-gray-400 font-medium text-sm text-center w-[100px]">{s}</th>)}
                <th className="py-3 px-4 text-gray-400 font-medium text-sm text-center w-[80px]">Avg</th>
                <th className="py-3 px-4 text-gray-400 font-medium text-sm text-center w-[80px]">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-[#151B26]">
              {targetStudents.map((student) => {
                const studentScores = tableData[student.id] || {};
                let total = 0, count = 0;
                subjects.forEach((sub) => { if (studentScores[sub] !== '' && studentScores[sub] !== undefined) { total += Number(studentScores[sub]); count++; } });
                const avg = count > 0 ? Math.round(total / count) : '-';
                const grade = avg === '-' ? '-' : avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : 'D';

                return (
                  <tr key={student.id} className="hover:bg-[#0B0F19] transition-colors" style={{ height: '50px' }}>
                    <td className="py-1 px-4 text-white font-medium whitespace-nowrap">{student.name}</td>
                    <td className="py-1 px-4 text-gray-400 text-xs whitespace-nowrap">{student.class}</td>
                    {subjects.map((sub) => (
                      <td key={sub} className="py-1 px-4 text-center">
                        <input type="number" min="0" max="100" placeholder="0-100" className="w-[80px] h-8 text-center bg-[#0B0F19] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all" value={studentScores[sub] !== undefined ? studentScores[sub] : ''} onChange={(e) => handleScoreChange(student.id, sub, e.target.value)} />
                      </td>
                    ))}
                    <td className="py-1 px-4 text-center font-bold text-[#00D4FF]">{avg}</td>
                    <td className="py-1 px-4 text-center font-bold text-gray-300">{grade}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[#0A0E17] border-t border-gray-800">
          <Button onClick={handleSaveAll} className="w-full py-4 text-lg font-bold shadow-[0_0_20px_rgba(0,212,255,0.2)]" disabled={targetStudents.length === 0}>SAVE ALL ASSESSMENTS</Button>
        </div>
      </div>
    </div>
  );
}

function PaymentsModule({ db, setDb, generateId, showToast, handlePrint, handleShareImage, downloadPNG, softDelete }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [sessionGroup, setSessionGroup] = useState('All Sessions');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [editData, setEditData] = useState({ id: null, amount: '', method: '' });

  const activeStudents = useMemo(() => db.students.filter((s) => s.status === 'Active'), [db.students]);
  const targetStudents = useMemo(() => {
    if (sessionGroup === 'All Sessions') return activeStudents;
    return activeStudents.filter((s) => getSessionGroup(s.class) === sessionGroup);
  }, [activeStudents, sessionGroup]);

  const totalRevenue = useMemo(() => {
    const validStudentIds = new Set(targetStudents.map(s => s.id));
    return db.payments
      .filter(p => p.month === String(month) && p.year === String(year) && p.status === 'Paid' && validStudentIds.has(p.studentId))
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }, [db.payments, month, year, targetStudents]);

  const handleRecordInline = (student) => {
    const amt = amounts[student.id];
    if (!amt || amt <= 0) return showToast('Enter valid amount', 'error');
    const sSession = getSessionGroup(student.class);
    const rec = { id: generateId('INV', 'payments'), studentId: student.id, studentName: student.name, level: student.level, class: student.class, sessionGroup: sSession, amount: amt, month: String(month), year: String(year), date: getTodayDateLocal(), method: 'Transfer', status: 'Paid' };
    setDb((p) => ({ ...p, payments: [...p.payments, rec] }));
    showToast(`Payment recorded`);
    setAmounts((p) => ({ ...p, [student.id]: '' }));
  };

  const saveEdit = () => {
    setDb((p) => ({ ...p, payments: p.payments.map((x) => x.id === editData.id ? { ...x, amount: editData.amount, method: editData.method } : x) }));
    setEditData({ id: null, amount: '', method: '' });
    showToast('Updated');
  };

  const localPrintPayment = () => {
    if (!selectedInvoice) return;
    const originalTitle = document.title;
    const safeName = selectedInvoice.studentName.replace(/\s+/g, '_');
    document.title = `${safeName}_payment`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  if (selectedInvoice) return (
    <div className="fixed inset-0 z-[100] bg-slate-50/95 backdrop-blur-md overflow-y-auto print:bg-white print:static print:block print:z-auto custom-scrollbar font-sans text-slate-900">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-gradient-to-b from-blue-200/40 to-transparent blur-3xl pointer-events-none print:hidden" />
      
      <div className="w-full max-w-2xl mx-auto mt-6 mb-4 px-4 flex justify-between items-center relative z-10 print:hidden">
        <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm bg-white/50 px-4 py-2 rounded-full border border-slate-200/50 shadow-sm" onClick={() => setSelectedInvoice(null)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={localPrintPayment} className="p-2.5 bg-white rounded-full text-blue-600 shadow-sm border border-slate-200/50 hover:bg-blue-50 transition-colors" title="Print PDF"><Printer size={16}/></button>
          <button onClick={() => {
             const safeName = selectedInvoice.studentName.replace(/\s+/g, '_');
             downloadPNG('receipt-print', `${safeName}_payment`);
          }} className="p-2.5 bg-white rounded-full text-blue-600 shadow-sm border border-slate-200/50 hover:bg-blue-50 transition-colors" title="Download PNG"><Download size={16}/></button>
          <button onClick={() => {
             const safeName = selectedInvoice.studentName.replace(/\s+/g, '_');
             handleShareImage('receipt-print', `${safeName}_payment`, `Receipt for ${selectedInvoice.studentName}`);
          }} className="p-2.5 bg-white rounded-full text-blue-600 shadow-sm border border-slate-200/50 hover:bg-blue-50 transition-colors" title="Share"><Share2 size={16}/></button>
        </div>
      </div>

      <div id="receipt-print" className="w-full max-w-2xl mx-auto bg-white rounded-none shadow-2xl overflow-hidden relative z-10 mb-12 print:m-0 print:shadow-none print:max-w-full print:rounded-none">
        <div className="bg-[#1A56DB] text-white p-6 sm:p-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">PAYMENT RECEIPT</h1>
            <p className="text-blue-200 font-mono mt-1 text-sm">{selectedInvoice.id}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white leading-tight">English Club Gresik</p>
            <p className="text-blue-200 text-xs mt-1">Academic Suite</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 pb-4">
          <div className="text-center mb-8 border-b border-slate-200 pb-8">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tuition Fee {MONTHS[parseInt(selectedInvoice.month) - 1]} {selectedInvoice.year}
            </p>
            <p className="text-5xl font-black text-slate-900 tracking-tight">
              Rp {Number(selectedInvoice.amount).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-[10px] text-[#1A56DB] font-bold uppercase tracking-wider mb-2 px-2">STUDENT INFO</p>
            <div className="bg-slate-50 border border-slate-200 p-5 shadow-sm">
              <p className="text-xl font-bold text-slate-800">{selectedInvoice.studentName}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{selectedInvoice.class} · {selectedInvoice.sessionGroup}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] text-[#1A56DB] font-bold uppercase tracking-wider mb-2 px-2">TRANSACTION DETAILS</p>
            <div className="space-y-0 text-sm">
              <div className="flex justify-between items-center border-b border-slate-100 py-3 px-2">
                <span className="font-medium text-slate-600">Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedInvoice.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 py-3 px-2">
                <span className="font-medium text-slate-600">Method</span>
                <span className="font-semibold text-slate-800">{selectedInvoice.method}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 py-3 px-2">
                <span className="font-medium text-slate-600">Receipt No.</span>
                <span className="font-mono font-semibold text-slate-800">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-2">
                <span className="font-medium text-slate-600">Status</span>
                <span className="text-lg font-black text-green-700">PAID</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 mb-4">
            <p className="text-sm font-medium text-slate-600 italic">Thank you for your payment.</p>
            <p className="text-xs font-bold text-slate-500 mt-1">— Akhmad Akmal Rifqi</p>
          </div>
        </div>

        <div className="bg-[#1A56DB] p-6 sm:p-8 text-center">
          <p className="text-xs text-blue-100 font-medium mb-1">English Club Gresik • WA: 0897-327-11-12</p>
          <p className="text-[10px] text-blue-200 mb-3">Taman Anggrek Blok AB 05, Kedanyang, Kebomas, Gresik</p>
          <div className="border-t border-blue-400/30 pt-3">
            <p className="text-[10px] text-blue-200">
              This document serves as an official payment receipt
            </p>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Payment Management</h2>
      <div className="bg-[#0A0E17] p-4 rounded-xl border border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-end flex-1 w-full">
          <Input label="Month" type="select" options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))} value={month} onChange={setMonth} className="mb-0" />
          <Input label="Year" type="number" value={year} onChange={setYear} className="mb-0" />
          <Input label="Session Filter" type="select" options={['All Sessions', ...SESSIONS]} value={sessionGroup} onChange={setSessionGroup} className="mb-0" />
        </div>
        <div className="bg-gradient-to-br from-[#00D4FF]/20 to-[#2563EB]/20 border border-[#00D4FF]/30 px-6 py-3 rounded-lg text-center min-w-[200px] w-full md:w-auto">
          <p className="text-xs text-[#00D4FF] font-bold uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-white">Rp {totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0B0F19] text-gray-400 border-b border-gray-800">
            <tr><th className="p-4 text-center">Student</th><th className="p-4 text-center">Class / Session</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Amount / Edit</th><th className="p-4 text-center">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {targetStudents.map((s) => {
              const paidRec = db.payments.find((p) => p.studentId === s.id && p.month === String(month) && p.year === String(year));
              return (
                <tr key={s.id} className="hover:bg-[#0B0F19]">
                  <td className="p-4 text-center text-white font-medium">{s.name}</td>
                  <td className="p-4 text-center text-gray-400">
                    <p>{s.class}</p>
                    {sessionGroup === 'All Sessions' && <p className="text-[10px] text-[#00D4FF] mt-0.5">{getSessionGroup(s.class)}</p>}
                  </td>
                  <td className="p-4 text-center">{paidRec ? <Badge status="Paid" /> : <Badge status="Unpaid" />}</td>
                  <td className="p-4 text-center flex justify-center items-center h-full pt-4">
                    {editData.id === paidRec?.id ? (
                      <div className="flex gap-2">
                        <input type="number" className="w-24 bg-[#151B26] border border-gray-700 rounded px-2 py-1 text-white text-xs" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} />
                        <select className="w-24 bg-[#151B26] border border-gray-700 rounded px-2 py-1 text-white text-xs" value={editData.method} onChange={(e) => setEditData({ ...editData, method: e.target.value })}><option>Transfer</option><option>Cash</option></select>
                        <Button variant="secondary" className="px-2 py-1 text-xs" onClick={saveEdit}>Save</Button>
                      </div>
                    ) : paidRec ? (
                      <span className="font-bold text-green-400">Rp {Number(paidRec.amount).toLocaleString()}</span>
                    ) : (
                      <input type="number" className="w-32 bg-[#151B26] border border-gray-700 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#00D4FF]" placeholder="e.g. 150000" value={amounts[s.id] || ''} onChange={(e) => setAmounts((p) => ({ ...p, [s.id]: e.target.value }))} />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2 items-center">
                      {paidRec ? (
                        <>
                          <Button variant="ghost" className="text-xs px-3 py-1 h-8" onClick={() => setSelectedInvoice(paidRec)}><Eye size={14} /></Button>
                          <button onClick={() => setEditData({ id: paidRec.id, amount: paidRec.amount, method: paidRec.method })} className="text-blue-400 p-1"><Edit2 size={16} /></button>
                          <button onClick={() => softDelete('payments', paidRec.id, 'Payment')} className="text-red-400 p-1"><Trash2 size={16} /></button>
                        </>
                      ) : <Button onClick={() => handleRecordInline(s)} className="text-xs px-4 py-1.5 h-8">Record</Button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PayrollModule({ db, setDb, generateId, showToast, handlePrint, handleShareImage, downloadPNG, softDelete, requestConfirm }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingId, setIsEditingId] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const initialForm = { tutorId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), baseSalary: '', totalMeetings: 0, otherAllowances: 0, bonus: 0 };
  const [formData, setFormData] = useState(initialForm);
  const activeTutors = db.tutors.filter((t) => t.status === 'Active');

  const base = Number(formData.baseSalary) || 0;
  const meetings = Number(formData.totalMeetings) || 0;
  const allowances = Number(formData.otherAllowances) || 0;
  const bonus = Number(formData.bonus) || 0;
  const basicSalary = base * meetings;
  const totalPayroll = basicSalary + allowances + bonus;

  useEffect(() => {
    if (formData.tutorId && formData.month && formData.year && !isEditingId) {
      const monthStr = String(formData.month).padStart(2, '0');
      const searchPrefix = `${formData.year}-${monthStr}`;
      const attendanceCount = db.tutorAttendance.filter((a) => a.tutorId === formData.tutorId && a.date.startsWith(searchPrefix) && a.status === 'Present').length;
      setFormData((prev) => ({ ...prev, totalMeetings: attendanceCount }));
    }
  }, [formData.tutorId, formData.month, formData.year, db.tutorAttendance, isEditingId]);

  const savePayrollRecord = (targetStatus) => {
    if (!formData.tutorId || base <= 0) return showToast('Tutor and Base Salary required.', 'error');
    const proceed = () => {
      const tutor = db.tutors.find((t) => t.id === formData.tutorId);
      const payrollRecord = { id: isEditingId ? isEditingId : generateId('PRL', 'payroll'), tutorId: tutor.id, tutorName: tutor.name, month: String(formData.month), year: String(formData.year), baseSalary: base, totalMeetings: meetings, basicSalary: basicSalary, otherAllowances: allowances, bonus: bonus, totalPaid: totalPayroll, status: targetStatus, date: getTodayDateLocal() };
      setDb((prev) => ({ ...prev, payroll: isEditingId ? prev.payroll.map((p) => (p.id === isEditingId ? payrollRecord : p)) : [...prev.payroll, payrollRecord] }));
      showToast(targetStatus === 'Paid' ? 'Payroll marked as Paid!' : 'Draft Saved!');
      setIsAdding(false); setIsEditingId(null); setFormData(initialForm);
    };
    if (targetStatus === 'Paid') requestConfirm('Mark as Paid', 'Are you sure this payroll has been paid? It will be locked and slip generation will be enabled.', proceed);
    else proceed();
  };

  const handleEdit = (record) => {
    const editSetup = () => { setFormData({ tutorId: record.tutorId, month: record.month, year: record.year, baseSalary: record.baseSalary, totalMeetings: record.totalMeetings, otherAllowances: record.otherAllowances, bonus: record.bonus }); setIsEditingId(record.id); setIsAdding(true); const contentEl = document.querySelector('main'); setTimeout(() => { contentEl?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); };
    if (record.status === 'Paid') requestConfirm('Warning', 'Editing a paid payroll will return it to Draft status. Continue?', editSetup);
    else editSetup();
  };

  const localPrintPayroll = () => {
    if (!selectedSlip) return;
    const originalTitle = document.title;
    const safeTutorName = selectedSlip.tutorName.replace(/\s+/g, '_');
    document.title = `${safeTutorName}_payroll`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  if (selectedSlip) {
    const slipMonthName = MONTHS[parseInt(selectedSlip.month) - 1];
    const safeTutorName = selectedSlip.tutorName.replace(/\s+/g, '_');

    return (
      <div className="space-y-6 font-sans">
        <div className="mb-4 print:hidden"><Button variant="ghost" onClick={() => setSelectedSlip(null)} icon={ArrowLeft}>Back to Payroll</Button></div>
        <div className="flex gap-4 mb-4 justify-center print:hidden">
          <Button onClick={localPrintPayroll} icon={Printer}>PDF</Button>
          <Button onClick={() => downloadPNG('slip-print', `${safeTutorName}_payroll`)}>PNG</Button>
          <Button onClick={() => handleShareImage('slip-print', `${safeTutorName}_payroll`, `Here is the payroll slip for ${selectedSlip.tutorName}`)} icon={Share2} variant="secondary">Share</Button>
        </div>
        
        <Card className="max-w-2xl mx-auto bg-white p-0 overflow-hidden shadow-2xl print:shadow-none print:border-none print:max-w-full" id="slip-print">
          <div className="bg-[#0ea5e9] text-white p-6 sm:p-8 flex justify-between items-start">
             <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">PAYROLL SLIP</h1>
                <p className="text-blue-100 font-mono mt-1 text-sm">{selectedSlip.id}</p>
             </div>
             <div className="text-right">
                <p className="text-lg font-bold text-white leading-tight">English Club Gresik</p>
                <p className="text-blue-100 text-xs mt-1">Academic Suite</p>
             </div>
          </div>

          <div className="p-6 sm:p-8 pb-4">
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex justify-between items-center mb-6 shadow-sm">
                <div>
                   <p className="text-[10px] text-[#0369a1] font-bold uppercase tracking-wider mb-1">Tutor</p>
                   <p className="font-bold text-xl text-slate-800">{selectedSlip.tutorName}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                   <p className="text-[10px] text-[#0369a1] font-bold uppercase tracking-wider mb-1">Period</p>
                   <p className="font-semibold text-slate-800 mb-1">{slipMonthName} {selectedSlip.year}</p>
                   <div className="mt-1 flex flex-col items-end text-[#16a34a]">
                      <span className="font-bold text-sm leading-none mb-0.5">PAID</span>
                      <span className="text-[10px] font-normal leading-none">{selectedSlip.date}</span>
                   </div>
                </div>
             </div>

             <div className="mb-6">
                <p className="text-[10px] text-[#0369a1] font-bold uppercase tracking-wider mb-2 px-2">Payment Details</p>
                <div className="space-y-0 text-sm">
                   <div className="flex justify-between items-center border-b border-slate-100 py-2 px-2">
                      <div>
                         <p className="font-medium text-slate-800">Base Salary</p>
                         <p className="text-xs text-slate-500">Rp {Number(selectedSlip.baseSalary).toLocaleString('id-ID')} × {selectedSlip.totalMeetings} meetings</p>
                      </div>
                      <p className="font-mono font-medium text-slate-800">Rp {Number(selectedSlip.basicSalary).toLocaleString('id-ID')}</p>
                   </div>
                   {Number(selectedSlip.otherAllowances) > 0 && (
                      <div className="flex justify-between items-center border-b border-slate-100 py-2 px-2">
                         <p className="font-medium text-slate-800">Reimbursement (Allowances)</p>
                         <p className="font-mono font-medium text-slate-800">Rp {Number(selectedSlip.otherAllowances).toLocaleString('id-ID')}</p>
                      </div>
                   )}
                   {Number(selectedSlip.bonus) > 0 && (
                      <div className="flex justify-between items-center border-b border-slate-100 py-2 px-2">
                         <p className="font-medium text-slate-800">Bonus</p>
                         <p className="font-mono font-medium text-slate-800">Rp {Number(selectedSlip.bonus).toLocaleString('id-ID')}</p>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="bg-[#38bdf8] px-6 sm:px-8 py-4 flex justify-between items-center">
             <span className="font-bold text-[#ffffff] text-lg tracking-wide">TOTAL PAYROLL</span>
             <span className="font-bold text-[#ffffff] text-2xl tracking-tight">Rp {Number(selectedSlip.totalPaid).toLocaleString('id-ID')}</span>
          </div>

          <div className="p-6 sm:p-8 pt-6 flex justify-between items-end bg-white break-inside-avoid signature-section">
             <div className="text-xs font-medium text-slate-400 italic">"Makin Jago Berbahasa Inggris!"</div>
             <div className="text-center w-40">
                <p className="text-xs text-slate-500 mb-8">Acknowledged by,</p>
                <p className="font-bold text-slate-800 border-b border-slate-300 pb-1 mb-1 text-sm">Akhmad Akmal Rifqi</p>
                <p className="text-[10px] text-[#1e3a8a] font-bold uppercase tracking-widest">English Club Gresik</p>
             </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Payroll Workflow</h2>
        <Button onClick={() => { setIsAdding(!isAdding); setIsEditingId(null); setFormData(initialForm); }} icon={Plus}>Create Payroll</Button>
      </div>
      {isAdding && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-2 border-[#00D4FF]/30 border shadow-[0_0_20px_rgba(0,212,255,0.1)]">
            <h3 className="text-lg font-semibold mb-6 text-white">{isEditingId ? 'Edit Payroll' : 'New Calculation'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Input label="Select Tutor *" type="select" options={activeTutors.map((t) => ({ value: t.id, label: t.name }))} value={formData.tutorId} onChange={(v) => setFormData({ ...formData, tutorId: v })} required /></div>
              <Input label="Month" type="select" options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))} value={formData.month} onChange={(v) => setFormData({ ...formData, month: v })} required />
              <Input label="Year" type="number" value={formData.year} onChange={(v) => setFormData({ ...formData, year: v })} required />
              <Input label="Base Salary Per Meeting" type="number" value={formData.baseSalary} onChange={(v) => setFormData({ ...formData, baseSalary: v })} required />
              <Input label="Total Meetings (Auto/Manual)" type="number" value={formData.totalMeetings} onChange={(v) => setFormData({ ...formData, totalMeetings: v })} required />
              <Input label="Reimbursement (Allowances)" type="number" value={formData.otherAllowances} onChange={(v) => setFormData({ ...formData, otherAllowances: v }) } />
              <Input label="Bonus" type="number" value={formData.bonus} onChange={(v) => setFormData({ ...formData, bonus: v })} />
            </div>
            <div className="mt-4 p-4 bg-[#0B0F19] rounded-lg border border-gray-800 flex justify-between items-center"><span className="text-gray-400">Total Calculation Preview:</span><span className="text-2xl font-bold text-[#00D4FF]">Rp {totalPayroll.toLocaleString()}</span></div>
            <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-800"><Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button><Button variant="secondary" onClick={() => savePayrollRecord('Draft')}>Save Draft</Button><Button className="bg-green-500 text-white hover:bg-green-600 border-none" onClick={() => savePayrollRecord('Paid')}>Mark as Paid</Button></div>
          </Card>
        </div>
      )}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0A0E17] border-b border-gray-800">
            <tr><th className="p-4 text-center">Slip ID</th><th className="p-4 text-center">Tutor</th><th className="p-4 text-center">Period</th><th className="p-4 text-center">Total Paid</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {db.payroll.slice().reverse().map((p) => (
              <tr key={p.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 text-center font-mono text-gray-400">{p.id}</td>
                <td className="p-4 text-center text-white font-medium">{p.tutorName}</td>
                <td className="p-4 text-center">{MONTHS[parseInt(p.month) - 1]} {p.year}</td>
                <td className="p-4 text-center font-medium text-[#00D4FF]">Rp {Number(p.totalPaid).toLocaleString()}</td>
                <td className="p-4 text-center"><Badge status={p.status} /></td>
                <td className="p-4 text-center flex justify-center gap-2">
                  {p.status === 'Paid' && <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => setSelectedSlip(p)}><FileText size={16} /></Button>}
                  <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-400"><Edit2 size={16} /></button>
                  <button onClick={() => softDelete('payroll', p.id, 'Payroll Record') } className="p-1.5 text-red-400"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function JournalsModule({ db, setDb, user, showToast, generateId, softDelete }) {
  const [formData, setFormData] = useState({ date: getTodayDateLocal(), sessionGroup: SESSIONS[0], topic: '', activities: '', notes: '', followUp: '' });
  const [isEditingId, setIsEditingId] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditingId) {
      setDb((prev) => ({ ...prev, journals: prev.journals.map((j) => j.id === isEditingId ? { ...formData, id: isEditingId, tutorName: j.tutorName } : j ) }));
      showToast('Journal updated'); setIsEditingId(null);
    } else {
      setDb((prev) => ({ ...prev, journals: [ ...prev.journals, { id: generateId('JRN', 'journals'), ...formData, tutorName: user.name } ] }));
      showToast('Journal saved');
    }
    setFormData({ date: getTodayDateLocal(), sessionGroup: SESSIONS[0], topic: '', activities: '', notes: '', followUp: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border-[#00D4FF]/20 border shadow-[0_0_20px_rgba(0,212,255,0.05)]">
        <h3 className="font-semibold text-white mb-4">{isEditingId ? 'Edit' : 'New'} Entry</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Date" type="date" value={formData.date} onChange={(v) => setFormData({ ...formData, date: v })} required />
          <Input label="Session" type="select" options={SESSIONS} value={formData.sessionGroup} onChange={(v) => setFormData({ ...formData, sessionGroup: v })} required />
          <Input label="Learning Material (Topic)" value={formData.topic} onChange={(v) => setFormData({ ...formData, topic: v })} required />
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Learning Activities</label>
            <textarea className="w-full bg-[#0B0F19] border border-gray-700 rounded p-2 text-white h-24" value={formData.activities} onChange={(e) => setFormData({ ...formData, activities: e.target.value }) } required />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Tutor Notes</label>
            <textarea className="w-full bg-[#0B0F19] border border-gray-700 rounded p-2 text-white h-16" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value }) } />
          </div>
          <Input label="Follow-Up Actions" value={formData.followUp} onChange={(v) => setFormData({ ...formData, followUp: v })} />
          <div className="flex gap-2 justify-center">
            {isEditingId && <Button variant="ghost" className="flex-1" onClick={() => { setIsEditingId(null); setFormData({ date: new Date().toISOString().split('T')[0], sessionGroup: SESSIONS[0], topic: '', activities: '', notes: '', followUp: '' }); }}>Cancel</Button>}
            <Button type="submit" className="flex-1">Submit</Button>
          </div>
        </form>
      </Card>
      <Card className="lg:col-span-2 p-0 h-[650px] flex flex-col">
        <div className="p-4 border-b border-gray-800 bg-[#0A0E17]"><h3 className="font-semibold text-white">Recent Journals</h3></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {db.journals.slice().reverse().map((j) => (
            <div key={j.id} className="bg-[#0B0F19] p-4 rounded-xl border border-gray-800">
              <div className="flex justify-between"><div><h4 className="text-white font-medium">{j.topic}</h4><p className="text-[#00D4FF] text-sm">{j.sessionGroup}</p></div><div className="text-right text-xs text-gray-500"><p>{j.date}</p><p>by {j.tutorName}</p></div></div>
              <p className="text-sm text-gray-400 mt-2"><strong>Activities:</strong> {j.activities}</p>
              {j.notes && <p className="text-sm text-gray-500 mt-1"><strong>Notes:</strong> {j.notes}</p>}
              {j.followUp && <p className="text-sm text-gray-500 mt-1"><strong>Follow Up:</strong> {j.followUp}</p>}
              {(user.role === 'admin' || user.name === j.tutorName) && (
                <div className="mt-3 pt-3 border-t border-gray-800 flex justify-center gap-3">
                  <button onClick={() => {setFormData(j); setIsEditingId(j.id); const contentEl = document.querySelector('main'); setTimeout(() => { contentEl?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50);}} className="text-blue-400 text-xs flex items-center gap-1"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => softDelete('journals', j.id, 'Journal')} className="text-red-400 text-xs flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AnnouncementsModule({ db, setDb, generateId, user, showToast, softDelete, setActiveTab }) {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isEditingId, setIsEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditingId) {
      setDb((p) => ({ ...p, announcements: p.announcements.map((a) => a.id === isEditingId ? { ...a, ...formData } : a ) }));
      showToast('Updated'); setIsEditingId(null); setIsAdding(false);
    } else {
      setDb((p) => ({ ...p, announcements: [ ...p.announcements, { id: generateId('ANN', 'announcements'), ...formData, date: getTodayDateLocal(), author: user.name } ] }));
      showToast('Published'); setIsAdding(false);
    }
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Announcements</h2>
        <div className="flex gap-2">
          {user.role === 'admin' && <Button onClick={() => { setIsAdding(!isAdding); setIsEditingId(null); setFormData({ title: '', content: '' }); }} icon={Plus}>New Announcement</Button>}
          <Button variant="secondary" onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 border-gray-700 hover:bg-gray-800 transition-colors px-4 py-2 rounded-lg text-sm"><ArrowLeft size={16} /> Dashboard</Button>
        </div>
      </div>

      {(isAdding || isEditingId) && user.role === 'admin' && (
        <Card>
          <h3 className="font-bold text-white mb-4">{isEditingId ? 'Edit' : 'Publish'} Announcement</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Title" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} required />
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1.5">Content</label>
              <textarea className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg p-3 text-white h-32 focus:border-[#00D4FF]" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value }) } required />
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="ghost" onClick={() => { setIsEditingId(null); setIsAdding(false); setFormData({ title: '', content: '' }); }}>Cancel</Button>
              <Button type="submit">Publish</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
        {db.announcements.slice().reverse().map((a) => (
            <Card key={a.id} className="p-6">
              <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{a.title}</h3>
                  <p className="text-sm text-[#00D4FF]">{a.date} • {a.author}</p>
                </div>
                {user.role === 'admin' && (
                  <div className="flex gap-2">
                    <button onClick={() => { setFormData(a); setIsEditingId(a.id); setIsAdding(true); const contentEl = document.querySelector('main'); setTimeout(() => { contentEl?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }} className="text-blue-400 p-1"><Edit2 size={16} /></button>
                    <button onClick={() => softDelete('announcements', a.id, 'Announcement') } className="text-red-400 p-1"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{a.content}</div>
            </Card>
          ))}
        {db.announcements.length === 0 && <div className="text-center p-8 text-gray-500 bg-[#151B26] rounded-xl border border-gray-800">No announcements available.</div>}
      </div>
    </div>
  );
}

function CalendarModule({ db, setDb, generateId, showToast, user, softDelete }) {
  const [formData, setFormData] = useState({ sessionGroup: SESSIONS[0], date: '', startTime: '', endTime: '', tutor: '' });
  const [isEditingId, setIsEditingId] = useState(null);

  // Auto-fill tutor based on selected session (Updated for Co-Teaching)
  useEffect(() => {
    if (formData.sessionGroup) {
      const assignedTutors = db.tutors.filter(t => t.teachingSession === formData.sessionGroup && t.status === 'Active');
      const tutorNames = assignedTutors.length > 0 ? assignedTutors.map(t => t.name).join(' & ') : 'No Tutor Assigned';
      setFormData(prev => ({ ...prev, tutor: tutorNames }));
    }
  }, [formData.sessionGroup, db.tutors]);

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditingId) {
      setDb((p) => ({ ...p, calendar: p.calendar.map((c) => c.id === isEditingId ? { ...formData, id: isEditingId } : c ) }));
      showToast('Updated'); setIsEditingId(null);
    } else {
      setDb((p) => ({ ...p, calendar: [ ...p.calendar, { id: generateId('CAL', 'calendar'), ...formData } ] }));
      showToast('Event Saved');
    }
    setFormData({ sessionGroup: SESSIONS[0], date: '', startTime: '', endTime: '', tutor: '' });
  };

  return (
    <div className="space-y-6">
      {user.role === 'admin' && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">{isEditingId ? 'Edit Event' : 'Add Calendar Event'}</h3>
          <form onSubmit={handleSave} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="Session" type="select" options={SESSIONS} value={formData.sessionGroup} onChange={(v) => setFormData({ ...formData, sessionGroup: v })} required />
            <Input label="Date" type="date" value={formData.date} onChange={(v) => setFormData({ ...formData, date: v })} required />
            <Input label="Start" type="time" value={formData.startTime} onChange={(v) => setFormData({ ...formData, startTime: v })} required />
            <Input label="End" type="time" value={formData.endTime} onChange={(v) => setFormData({ ...formData, endTime: v })} required />
            <div className="col-span-2 md:col-span-4">
               <Input label="Assigned Tutor (Auto-filled)" value={formData.tutor} onChange={() => {}} disabled />
            </div>
            <div className="col-span-2 md:col-span-4 flex justify-center gap-2">
              {isEditingId && <Button variant="ghost" onClick={() => { setIsEditingId(null); setFormData({ sessionGroup: SESSIONS[0], date: '', startTime: '', endTime: '', tutor: '' }); }}>Cancel</Button>}
              <Button type="submit">Save Activity</Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0A0E17] border-b border-gray-800">
            <tr><th className="p-4 text-center">Date</th><th className="p-4 text-center">Time</th><th className="p-4 text-center">Session</th><th className="p-4 text-center">Tutor</th>{user.role === 'admin' && <th className="p-4 text-center">Actions</th>}</tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {db.calendar.slice().reverse().map((c) => (
                <tr key={c.id} className="hover:bg-[#0B0F19]">
                  <td className="p-4 text-center whitespace-nowrap">{c.date}</td>
                  <td className="p-4 text-center whitespace-nowrap">{c.startTime} - {c.endTime}</td>
                  <td className="p-4 text-center text-white font-medium">{c.sessionGroup || c.name}</td>
                  <td className="p-4 text-center text-[#00D4FF]">{c.tutor}</td>
                  {user.role === 'admin' && (
                    <td className="p-4 text-center flex justify-center gap-2">
                      <button onClick={() => { setFormData({ sessionGroup: c.sessionGroup || c.name, date: c.date, startTime: c.startTime, endTime: c.endTime, tutor: c.tutor }); setIsEditingId(c.id); const contentEl = document.querySelector('main'); setTimeout(() => { contentEl?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }} className="text-blue-400 p-1"><Edit2 size={16} /></button>
                      <button onClick={() => softDelete('calendar', c.id, c.sessionGroup || c.name)} className="text-red-400 p-1"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function HistoryReportsModule({ db, setDb, showToast, handlePrint }) {
  const [view, setView] = useState('directory');
  const [dirType, setDirType] = useState('student');
  const [selectedId, setSelectedId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSession, setFilterSession] = useState('');
  
  const [currentTeacherComment, setCurrentTeacherComment] = useState('');

  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const openProfile = (id, type) => {
    setSelectedId(id);
    setView(type === 'student' ? 'studentProfile' : 'tutorProfile');
  };

  const student = view === 'studentProfile' ? db.students.find((s) => s.id === selectedId) : null;

  useEffect(() => {
    if (student) setCurrentTeacherComment(student.teacherComment || '');
  }, [student]);

  const renderDirectory = () => {
    const students = db.students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterLevel ? s.level === filterLevel : true) &&
        (filterSession ? getSessionGroup(s.class) === filterSession : true)
    );
    const tutors = db.tutors.filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterSession ? t.teachingSession === filterSession : true)
    );

    return (
      <div className="space-y-6 animation-fade-in print-hidden">
        <div>
          <h2 className="text-2xl font-bold text-white">
            History & Reports Directory
          </h2>
        </div>
        <div className="flex gap-2 p-1 bg-[#151B26] rounded-lg w-max border border-gray-800">
          <button onClick={() => { setDirType('student'); setFilterSession(''); setFilterLevel(''); }} className={`px-6 py-2 rounded-md text-sm font-medium ${dirType === 'student' ? 'bg-[#0B0F19] text-[#00D4FF]' : 'text-gray-400'}`}>Student History</button>
          <button onClick={() => { setDirType('tutor'); setFilterSession(''); setFilterLevel(''); }} className={`px-6 py-2 rounded-md text-sm font-medium ${dirType === 'tutor' ? 'bg-[#0B0F19] text-[#00D4FF]' : 'text-gray-400'}`}>Tutor History</button>
        </div>
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row gap-4 bg-[#0A0E17]">
            <input type="text" placeholder={`Search ${dirType}s...`} className="flex-1 bg-[#151B26] border border-gray-700 rounded-lg px-4 py-2 text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {dirType === 'student' && (
              <select className="bg-[#151B26] border border-gray-700 rounded-lg px-4 py-2 text-white" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
                <option value="">All Levels</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            )}
            <select className="bg-[#151B26] border border-gray-700 rounded-lg px-4 py-2 text-white" value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
              <option value="">All Sessions</option>
              {SESSIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            {dirType === 'student' ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0B0F19] text-gray-400 border-b border-gray-800">
                  <tr><th className="p-4 text-center">Student ID</th><th className="p-4 text-center">Name</th><th className="p-4 text-center">Class</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-[#0B0F19]">
                      <td className="p-4 text-center font-mono text-gray-400">{s.id}</td>
                      <td className="p-4 text-center text-white">{s.name}</td>
                      <td className="p-4 text-center text-gray-300">{s.class}</td>
                      <td className="p-4 text-center"><Badge status={s.status} /></td>
                      <td className="p-4 flex justify-center"><Button className="bg-yellow-500 text-yellow-900 hover:bg-yellow-400 font-bold shadow-md hover:shadow-lg transition-all" icon={Eye} onClick={() => openProfile(s.id, 'student')}>VIEW PROFILE</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0B0F19] text-gray-400 border-b border-gray-800">
                  <tr><th className="p-4 text-center">Tutor ID</th><th className="p-4 text-center">Name</th><th className="p-4 text-center">Session</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {tutors.map((t) => (
                    <tr key={t.id} className="hover:bg-[#0B0F19]">
                      <td className="p-4 text-center font-mono text-gray-400">{t.id}</td>
                      <td className="p-4 text-center text-white">{t.name}</td>
                      <td className="p-4 text-center text-gray-300">{t.teachingSession}</td>
                      <td className="p-4 text-center"><Badge status={t.status} /></td>
                      <td className="p-4 flex justify-center"><Button className="bg-yellow-500 text-yellow-900 hover:bg-yellow-400 font-bold shadow-md hover:shadow-lg transition-all" icon={Eye} onClick={() => openProfile(t.id, 'tutor')}>VIEW PROFILE</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderStudentProfile = () => {
    if (!student) return null;
    
    const reportPrefix = `${reportYear}-${String(reportMonth).padStart(2, '0')}`;
    
    const att = db.studentAttendance.filter((a) => a.studentId === student.id && a.date.startsWith(reportPrefix));
    const presentCount = att.filter((a) => a.status === 'Present').length;
    const sickCount = att.filter((a) => a.status === 'Sick').length;
    const excusedCount = att.filter((a) => a.status === 'Excused').length;
    const absentCount = att.filter((a) => a.status === 'Absent').length;
    const attRate = att.length ? Math.round((presentCount / att.length) * 100) : 0;
    
    const assessments = db.assessments.filter((a) => a.studentId === student.id && Number(a.month) === reportMonth && Number(a.year) === reportYear);
    const avgScore = assessments.length ? Math.round(assessments.reduce((sum, a) => sum + a.average, 0) / assessments.length) : 0;
    
    const payments = db.payments.filter((p) => p.studentId === student.id && Number(p.month) === reportMonth && Number(p.year) === reportYear);
    const journals = db.journals.filter((j) => j.sessionGroup === getSessionGroup(student.class) && j.date.startsWith(reportPrefix));

    const studentSession = getSessionGroup(student.class);
    const reportSubjects = studentSession === SESSIONS[0]
      ? ['Membaca', 'Menulis', 'Berhitung', 'Bahasa Inggris']
      : ['Speaking', 'Writing', 'Reading', 'Listening'];

    const hasPaidCurrentMonth = payments.some(p => p.status === 'Paid');
    const paymentStatusBadge = hasPaidCurrentMonth ? <span className="text-green-600 font-bold">Up to Date</span> : <span className="text-red-600 font-bold">Outstanding</span>;
    const totalPaidSum = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const latestTutor = journals.length > 0 ? journals[journals.length-1].tutorName : "System";

    const autoGeneratedComment = generateAutoComment(student, attRate, avgScore, assessments);
    const finalCommentDisplay = currentTeacherComment || autoGeneratedComment;

    const handleGenerateCommentBtn = () => {
      setCurrentTeacherComment(autoGeneratedComment);
      showToast('Comment generated automatically');
    };

    const handleSaveCommentBtn = () => {
      setDb(p => ({
        ...p,
        students: p.students.map(s => s.id === student.id ? {...s, teacherComment: currentTeacherComment} : s)
      }));
      showToast('Teacher comment saved to profile');
    };

    const handlePrintStudentReport = () => {
      const originalTitle = document.title;
      const safeName = student.name.replace(/\s+/g, '_');
      document.title = `${safeName}_report`;
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 1000);
    };

    const getPrintBadge = (status) => {
       const colors = {
          Present: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          Sick: 'bg-amber-100 text-amber-700 border-amber-200',
          Excused: 'bg-purple-100 text-purple-700 border-purple-200',
          Absent: 'bg-red-100 text-red-700 border-red-200',
       };
       const col = colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
       return <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border ${col}`}>{status}</span>;
    };

    return (
      <div className="w-full animation-fade-in relative text-slate-900 bg-white rounded-xl shadow-2xl p-8 print:p-6 print:shadow-none print:bg-transparent print:w-full font-sans max-w-5xl mx-auto" id="report-print">
        
        <div className="fixed inset-0 flex items-center justify-center opacity-[0.03] z-0 pointer-events-none hidden print:flex">
          <img src={LOGO_URL} className="w-[400px] h-auto grayscale" alt="watermark" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center print-hidden mb-6 bg-[#0B0F19] p-4 rounded-lg text-white gap-4 relative z-20">
          <Button variant="ghost" onClick={() => setView('directory')} icon={ArrowLeft}>Back</Button>
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-sm text-gray-400 font-medium whitespace-nowrap">Report Period:</span>
            <select className="bg-[#151B26] border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-[#00D4FF]" value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" className="bg-[#151B26] border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white w-24 focus:border-[#00D4FF]" value={reportYear} onChange={e => setReportYear(Number(e.target.value))} />
          </div>
          <Button onClick={handlePrintStudentReport} icon={Printer}>Print Premium PDF</Button>
        </div>

        <div className="print-hidden mb-8 bg-[#151B26] p-5 rounded-xl border border-gray-800 shadow-xl relative z-20">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><MessageSquare size={18} className="text-[#00D4FF]" /> Report Teacher Comments Editor</h3>
            <p className="text-gray-400 text-xs mb-3">Auto-generate academic comments based on student performance, edit as needed, and save to profile.</p>
            <textarea
                className="w-full bg-[#0B0F19] border border-gray-700 rounded-lg p-3 text-white text-sm h-28 focus:border-[#00D4FF] transition-colors mb-4"
                value={currentTeacherComment}
                onChange={(e) => setCurrentTeacherComment(e.target.value)}
                placeholder="Write comments or click generate..."
            />
            <div className="flex justify-end gap-3">
                <Button onClick={handleGenerateCommentBtn} variant="secondary" icon={RefreshCw}>
                   {currentTeacherComment ? 'Regenerate Comment' : 'Generate Comment'}
                </Button>
                <Button onClick={handleSaveCommentBtn} icon={CheckCircle2} className="bg-green-600 hover:bg-green-500 border-none text-white shadow-none">Save Comment</Button>
            </div>
        </div>

        {/* --- BEGIN PREMIUM PDF LAYOUT --- */}
        <div className="relative z-10 bg-white">
          
          {/* HEADER */}
          <div className="flex items-center justify-between border-b-[3px] border-[#1e3a8a] pb-4 mb-5 break-inside-avoid">
            <div className="flex items-center gap-4">
               <img src={LOGO_URL} className="h-16" style={{ filter: 'brightness(0)' }} alt="Logo" />
               <div>
                 <h1 className="text-2xl font-black text-[#1e3a8a] tracking-widest uppercase leading-none mb-1">English Club Gresik</h1>
                 <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest">Monthly Academic Progress Report</h2>
               </div>
            </div>
            <div className="text-right hidden sm:block print:block">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Report Period</p>
               <p className="text-lg font-black text-[#1e3a8a] leading-none">{MONTHS[reportMonth - 1]} {reportYear}</p>
            </div>
          </div>

          {/* PROFILE & KPI GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 break-inside-avoid">
             {/* Profile Card */}
             <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
               <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                 <User size={16} className="text-[#1e3a8a]" />
                 <h3 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-widest">Student Profile</h3>
               </div>
               <p className="text-lg font-black text-slate-800 leading-tight truncate">{student.name}</p>
               <p className="text-xs text-blue-600 font-bold mt-1 tracking-wide">{student.id}</p>
               <div className="mt-3 space-y-1.5 text-[10px] text-slate-600">
                  <div className="flex justify-between items-center"><span className="font-medium uppercase tracking-wider text-slate-400">Class Level</span> <span className="font-bold text-slate-800">{student.level} {student.class}</span></div>
                  <div className="flex justify-between items-center"><span className="font-medium uppercase tracking-wider text-slate-400">Session</span> <span className="font-bold text-slate-800">{studentSession}</span></div>
               </div>
             </div>
             
             {/* KPI Cards */}
             <div className="lg:col-span-2 grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { label: 'Att. Rate', val: `${attRate}%`, col: attRate >= 75 ? 'text-emerald-600' : 'text-red-600' },
                  { label: 'Present', val: presentCount, col: 'text-blue-600' },
                  { label: 'Sick', val: sickCount, col: 'text-amber-500' },
                  { label: 'Excused', val: excusedCount, col: 'text-purple-600' },
                  { label: 'Absent', val: absentCount, col: 'text-red-600' },
                  { label: 'Avg Score', val: avgScore || '-', col: 'text-[#1e3a8a]' }
                ].map((k, i) => (
                  <div key={i} className="flex flex-col justify-center items-center bg-white border border-slate-200 rounded-xl p-2 shadow-sm text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 line-clamp-1">{k.label}</span>
                    <span className={`text-xl font-black leading-none ${k.col}`}>{k.val}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* TEACHER COMMENTS (HIGHLIGHTED) */}
          <div className="mb-6 break-inside-avoid">
             <div className="flex items-center gap-2 mb-2 px-1">
               <MessageSquare size={14} className="text-[#1e3a8a]" />
               <h3 className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest">Academic Advisor Comments</h3>
             </div>
             <div className="bg-[#f0f9ff] border-2 border-[#bae6fd] rounded-xl p-6 shadow-md relative overflow-hidden print-border-highlight">
                <div className="absolute -top-2 -left-2 text-blue-200/40 transform -rotate-6"><Quote size={64} /></div>
                <p className="text-[14px] italic text-[#0f172a] leading-relaxed relative z-10 font-bold text-justify">
                   "{finalCommentDisplay}"
                </p>
             </div>
          </div>

          {/* ASSESSMENT SECTION (WITH PROGRESS BARS) */}
          <div className="mb-6 break-inside-avoid">
            <div className="flex items-center gap-2 mb-2 px-1">
               <Award size={14} className="text-[#1e3a8a]" />
               <h3 className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest">Monthly Assessment Grades</h3>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs border-collapse bg-white">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider w-24">Period</th>
                    {reportSubjects.map(sub => (
                      <th key={sub} className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider">{sub}</th>
                    ))}
                    <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider bg-blue-50/50 w-20">Average</th>
                    <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider bg-blue-50/50 w-16">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.length > 0 ? assessments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-700">{MONTHS[parseInt(a.month)-1].substring(0,3)} '{String(a.year).slice(2)}</td>
                      {reportSubjects.map(sub => {
                        const scoreStr = a.scores?.[sub];
                        const scoreNum = Number(scoreStr);
                        return (
                          <td key={sub} className="p-2.5">
                             {scoreStr ? (
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                   <span className="font-bold text-slate-800 text-[13px]">{scoreStr}</span>
                                   <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${scoreNum >= 90 ? 'bg-emerald-500' : scoreNum >= 75 ? 'bg-blue-500' : scoreNum >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width: `${Math.min(100, Math.max(0, scoreNum))}%`}}></div>
                                   </div>
                                </div>
                             ) : <span className="text-slate-400 font-medium block text-center">-</span>}
                          </td>
                        )
                      })}
                      <td className="p-2.5 text-center font-black text-[#1e3a8a] text-[14px] bg-blue-50/20">{a.average || '-'}</td>
                      <td className="p-2.5 text-center font-black text-blue-600 text-[14px] bg-blue-50/20">{a.grade || '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={reportSubjects.length + 3} className="p-4 text-center text-slate-500 font-medium italic bg-slate-50">No assessments recorded for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SESSION DETAIL LOG */}
          <div className="mb-8 break-inside-avoid">
            <div className="flex items-center gap-2 mb-2 px-1">
               <BookOpen size={14} className="text-[#1e3a8a]" />
               <h3 className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest">Session Detail & Attendance Log</h3>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {(() => {
                const uniqueDates = Array.from(new Set([...att.map(a => a.date), ...journals.map(j => j.date)]))
                  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                
                const combinedSessions = uniqueDates.map(date => {
                    const journalEntry = journals.find(j => j.date === date);
                    const attEntry = att.find(a => a.date === date);
                    return {
                        date: date,
                        topic: journalEntry?.topic || "No lesson record entered",
                        status: attEntry?.status || "-",
                        note: (journalEntry?.notes && journalEntry.notes.trim() !== "") ? journalEntry.notes : "Auto-generated from attendance data"
                    };
                });

                return combinedSessions.length > 0 ? (
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider w-10">No.</th>
                        <th className="p-2.5 text-left font-bold text-slate-500 uppercase tracking-wider w-24">Date</th>
                        <th className="p-2.5 text-left font-bold text-slate-500 uppercase tracking-wider">Material / Topic</th>
                        <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider w-24">Status</th>
                        <th className="p-2.5 text-left font-bold text-slate-500 uppercase tracking-wider w-48 hidden sm:table-cell print:table-cell">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {combinedSessions.map((session, index) => (
                        <tr key={session.date} className="even:bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-center font-bold text-slate-400">{index + 1}</td>
                          <td className="p-2.5 whitespace-nowrap font-medium text-slate-700">{new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className={`p-2.5 font-medium ${session.topic === 'No lesson record entered' ? 'text-slate-400 italic' : 'text-slate-800'}`}>{session.topic}</td>
                          <td className="p-2.5 text-center">
                            {session.status !== '-' ? getPrintBadge(session.status) : <span className="text-slate-400">-</span>}
                          </td>
                          <td className="p-2.5 text-slate-500 italic text-[10px] hidden sm:table-cell print:table-cell leading-tight">{session.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center text-slate-500 font-medium italic bg-slate-50">
                    No attendance records available for this period.
                  </div>
                );
              })()}
            </div>
          </div>

          {/* PREMIUM SIGNATURE SECTION */}
          <div className="mt-8 pt-6 border-t-2 border-slate-100 flex justify-between items-end break-inside-avoid text-sm signature-section">
             <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest hidden sm:block print:block pb-2">
                Document automatically generated by system. <br/>
                Valid without physical signature.
             </div>
             <div className="text-center w-64">
               <p className="text-slate-600 mb-10 font-medium text-sm">Gresik, {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
               <p className="font-black text-slate-800 border-b border-slate-300 pb-1 mb-1 tracking-wide">Akhmad Akmal Rifqi</p>
               <p className="text-[10px] text-[#1e3a8a] font-bold uppercase tracking-widest">English Club Gresik</p>
             </div>
          </div>

          {/* FOOTER */}
          <div className="mt-10 pt-4 border-t border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex justify-between print-footer-content hidden print:flex">
             <span>English Club Gresik – Premium Report</span>
             <span>Page 1 of 1</span>
          </div>

        </div>
      </div>
    );
  };

  const renderTutorProfile = () => {
    const tutor = db.tutors.find((t) => t.id === selectedId);
    if (!tutor) return null;
    
    const att = db.tutorAttendance.filter((a) => a.tutorId === tutor.id);
    const payrolls = db.payroll.filter((p) => p.tutorId === tutor.id);
    const journals = db.journals.filter((j) => j.tutorName === tutor.name);
    const assessments = db.assessments.filter((a) => a.sessionGroup === tutor.teachingSession);

    const handlePrintTutorReport = () => {
       const originalTitle = document.title;
       const safeName = tutor.name.replace(/\s+/g, '_');
       document.title = `${safeName}_report`;
       window.print();
       setTimeout(() => { document.title = originalTitle; }, 1000);
    };

    return (
      <div className="w-full animation-fade-in relative text-black bg-white rounded-xl shadow-2xl p-8 print:p-0 print:shadow-none print:bg-transparent print:w-full" id="report-print">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center print-hidden mb-6 bg-[#0B0F19] p-4 rounded-lg text-white gap-4">
          <Button variant="ghost" onClick={() => setView('directory')} icon={ArrowLeft}>Back</Button>
          <Button onClick={handlePrintTutorReport} icon={Printer}>Print / Export PDF</Button>
        </div>

        <table className="w-full relative z-10 text-gray-900 print-table">
          <thead className="table-header-group">
            <tr>
              <td>
                <div className="flex items-center gap-4 border-b-2 border-blue-900 pb-3 mb-4">
                  <img src={LOGO_URL} className="h-14" style={{ filter: 'brightness(0)' }} alt="Logo" />
                  <div>
                    <h1 className="text-xl font-black text-blue-900 tracking-widest uppercase">English Club Gresik</h1>
                    <h2 className="text-base font-bold text-gray-800">Tutor Academic & Performance Report</h2>
                    <p className="text-[10px] text-gray-600">Perumahan Taman Anggrek Blok AB 05, Kedanyang, Kebomas, Gresik | www.englishclub.my.id</p>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 mb-6 shadow-sm break-inside-avoid">
                  <h3 className="text-xs font-bold text-blue-800 border-b border-gray-200 pb-2 mb-3 uppercase flex items-center gap-2"><User size={14} /> Tutor Profile</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="flex items-center gap-2"><span className="font-medium w-24 text-gray-500">Name</span> <span className="font-bold">{tutor.name}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium w-24 text-gray-500">Session</span> <span className="font-bold text-[#1e3a8a]">{tutor.teachingSession}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium w-24 text-gray-500">Tutor ID</span> <span className="font-bold">{tutor.id}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium w-24 text-gray-500">Status</span> <span className="font-bold text-blue-700">{tutor.status}</span></div>
                    <div className="flex items-center gap-2"><span className="font-medium w-24 text-gray-500">Generated</span> <span className="font-bold">{new Date().toLocaleString('en-GB')}</span></div>
                  </div>
                </div>

                <div className="mb-6 break-inside-avoid">
                  <h3 className="text-sm font-bold text-blue-900 border-b-2 border-blue-200 mb-2 pb-1 flex items-center gap-2 uppercase">Check-In History</h3>
                  {att.length > 0 ? (
                    <table className="w-full text-[11px] border-collapse border border-gray-300">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="border border-gray-300 p-1.5 text-left font-bold text-blue-900">Date</th>
                          <th className="border border-gray-300 p-1.5 text-center font-bold text-blue-900">Time</th>
                          <th className="border border-gray-300 p-1.5 text-center font-bold text-blue-900">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {att.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => (
                          <tr key={a.id} className="bg-white">
                            <td className="border border-gray-300 p-1.5">{a.date} ({a.day})</td>
                            <td className="border border-gray-300 p-1.5 text-center">{a.time}</td>
                            <td className="border border-gray-300 p-1.5 text-center">{a.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-xs text-gray-500 italic">No data available.</p>}
                </div>

                <div className="mb-6 break-inside-avoid">
                  <h3 className="text-sm font-bold text-blue-900 border-b-2 border-blue-200 mb-2 pb-1 flex items-center gap-2 uppercase">Learning Journals</h3>
                  {journals.length > 0 ? (
                    <table className="w-full text-[11px] border-collapse border border-gray-300">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="border border-gray-300 p-1.5 text-left font-bold text-blue-900 w-1/4">Date</th>
                          <th className="border border-gray-300 p-1.5 text-left font-bold text-blue-900 w-1/4">Session</th>
                          <th className="border border-gray-300 p-1.5 text-left font-bold text-blue-900 w-1/2">Material</th>
                        </tr>
                      </thead>
                      <tbody>
                        {journals.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(j => (
                          <tr key={j.id} className="bg-white">
                            <td className="border border-gray-300 p-1.5">{j.date}</td>
                            <td className="border border-gray-300 p-1.5">{j.sessionGroup}</td>
                            <td className="border border-gray-300 p-1.5">{j.topic}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-xs text-gray-500 italic">No data available.</p>}
                </div>

                <div className="mb-6 break-inside-avoid">
                  <h3 className="text-sm font-bold text-blue-900 border-b-2 border-blue-200 mb-2 pb-1 flex items-center gap-2 uppercase">Monthly Assessments Conducted</h3>
                  {assessments.length > 0 ? (
                    <table className="w-full text-[11px] border-collapse border border-gray-300">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="border border-gray-300 p-1.5 text-left font-bold text-blue-900">Period</th>
                          <th className="border border-gray-300 p-1.5 text-left font-bold text-blue-900">Student Name</th>
                          <th className="border border-gray-300 p-1.5 text-center font-bold text-blue-900">Avg Score</th>
                          <th className="border border-gray-300 p-1.5 text-center font-bold text-blue-900">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessments.slice().sort((a,b) => (b.year+b.month).localeCompare(a.year+a.month)).map(a => (
                          <tr key={a.id} className="bg-white">
                            <td className="border border-gray-300 p-1.5">{MONTHS[parseInt(a.month)-1]} {a.year}</td>
                            <td className="border border-gray-300 p-1.5">{a.studentName}</td>
                            <td className="border border-gray-300 p-1.5 text-center">{a.average}</td>
                            <td className="border border-gray-300 p-1.5 text-center font-bold text-blue-700">{a.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-xs text-gray-500 italic">No data available.</p>}
                </div>

                <div className="mb-6 break-inside-avoid">
                  <h3 className="text-sm font-bold text-blue-900 border-b-2 border-blue-200 mb-2 pb-1 flex items-center gap-2 uppercase">Payroll Summary</h3>
                  {payrolls.length > 0 ? (
                    <table className="w-full text-[11px] border-collapse border border-gray-300">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="border border-gray-300 p-1.5 text-left font-bold text-blue-900">Period</th>
                          <th className="border border-gray-300 p-1.5 text-right font-bold text-blue-900">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrolls.slice().sort((a,b) => (b.year+b.month).localeCompare(a.year+a.month)).map(p => (
                          <tr key={p.id} className="bg-white">
                            <td className="border border-gray-300 p-1.5">{MONTHS[parseInt(p.month)-1]} {p.year}</td>
                            <td className="border border-gray-300 p-1.5 text-right">Rp {Number(p.totalPaid).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-xs text-gray-500 italic">No data available.</p>}
                </div>

              </td>
            </tr>
          </tbody>
          <tfoot className="table-footer-group">
            <tr>
              <td>
                <div className="pt-4 mt-4 border-t border-gray-300 text-[10px] text-gray-500 flex justify-between print-footer-content font-sans">
                   <span>English Club Gresik – Academic Suite</span>
                   <span>Generated on: {new Date().toLocaleString('en-GB')}</span>
                   <span className="print-page-number"></span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div>
      {view === 'directory' && renderDirectory()}
      {view === 'studentProfile' && renderStudentProfile()}
      {view === 'tutorProfile' && renderTutorProfile()}
    </div>
  );
}

// MODULE UNTUK BUAT AKUN TERMASUK SISWA
function SettingsModule({ db, setDb, generateId, user, showToast, requestConfirm }) {
  const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'admin', active: 'Active', studentId: '', teachingSession: '' });
  const [isEditingId, setIsEditingId] = useState(null);
  const [resetDialog, setResetDialog] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const activeStudents = db.students.filter(s => s.status === 'Active');

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.role === 'admin') {
      const rec = { ...formData, id: isEditingId || generateId('ADM', 'users') };
      setDb((p) => ({ ...p, users: isEditingId ? p.users.map((u) => (u.id === isEditingId ? rec : u)) : [...p.users, rec] }));
    } else if (formData.role === 'student') {
      if (!formData.studentId) return showToast('Please select a student to link', 'error');
      // PERBAIKAN: Fallback jika student yang di-link sudah dihapus dari direktori
      const linkedStudent = db.students.find(s => s.id === formData.studentId) || { name: formData.name };
      // Untuk student yang baru dibuat, paksa ganti password di awal
      const rec = { ...formData, name: linkedStudent.name, id: isEditingId || generateId('USR', 'users'), mustChangePassword: !isEditingId };
      setDb((p) => ({ ...p, users: isEditingId ? p.users.map((u) => (u.id === isEditingId ? rec : u)) : [...p.users, rec] }));
    } else {
      // PERBAIKAN KRITIS: Jangan menimpa (override) teachingSession milik tutor kembali ke SESSIONS[0] saat diedit
      const rec = { 
         ...formData, 
         id: isEditingId || generateId('TUT', 'tutors'), 
         status: formData.active, 
         teachingSession: formData.teachingSession || SESSIONS[0] 
      };
      setDb((p) => ({ ...p, tutors: isEditingId ? p.tutors.map((t) => (t.id === isEditingId ? rec : t)) : [...p.tutors, rec] }));
    }
    showToast('User Saved');
    setIsEditingId(null);
    setFormData({ name: '', username: '', password: '', role: 'admin', active: 'Active', studentId: '', teachingSession: '' });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if(!newPassword) return showToast('Please enter a new password', 'warning');
    if (resetDialog.role === 'admin' || resetDialog.role === 'student') {
      setDb(p => ({...p, users: p.users.map(u => u.id === resetDialog.id ? {...u, password: newPassword} : u)}));
    } else {
      setDb(p => ({...p, tutors: p.tutors.map(t => t.id === resetDialog.id ? {...t, password: newPassword} : t)}));
    }
    showToast(`Password reset for ${resetDialog.name} was successful.`);
    setResetDialog(null);
    setNewPassword('');
  };

  const handleDeleteUser = (id, role, name) => {
    if (id === 'ADM-001') {
      showToast('Primary Super Admin cannot be deleted.', 'error');
      return;
    }
    
    requestConfirm(
      'Confirm Deletion',
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      () => {
        if (role === 'admin' || role === 'student') {
          setDb(p => ({ ...p, users: p.users.filter(u => u.id !== id) }));
        } else {
          setDb(p => ({ ...p, tutors: p.tutors.filter(t => t.id !== id) }));
        }
        showToast('User deleted successfully');
      }
    );
  };

  return (
    <div className="space-y-6">
      
      {resetDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animation-fade-in print-hidden">
          <div className="bg-[#151B26] border border-gray-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6">
            <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
            <p className="text-gray-400 mb-6 text-sm">You are manually resetting the password for <b>{resetDialog.name}</b>.</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
               <Input label="New Password" type="text" value={newPassword} onChange={setNewPassword} required placeholder="Enter new password" />
               <div className="flex justify-end gap-3 pt-2">
                 <Button variant="ghost" onClick={() => {setResetDialog(null); setNewPassword('');}}>Cancel</Button>
                 <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white border-none shadow-none">Force Reset</Button>
               </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <h3 className="text-lg font-bold text-white mb-4">{isEditingId ? 'Edit User' : 'Create User'}</h3>
        <form onSubmit={handleSave} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Input label="Role" type="select" options={['admin', 'tutor', 'student']} value={formData.role} onChange={(v) => setFormData({ ...formData, role: v })} required disabled={isEditingId !== null} />
          
          {formData.role === 'student' && !isEditingId ? (
             <Input label="Link to Student" type="select" options={activeStudents.map(s => ({ value: s.id, label: `${s.name} (${s.class})` }))} value={formData.studentId} onChange={(v) => setFormData({ ...formData, studentId: v })} required />
          ) : (
             <Input label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required disabled={formData.role === 'student'} />
          )}

          <Input label="Username" value={formData.username} onChange={(v) => setFormData({ ...formData, username: v })} required />
          <Input label="Password" type="text" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} required={!isEditingId} placeholder={isEditingId ? 'Leave blank to keep' : ''} />
          <Input label="Status" type="select" options={['Active', 'Inactive']} value={formData.active} onChange={(v) => setFormData({ ...formData, active: v })} required />
          
          <div className="col-span-2 md:col-span-5 flex justify-center gap-2">
            {isEditingId && <Button variant="ghost" onClick={() => { setIsEditingId(null); setFormData({ name: '', username: '', password: '', role: 'admin', active: 'Active', studentId: '', teachingSession: '' }); }}>Cancel</Button>}
            <Button type="submit">Save Account</Button>
          </div>
        </form>
      </Card>
      
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0A0E17] border-b border-gray-800">
            <tr><th className="p-4 text-center">Role</th><th className="p-4 text-center">Name</th><th className="p-4 text-center">Username</th><th className="p-4 text-center">Password</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {db.users.filter(u => u.role === 'admin').map((u) => (
              <tr key={u.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 text-center text-xs font-bold uppercase text-red-400">Admin</td>
                <td className="p-4 text-center text-white">{u.name}</td><td className="p-4 text-center">{u.username}</td><td className="p-4 text-center text-gray-500">****</td><td className="p-4 text-center"><Badge status={u.active} /></td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => { setFormData({ ...u }); setIsEditingId(u.id); const contentEl = document.querySelector('main'); setTimeout(() => { contentEl?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }} className="text-blue-400 p-1" title="Edit Profile"><Edit2 size={16} /></button>
                  <button onClick={() => { setResetDialog({ id: u.id, role: u.role, name: u.name }); }} className="text-yellow-500 p-1" title="Reset Password"><KeyRound size={16} /></button>
                  {u.id !== 'ADM-001' && (
                    <button onClick={() => handleDeleteUser(u.id, u.role, u.name)} className="text-red-500 p-1" title="Delete User"><Trash2 size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
            {db.tutors.map((t) => (
              <tr key={t.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 text-center text-xs font-bold uppercase text-purple-400">Tutor</td>
                <td className="p-4 text-center text-white">{t.name}</td><td className="p-4 text-center">{t.username}</td><td className="p-4 text-center text-gray-500">****</td><td className="p-4 text-center"><Badge status={t.status} /></td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => { setFormData({ ...t, role: 'tutor', active: t.status }); setIsEditingId(t.id); const contentEl = document.querySelector('main'); setTimeout(() => { contentEl?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }} className="text-blue-400 p-1" title="Edit Profile"><Edit2 size={16} /></button>
                  <button onClick={() => { setResetDialog({ id: t.id, role: 'tutor', name: t.name }); }} className="text-yellow-500 p-1" title="Reset Password"><KeyRound size={16} /></button>
                  <button onClick={() => handleDeleteUser(t.id, 'tutor', t.name)} className="text-red-500 p-1" title="Delete User"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {db.users.filter(u => u.role === 'student').map((u) => (
              <tr key={u.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 text-center text-xs font-bold uppercase text-blue-400">Student</td>
                <td className="p-4 text-center text-white">{u.name}</td><td className="p-4 text-center">{u.username}</td><td className="p-4 text-center text-gray-500">****</td><td className="p-4 text-center"><Badge status={u.active} /></td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => { setFormData({ ...u }); setIsEditingId(u.id); const contentEl = document.querySelector('main'); setTimeout(() => { contentEl?.scrollTo({ top: 0, behavior: 'smooth' }); }, 50); }} className="text-blue-400 p-1" title="Edit Profile"><Edit2 size={16} /></button>
                  <button onClick={() => { setResetDialog({ id: u.id, role: u.role, name: u.name }); }} className="text-yellow-500 p-1" title="Reset Password"><KeyRound size={16} /></button>
                  <button onClick={() => handleDeleteUser(u.id, u.role, u.name)} className="text-red-500 p-1" title="Delete User"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AccountSettingsModule({ db, setDb, user, setCurrentUser, showToast }) {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleUpdate = (e) => {
    e.preventDefault();
    if (currentPwd !== user.password) {
      return showToast('Your current password is incorrect.', 'error');
    }
    if (newPwd !== confirmPwd) {
      return showToast('New password and confirmation do not match.', 'error');
    }
    if (newPwd.length < 6) {
      return showToast('Password must be at least 6 characters long.', 'warning');
    }

    if (user.role === 'tutor') {
      setDb(p => ({
        ...p,
        tutors: p.tutors.map(t => t.id === user.id ? { ...t, password: newPwd } : t)
      }));
    } else {
      setDb(p => ({
        ...p,
        users: p.users.map(u => u.id === user.id ? { ...u, password: newPwd } : u)
      }));
    }

    setCurrentUser({ ...user, password: newPwd });
    showToast('Your password has been successfully updated.', 'success');
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
        <p className="text-gray-400 text-sm">Manage your personal profile and security credentials.</p>
      </div>

      <Card className="border border-[#00D4FF]/20 shadow-[0_0_30px_rgba(0,212,255,0.05)]">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <ShieldCheck className="text-[#00D4FF]" size={24} />
          <h3 className="text-lg font-bold text-white">Change Password</h3>
        </div>
        <form onSubmit={handleUpdate} className="space-y-5">
          <Input label="Current Password" type="password" value={currentPwd} onChange={setCurrentPwd} required placeholder="Enter your current password" />
          <Input label="New Password" type="password" value={newPwd} onChange={setNewPwd} required placeholder="Enter new secure password" />
          <Input label="Confirm New Password" type="password" value={confirmPwd} onChange={setConfirmPwd} required placeholder="Re-type new password" />
          <div className="pt-4 border-t border-gray-800">
            <Button type="submit" className="w-full text-lg py-3">Update Security Credentials</Button>
            <p className="text-center text-xs text-gray-500 mt-4">Note: Passwords are saved in the system securely.</p>
          </div>
        </form>
      </Card>
    </div>
  );
}

// MODULES KHUSUS STUDENT (READ-ONLY)

function StudentReadOnlyAttendanceModule({ db, user }) {
  const myAtt = db.studentAttendance.filter(a => a.studentId === user.studentId).reverse();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Attendance Record</h2>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0A0E17] border-b border-gray-800">
            <tr><th className="p-4 text-center">Date</th><th className="p-4 text-center">Session Group</th><th className="p-4 text-center">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {myAtt.length > 0 ? myAtt.map(a => (
              <tr key={a.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 text-center font-medium text-white">{a.date}</td>
                <td className="p-4 text-center text-gray-400">{a.sessionGroup}</td>
                <td className="p-4 text-center"><Badge status={a.status} /></td>
              </tr>
            )) : <tr><td colSpan={3} className="p-8 text-center text-gray-500">No attendance recorded yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function StudentReadOnlyJournalsModule({ db, user }) {
  const student = db.students.find(s => s.id === user.studentId);
  const myGroup = student ? getSessionGroup(student.class) : '';
  const myJournals = db.journals.filter(j => j.sessionGroup === myGroup).reverse();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Learning Materials</h2>
      <div className="space-y-4">
        {myJournals.length > 0 ? myJournals.map(j => (
          <Card key={j.id} className="border-[#00D4FF]/20 shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                 <h3 className="text-lg font-bold text-white">{j.topic}</h3>
                 <p className="text-[#00D4FF] text-sm">Tutor: {j.tutorName}</p>
              </div>
              <span className="text-xs text-gray-400">{j.date}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-300"><strong>Activities:</strong> {j.activities}</p>
              {j.followUp && <p className="text-sm text-gray-400 mt-2"><strong>Follow Up:</strong> {j.followUp}</p>}
            </div>
          </Card>
        )) : <div className="p-8 text-center text-gray-500 bg-[#151B26] rounded-xl">No materials available for your session.</div>}
      </div>
    </div>
  )
}

function StudentReadOnlyAssessmentModule({ db, user }) {
  const myAssessments = db.assessments.filter(a => a.studentId === user.studentId).sort((a,b) => (b.year+b.month).localeCompare(a.year+a.month));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Assessment Results</h2>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0A0E17] border-b border-gray-800">
            <tr>
              <th className="p-4 text-center">Period</th>
              <th className="p-4 text-center">Average Score</th>
              <th className="p-4 text-center">Final Grade</th>
              <th className="p-4 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {myAssessments.length > 0 ? myAssessments.map(a => (
              <tr key={a.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 text-center font-medium text-white">{MONTHS[parseInt(a.month)-1]} {a.year}</td>
                <td className="p-4 text-center font-bold text-[#00D4FF] text-lg">{a.average}</td>
                <td className="p-4 text-center font-bold text-white text-lg">{a.grade}</td>
                <td className="p-4 text-center text-gray-400 text-xs">
                   {Object.entries(a.scores || {}).map(([sub, score]) => (
                      <span key={sub} className="block">{`${sub}: ${score}`}</span>
                   ))}
                </td>
              </tr>
            )) : <tr><td colSpan={4} className="p-8 text-center text-gray-500">No assessments recorded yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function StudentReadOnlyPaymentModule({ db, user }) {
  const myPayments = db.payments.filter(p => p.studentId === user.studentId).sort((a,b) => (b.year+b.month).localeCompare(a.year+a.month));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Payment History</h2>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0A0E17] border-b border-gray-800">
            <tr>
              <th className="p-4 text-center">Invoice ID</th>
              <th className="p-4 text-center">Period</th>
              <th className="p-4 text-center">Amount Paid</th>
              <th className="p-4 text-center">Date</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {myPayments.length > 0 ? myPayments.map(p => (
              <tr key={p.id} className="hover:bg-[#0B0F19]">
                <td className="p-4 text-center font-mono text-gray-500 text-xs">{p.id}</td>
                <td className="p-4 text-center font-medium text-white">{MONTHS[parseInt(p.month)-1]} {p.year}</td>
                <td className="p-4 text-center font-bold text-green-400">Rp {Number(p.amount).toLocaleString()}</td>
                <td className="p-4 text-center text-gray-400">{p.date}</td>
                <td className="p-4 text-center"><Badge status={p.status} /></td>
              </tr>
            )) : <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payment records found.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ADD START
function StudentReadOnlyReportModule({ db, user, downloadPNG, handleShareImage }) {
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const student = db.students.find(s => s.id === user.studentId);
  if (!student) return <div className="p-8 text-center text-red-500">Student profile not found.</div>;

  const reportPrefix = `${reportYear}-${String(reportMonth).padStart(2, '0')}`;
  
  const att = db.studentAttendance.filter((a) => a.studentId === student.id && a.date.startsWith(reportPrefix));
  const presentCount = att.filter((a) => a.status === 'Present').length;
  const sickCount = att.filter((a) => a.status === 'Sick').length;
  const excusedCount = att.filter((a) => a.status === 'Excused').length;
  const absentCount = att.filter((a) => a.status === 'Absent').length;
  const attRate = att.length ? Math.round((presentCount / att.length) * 100) : 0;
  
  const assessments = db.assessments.filter((a) => a.studentId === student.id && Number(a.month) === reportMonth && Number(a.year) === reportYear);
  const avgScore = assessments.length ? Math.round(assessments.reduce((sum, a) => sum + a.average, 0) / assessments.length) : 0;
  
  const journals = db.journals.filter((j) => j.sessionGroup === getSessionGroup(student.class) && j.date.startsWith(reportPrefix));

  const studentSession = getSessionGroup(student.class);
  const reportSubjects = studentSession === SESSIONS[0]
    ? ['Membaca', 'Menulis', 'Berhitung', 'Bahasa Inggris']
    : ['Speaking', 'Writing', 'Reading', 'Listening'];

  const autoGeneratedComment = generateAutoComment(student, attRate, avgScore, assessments);
  const finalCommentDisplay = student.teacherComment || autoGeneratedComment;

  const handlePrintStudentReport = () => {
    const originalTitle = document.title;
    const safeName = student.name.replace(/\s+/g, '_');
    document.title = `${safeName}_report_${MONTHS[reportMonth-1]}_${reportYear}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  const getPrintBadge = (status) => {
     const colors = {
        Present: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Sick: 'bg-amber-100 text-amber-700 border-amber-200',
        Excused: 'bg-purple-100 text-purple-700 border-purple-200',
        Absent: 'bg-red-100 text-red-700 border-red-200',
     };
     const col = colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
     return <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border ${col}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0A0E17] p-4 rounded-xl border border-gray-800 shadow-sm gap-4 print-hidden">
        <div>
           <h2 className="text-xl font-bold text-white">My Academic Report</h2>
           <p className="text-sm text-gray-400">View and download your monthly progress report</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select className="bg-[#151B26] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00D4FF]" value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input type="number" className="bg-[#151B26] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-24 focus:border-[#00D4FF]" value={reportYear} onChange={e => setReportYear(Number(e.target.value))} />
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
             <Button onClick={handlePrintStudentReport} icon={Printer} className="flex-1 sm:flex-none">Print PDF</Button>
             <Button onClick={() => downloadPNG('report-print', `${student.name.replace(/\s+/g, '_')}_report`)} variant="secondary" icon={Download} title="Download Image" className="px-3" />
             <Button onClick={() => handleShareImage('report-print', `${student.name.replace(/\s+/g, '_')}_report`, `Academic Report for ${student.name}`)} variant="secondary" icon={Share2} title="Share" className="px-3" />
          </div>
        </div>
      </div>

      {/* Premium PDF Layout - Read Only */}
      <div className="w-full animation-fade-in relative text-slate-900 bg-white rounded-xl shadow-2xl p-8 print:p-6 print:shadow-none print:bg-transparent print:w-full font-sans max-w-5xl mx-auto" id="report-print">
        <div className="fixed inset-0 flex items-center justify-center opacity-[0.03] z-0 pointer-events-none hidden print:flex">
          <img src={LOGO_URL} className="w-[400px] h-auto grayscale" alt="watermark" />
        </div>

        <div className="relative z-10 bg-white">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b-[3px] border-[#1e3a8a] pb-4 mb-5 break-inside-avoid">
            <div className="flex items-center gap-4">
               <img src={LOGO_URL} className="h-16" style={{ filter: 'brightness(0)' }} alt="Logo" />
               <div>
                 <h1 className="text-2xl font-black text-[#1e3a8a] tracking-widest uppercase leading-none mb-1">English Club Gresik</h1>
                 <h2 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest">Monthly Academic Progress Report</h2>
               </div>
            </div>
            <div className="text-right hidden sm:block print:block">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Report Period</p>
               <p className="text-lg font-black text-[#1e3a8a] leading-none">{MONTHS[reportMonth - 1]} {reportYear}</p>
            </div>
          </div>

          {/* PROFILE & KPI GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 break-inside-avoid">
             <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
               <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                 <User size={16} className="text-[#1e3a8a]" />
                 <h3 className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-widest">Student Profile</h3>
               </div>
               <p className="text-lg font-black text-slate-800 leading-tight truncate">{student.name}</p>
               <p className="text-xs text-blue-600 font-bold mt-1 tracking-wide">{student.id}</p>
               <div className="mt-3 space-y-1.5 text-[10px] text-slate-600">
                  <div className="flex justify-between items-center"><span className="font-medium uppercase tracking-wider text-slate-400">Class Level</span> <span className="font-bold text-slate-800">{student.level} {student.class}</span></div>
                  <div className="flex justify-between items-center"><span className="font-medium uppercase tracking-wider text-slate-400">Session</span> <span className="font-bold text-slate-800">{studentSession}</span></div>
               </div>
             </div>
             
             <div className="lg:col-span-2 grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { label: 'Att. Rate', val: `${attRate}%`, col: attRate >= 75 ? 'text-emerald-600' : 'text-red-600' },
                  { label: 'Present', val: presentCount, col: 'text-blue-600' },
                  { label: 'Sick', val: sickCount, col: 'text-amber-500' },
                  { label: 'Excused', val: excusedCount, col: 'text-purple-600' },
                  { label: 'Absent', val: absentCount, col: 'text-red-600' },
                  { label: 'Avg Score', val: avgScore || '-', col: 'text-[#1e3a8a]' }
                ].map((k, i) => (
                  <div key={i} className="flex flex-col justify-center items-center bg-white border border-slate-200 rounded-xl p-2 shadow-sm text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 line-clamp-1">{k.label}</span>
                    <span className={`text-xl font-black leading-none ${k.col}`}>{k.val}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* TEACHER COMMENTS */}
          <div className="mb-6 break-inside-avoid">
             <div className="flex items-center gap-2 mb-2 px-1">
               <MessageSquare size={14} className="text-[#1e3a8a]" />
               <h3 className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest">Academic Advisor Comments</h3>
             </div>
             <div className="bg-[#f0f9ff] border-2 border-[#bae6fd] rounded-xl p-6 shadow-md relative overflow-hidden print-border-highlight">
                <div className="absolute -top-2 -left-2 text-blue-200/40 transform -rotate-6"><Quote size={64} /></div>
                <p className="text-[14px] italic text-[#0f172a] leading-relaxed relative z-10 font-bold text-justify">
                   "{finalCommentDisplay}"
                </p>
             </div>
          </div>

          {/* ASSESSMENT SECTION */}
          <div className="mb-6 break-inside-avoid">
            <div className="flex items-center gap-2 mb-2 px-1">
               <Award size={14} className="text-[#1e3a8a]" />
               <h3 className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest">Monthly Assessment Grades</h3>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs border-collapse bg-white">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider w-24">Period</th>
                    {reportSubjects.map(sub => (
                      <th key={sub} className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider">{sub}</th>
                    ))}
                    <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider bg-blue-50/50 w-20">Average</th>
                    <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider bg-blue-50/50 w-16">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.length > 0 ? assessments.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-700">{MONTHS[parseInt(a.month)-1].substring(0,3)} '{String(a.year).slice(2)}</td>
                      {reportSubjects.map(sub => {
                        const scoreStr = a.scores?.[sub];
                        const scoreNum = Number(scoreStr);
                        return (
                          <td key={sub} className="p-2.5">
                             {scoreStr ? (
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                   <span className="font-bold text-slate-800 text-[13px]">{scoreStr}</span>
                                   <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${scoreNum >= 90 ? 'bg-emerald-500' : scoreNum >= 75 ? 'bg-blue-500' : scoreNum >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width: `${Math.min(100, Math.max(0, scoreNum))}%`}}></div>
                                   </div>
                                </div>
                             ) : <span className="text-slate-400 font-medium block text-center">-</span>}
                          </td>
                        )
                      })}
                      <td className="p-2.5 text-center font-black text-[#1e3a8a] text-[14px] bg-blue-50/20">{a.average || '-'}</td>
                      <td className="p-2.5 text-center font-black text-blue-600 text-[14px] bg-blue-50/20">{a.grade || '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={reportSubjects.length + 3} className="p-4 text-center text-slate-500 font-medium italic bg-slate-50">No assessments recorded for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SESSION DETAIL LOG */}
          <div className="mb-8 break-inside-avoid">
            <div className="flex items-center gap-2 mb-2 px-1">
               <BookOpen size={14} className="text-[#1e3a8a]" />
               <h3 className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest">Session Detail & Attendance Log</h3>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {(() => {
                const uniqueDates = Array.from(new Set([...att.map(a => a.date), ...journals.map(j => j.date)]))
                  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                
                const combinedSessions = uniqueDates.map(date => {
                    const journalEntry = journals.find(j => j.date === date);
                    const attEntry = att.find(a => a.date === date);
                    return {
                        date: date,
                        topic: journalEntry?.topic || "No lesson record entered",
                        status: attEntry?.status || "-",
                        note: (journalEntry?.notes && journalEntry.notes.trim() !== "") ? journalEntry.notes : "Auto-generated from attendance data"
                    };
                });

                return combinedSessions.length > 0 ? (
                  <table className="w-full text-[11px] border-collapse bg-white">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider w-10">No.</th>
                        <th className="p-2.5 text-left font-bold text-slate-500 uppercase tracking-wider w-24">Date</th>
                        <th className="p-2.5 text-left font-bold text-slate-500 uppercase tracking-wider">Material / Topic</th>
                        <th className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider w-24">Status</th>
                        <th className="p-2.5 text-left font-bold text-slate-500 uppercase tracking-wider w-48 hidden sm:table-cell print:table-cell">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {combinedSessions.map((session, index) => (
                        <tr key={session.date} className="even:bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-center font-bold text-slate-400">{index + 1}</td>
                          <td className="p-2.5 whitespace-nowrap font-medium text-slate-700">{new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className={`p-2.5 font-medium ${session.topic === 'No lesson record entered' ? 'text-slate-400 italic' : 'text-slate-800'}`}>{session.topic}</td>
                          <td className="p-2.5 text-center">
                            {session.status !== '-' ? getPrintBadge(session.status) : <span className="text-slate-400">-</span>}
                          </td>
                          <td className="p-2.5 text-slate-500 italic text-[10px] hidden sm:table-cell print:table-cell leading-tight">{session.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center text-slate-500 font-medium italic bg-slate-50">
                    No attendance records available for this period.
                  </div>
                );
              })()}
            </div>
          </div>

          {/* PREMIUM SIGNATURE SECTION */}
          <div className="mt-8 pt-6 border-t-2 border-slate-100 flex justify-between items-end break-inside-avoid text-sm signature-section">
             <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest hidden sm:block print:block pb-2">
                Document automatically generated by system. <br/>
                Valid without physical signature.
             </div>
             <div className="text-center w-64">
               <p className="text-slate-600 mb-10 font-medium text-sm">Gresik, {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
               <p className="font-black text-slate-800 border-b border-slate-300 pb-1 mb-1 tracking-wide">Akhmad Akmal Rifqi</p>
               <p className="text-[10px] text-[#1e3a8a] font-bold uppercase tracking-widest">English Club Gresik</p>
             </div>
          </div>

          {/* FOOTER */}
          <div className="mt-10 pt-4 border-t border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex justify-between print-footer-content hidden print:flex">
             <span>English Club Gresik – Premium Report</span>
             <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  )
}
// ADD END

function RecycleBinModule({ db, setDb, showToast, requestConfirm }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const binItems = db.recycleBin || [];

  const toggleSelectOne = (binId) => {
    setSelectedIds((prev) => prev.includes(binId) ? prev.filter((id) => id !== binId) : [...prev, binId]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === binItems.length ? [] : binItems.map((b) => b.binId));
  };

  const handleRestore = (item) => {
    requestConfirm('Restore Item', 'Are you sure you want to restore this record?', () => {
      setDb((p) => ({ ...p, [item.originalCollection]: [...p[item.originalCollection], item.data], recycleBin: p.recycleBin.filter((x) => x.binId !== item.binId) }));
      showToast('Item Restored');
    });
  };

  const handlePermDelete = (binId) => {
    requestConfirm('Permanent Delete', 'WARNING: This will permanently delete the record. This cannot be undone. Continue?', () => {
      setDb((p) => ({ ...p, recycleBin: p.recycleBin.filter((x) => x.binId !== binId) }));
      setSelectedIds((prev) => prev.filter((id) => id !== binId));
      showToast('Permanently Deleted', 'error');
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    requestConfirm(
      'Permanent Delete Selected',
      `WARNING: This will permanently delete ${selectedIds.length} selected record(s). This cannot be undone. Continue?`,
      () => {
        setDb((p) => ({ ...p, recycleBin: p.recycleBin.filter((x) => !selectedIds.includes(x.binId)) }));
        showToast(`${selectedIds.length} item(s) permanently deleted`, 'error');
        setSelectedIds([]);
      }
    );
  };

  return (
    <Card className="p-0 overflow-x-auto">
      <div className="p-4 bg-[#0A0E17] border-b border-gray-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ArchiveRestore className="text-yellow-500" />
          <h3 className="font-semibold text-white">Recycle Bin</h3>
        </div>
        {binItems.length > 0 && (
          <Button
            variant="danger"
            className="text-xs px-3 py-2"
            icon={Trash}
            disabled={selectedIds.length === 0}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-[#0B0F19] border-b border-gray-800">
          <tr>
            <th className="p-4 text-center w-10">
              <input
                type="checkbox"
                className="w-4 h-4 cursor-pointer accent-[#00D4FF]"
                checked={binItems.length > 0 && selectedIds.length === binItems.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="p-4 text-center">Deleted At</th>
            <th className="p-4 text-center">Module Type</th>
            <th className="p-4 text-center">Data Summary</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {binItems.slice().reverse().map((b) => (
            <tr key={b.binId} className={`hover:bg-[#0B0F19] ${selectedIds.includes(b.binId) ? 'bg-[#00D4FF]/5' : ''}`}>
              <td className="p-4 text-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer accent-[#00D4FF]"
                  checked={selectedIds.includes(b.binId)}
                  onChange={() => toggleSelectOne(b.binId)}
                />
              </td>
              <td className="p-4 text-center">{new Date(b.deletedAt).toLocaleString()}</td>
              <td className="p-4 text-center capitalize text-[#00D4FF] font-medium">{b.originalCollection}</td>
              <td className="p-4 text-center text-gray-400 max-w-xs truncate">{JSON.stringify(b.data)}</td>
              <td className="p-4 text-center flex justify-center gap-2">
                <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => handleRestore(b)}><RefreshCw size={14} /> Restore</Button>
                <button onClick={() => handlePermDelete(b.binId)} className="p-1.5 text-red-500 bg-red-500/10 rounded hover:bg-red-500/20"><Trash size={16} /></button>
              </td>
            </tr>
          ))}
          {binItems.length === 0 && (
            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Recycle bin is empty.</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('ecg-styles')) {
  const style = document.createElement('style');
  style.id = 'ecg-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    .font-sans { font-family: 'Inter', sans-serif; }
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animation-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
    .receipt-pop { animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    
    @media print {
      @page {
        size: A4 portrait;
        margin: 5mm; 
      }
      body { 
        background: white !important; 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important; 
      }
      * { 
        text-shadow: none !important; 
        box-shadow: none !important; 
        letter-spacing: normal !important; /* FIX #2: BROKEN LETTER SPACING */
      }
      
      /* Smart PDF Compression Rules to Force 1 Page (FIX #1 & #4) */
      #report-print, #slip-print {
        width: 100%;
        zoom: 0.92; /* Safer scaling than transform for print layouts */
      }
      
      /* Aggressively reduce gaps for print to fit on 1 page */
      .mb-8 { margin-bottom: 0.5rem !important; }
      .mb-6 { margin-bottom: 0.5rem !important; }
      .mt-8 { margin-top: 0.5rem !important; }
      .mt-10 { margin-top: 0.5rem !important; }
      .p-8 { padding: 1rem !important; }
      .pb-4 { padding-bottom: 0.25rem !important; }
      .pt-4 { padding-top: 0.25rem !important; }
      .pt-6 { padding-top: 0.25rem !important; }
      .gap-4 { gap: 0.25rem !important; }
      td, th { padding: 0.2rem 0.3rem !important; }
      
      .signature-section { 
        page-break-inside: avoid !important; 
        break-inside: avoid !important;
        margin-top: 0 !important;
      }
      
      .print-hidden, aside, header.sticky { display: none !important; }
      .print-border { border: 1px solid #e5e7eb !important; }
      .print-border-highlight { border: 2px solid #bae6fd !important; }
      .print-border-gray-200 { border-color: #e5e7eb !important; }
      .print-border-gray-300 { border-color: #d1d5db !important; }
      .print-text-gray-900 { color: #111827 !important; }
      .print-text-black { color: #000 !important; }
      .print-bg-white { background-color: #fff !important; }
      .print-shadow-none { box-shadow: none !important; }
      
      html, body, #root, .h-screen, .overflow-y-auto, .flex-1, main {
        height: auto !important;
        overflow: visible !important;
        position: static !important;
      }
      
      tr, .break-inside-avoid, .signature-section { page-break-inside: avoid !important; break-inside: avoid !important; }
      h2, h3, h4 { page-break-after: avoid !important; }
      
      table.print-table { border-collapse: collapse; width: 100%; }
      thead.table-header-group { display: table-header-group; }
      tfoot.table-footer-group { display: table-footer-group; }
      
      /* FIX #3: Removed print-page-number::after CSS to prevent double page numbers */
    }
  `;
  document.head.appendChild(style);
}