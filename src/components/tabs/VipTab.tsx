import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Crown, 
  Stethoscope, 
  Compass, 
  BookOpen, 
  HeartHandshake, 
  Flame, 
  CheckCircle2, 
  Lock, 
  Bell, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  X,
  Clock
} from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface VipFeature {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  bgGlow: string;
  details: string[];
  previewSnippet: string;
}

const VIP_FEATURES: VipFeature[] = [
  {
    id: 'trick',
    title: 'A Trick',
    subtitle: 'Hidden Biohacks & Ancient Remedies',
    badge: 'Secret Protocols',
    icon: Flame,
    color: 'text-amber-500',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    bgGlow: 'border-amber-500/30 dark:border-amber-500/20',
    previewSnippet: 'Daily 2-minute physiological micro-hacks that instantly reset autonomic balance, curb sugar spikes, and deepen restorative sleep.',
    details: [
      'The 90-second cold water vagal dive technique to stop acute anxiety',
      'The raw ginger + Himalayan pink salt morning liver drainage ritual',
      'Circadian timing trick: When to view infrared photons to double deep sleep',
      'Ancient Ethiopian seed infusion for immediate digestive bloat relief'
    ]
  },
  {
    id: 'talk-to-doc',
    title: 'Talk to Doc',
    subtitle: 'Direct 1-on-1 Holistic Physician Access',
    badge: 'Doctor On-Demand',
    icon: Stethoscope,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    bgGlow: 'border-emerald-500/30 dark:border-emerald-500/20',
    previewSnippet: 'Private, confidential chat messaging and scheduled voice consults with certified naturopaths and holistic medical doctors.',
    details: [
      'Personalized lab review and bloodwork biomarker analysis',
      'Customized herbal and botanical prescription formulation',
      'Non-pharmaceutical sleep, anxiety, and metabolic healing plans',
      'Continuous 24-hour turnaround for all urgent health inquiries'
    ]
  },
  {
    id: 'way-to-health',
    title: 'A Way to Health',
    subtitle: 'Personalized Daily Longevity Blueprint',
    badge: 'Health Roadmap',
    icon: Compass,
    color: 'text-teal-500',
    gradient: 'from-teal-500/20 via-cyan-500/10 to-transparent',
    bgGlow: 'border-teal-500/30 dark:border-teal-500/20',
    previewSnippet: 'A step-by-step diagnostic journey tailored to your unique biological constitution, metabolic rate, and stress thresholds.',
    details: [
      'Constitutional Dosha & body-type diagnostic assessment',
      'Microbiome renewal 4-week structured gut restoration protocol',
      'Cardiovascular flexibility and Heart Rate Variability (HRV) targets',
      'Cellular autophagy and fasting schedule built around your schedule'
    ]
  },
  {
    id: 'free-book',
    title: 'Free Book to Read',
    subtitle: 'Unlimited Access to Complete Library',
    badge: 'All-Access Pass',
    icon: BookOpen,
    color: 'text-indigo-500',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    bgGlow: 'border-indigo-500/30 dark:border-indigo-500/20',
    previewSnippet: 'Never pay for individual treatises. VIP members unlock every current and future Tena Holistic book, audiobook, and clinical PDF for free.',
    details: [
      'Instant unlocked reading of all premium and paid books',
      'Offline reader downloads directly in Telegram',
      'Exclusive audio narration narrated by lead doctors',
      'Annotated clinical bibliographies with peer-reviewed medical citations'
    ]
  },
  {
    id: 'motivation-doctor',
    title: 'Motivation with Doctor',
    subtitle: 'Daily Mindset & Clinical Inspiration',
    badge: 'Daily Doctor Pep Talks',
    icon: HeartHandshake,
    color: 'text-rose-500',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    bgGlow: 'border-rose-500/30 dark:border-rose-500/20',
    previewSnippet: 'Every morning, receive an exclusive 3-minute voice memo from our chief medical officer to elevate mental fortitude and purposeful living.',
    details: [
      'Daily 8:00 AM clinical audio pep talk directly in your feed',
      'Somatic reframing techniques for burnout, doubt, and mental fog',
      'Weekly live voice Q&A room with Dr. Selamawit Tena',
      'Compassionate accountability checks to sustain your wellness streak'
    ]
  }
];

export const VipTab: React.FC = () => {
  const [isJoinedWaitlist, setIsJoinedWaitlist] = useState<boolean>(() => {
    return localStorage.getItem('tena_vip_waitlist') === 'true';
  });
  const [selectedFeature, setSelectedFeature] = useState<VipFeature | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleJoinWaitlist = () => {
    triggerHaptic('success');
    const nextState = !isJoinedWaitlist;
    setIsJoinedWaitlist(nextState);
    localStorage.setItem('tena_vip_waitlist', String(nextState));
    if (nextState) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-emerald-500/30"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>You're on the Tena VIP Early Access List!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO BANNER WITH MOTION GRAPHICS */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F221B] via-[#122A21] to-[#0A1813] text-white p-5 sm:p-6 border border-emerald-500/30 shadow-xl"
      >
        {/* Animated Background Mesh Glow */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 space-y-3">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-md"
            >
              <Crown className="w-3.5 h-3.5 fill-stone-950" />
              <span>VIP Privilege</span>
            </motion.div>

            <motion.div
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            >
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Coming Soon</span>
            </motion.div>
          </div>

          <div>
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Tena Holistic VIP
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-md leading-relaxed">
              An elite sanctum of continuous wellness, direct doctor consultations, secret biohacks, and unlimited literature.
            </p>
          </div>

          {/* Waitlist CTA Box */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-emerald-500/20 mt-3">
            <div className="text-left">
              <span className="text-[11px] text-emerald-200/70 block">Early Member Allocation</span>
              <span className="text-xs font-semibold text-amber-300">
                842 wellness seekers on waitlist
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleJoinWaitlist}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isJoinedWaitlist
                  ? 'bg-emerald-600/60 text-emerald-200 border border-emerald-400/50'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 hover:brightness-110'
              }`}
            >
              {isJoinedWaitlist ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Waitlist Joined (#843)</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Notify Me When Live</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* SECTION TITLE */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-serif-heading text-lg font-bold text-stone-900 dark:text-stone-100">
            Exclusive VIP Offerings
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Tap any card to preview full details & clinical protocols
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
          5 Core Modules
        </span>
      </div>

      {/* ANIMATED CARD LAYOUT WITH MOTION GRAPHICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {VIP_FEATURES.map((feature, idx) => {
          const IconComponent = feature.icon;
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                triggerHaptic('light');
                setSelectedFeature(feature);
              }}
              className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-white dark:bg-[#121B17] border ${feature.bgGlow} shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group`}
            >
              {/* Subtle Animated Top-Right Gradient Wash */}
              <div 
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.gradient} rounded-bl-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`}
              />

              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <IconComponent className={`w-5 h-5 ${feature.color}`} />
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    <span>{feature.badge}</span>
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-serif-heading font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 mb-2">
                  {feature.subtitle}
                </p>

                {/* Snippet */}
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {feature.previewSnippet}
                </p>
              </div>

              {/* Card Footer action with arrow */}
              <div className="pt-3.5 mt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                <span className="flex items-center gap-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  <span>Explore preview</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-mono text-stone-500">
                  VIP Only
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* BOTTOM PERKS STRIP */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <p className="text-xs text-stone-700 dark:text-stone-300">
          All VIP doctor conversations and holistic blueprints are cryptographically secured and strictly private under medical confidentiality guidelines.
        </p>
      </motion.div>

      {/* FEATURE PREVIEW MODAL */}
      <AnimatePresence>
        {selectedFeature && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedFeature(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white dark:bg-[#121B17] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center">
                    <selectedFeature.icon className={`w-4 h-4 ${selectedFeature.color}`} />
                  </div>
                  <div>
                    <h3 className="font-serif-heading font-bold text-sm text-stone-900 dark:text-stone-100">
                      {selectedFeature.title}
                    </h3>
                    <p className="text-[10px] text-stone-500">
                      {selectedFeature.badge}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                    {selectedFeature.subtitle}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {selectedFeature.previewSnippet}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    What will be included:
                  </span>
                  <div className="space-y-2">
                    {selectedFeature.details.map((item, i) => (
                      <div 
                        key={i} 
                        className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800/80 flex items-start gap-2.5 text-xs text-stone-700 dark:text-stone-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-300/40 text-xs text-amber-900 dark:text-amber-200">
                  <strong>Coming Soon in Tena VIP Release</strong>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                    This feature will be unlocked for all waitlist members on public launch day.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
                <button
                  onClick={() => {
                    handleJoinWaitlist();
                    setSelectedFeature(null);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer shadow-xs"
                >
                  {isJoinedWaitlist ? 'You are on the Waitlist' : 'Join VIP Waitlist For This'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
