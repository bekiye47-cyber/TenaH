import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon, 
  CreditCard,
  Copy,
  Check,
  Building2,
  Smartphone
} from 'lucide-react';
import { walletService } from '../../services/walletService';
import { triggerHaptic } from '../../lib/telegram';
import { WalletTransaction } from '../../types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramId: number;
  onSuccess: (tx: WalletTransaction) => void;
}

const PRESET_USD = [10, 25, 50, 100];
const PRESET_ETB = [500, 1000, 2500, 5000];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  telegramId,
  onSuccess,
}) => {
  // Currency selection: USD or ETB (Birr)
  const [currency, setCurrency] = useState<'USD' | 'ETB'>('ETB'); // default Birr or USD
  const [usdAmount, setUsdAmount] = useState<number>(25);
  const [etbAmount, setEtbAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<WalletTransaction | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentAmount = isCustom 
    ? (parseFloat(customAmount) || 0)
    : (currency === 'ETB' ? etbAmount : usdAmount);

  const copyToClipboard = (text: string, key: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select an image file (PNG, JPG, or WEBP).');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setErrorMsg(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) {
      setErrorMsg('Please enter a valid deposit amount.');
      return;
    }
    if (!selectedFile) {
      setErrorMsg('Please upload a screenshot of your payment receipt or transfer slip.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const result = await walletService.submitDeposit(
        telegramId,
        currentAmount,
        selectedFile,
        currency
      );
      if (result.success && result.transaction) {
        triggerHaptic('success');
        setSuccessTx(result.transaction);
        onSuccess(result.transaction);
      } else {
        triggerHaptic('error');
        setErrorMsg(result.error || 'Failed to submit deposit. Please try again.');
      }
    } catch (err: any) {
      triggerHaptic('error');
      setErrorMsg(err.message || 'Error uploading payment proof.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSuccessTx(null);
    setErrorMsg(null);
    setIsCustom(false);
    setCustomAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#121B17] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                Deposit Funds
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Choose between Dollar ($) or Birr (ETB)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              handleClose();
            }}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {successTx ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif-heading text-lg font-bold text-stone-900 dark:text-stone-100">
                Deposit Request Submitted!
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xs mx-auto leading-relaxed">
                Your payment proof for{' '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                  {successTx.currency === 'ETB' ? `${successTx.amount} Birr` : `$${successTx.amount.toFixed(2)}`}
                </strong>{' '}
                has been received.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-300/40 text-[11px] text-amber-900 dark:text-amber-200 text-left">
                <div className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Status: Pending Verification</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">
                  Our admin team verifies transfer slips quickly. Your balance will credit as soon as confirmed.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors mt-4 shadow-sm"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* CURRENCY SELECTOR: Dollar vs Birr */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5">
                  Select Currency
                </label>
                <div className="grid grid-cols-2 gap-2 bg-stone-100 dark:bg-stone-900 p-1 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setCurrency('ETB');
                      setIsCustom(false);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      currency === 'ETB'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <span>Ethiopian Birr (ETB)</span>
                    <span className="text-[10px] opacity-80 font-normal">ብር</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setCurrency('USD');
                      setIsCustom(false);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      currency === 'USD'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <span>US Dollar (USD)</span>
                    <span className="text-[10px] opacity-80 font-normal">$</span>
                  </button>
                </div>
              </div>

              {/* PAYMENT ACCOUNT INSTRUCTIONS (Dynamic for Birr vs Dollar) */}
              {currency === 'ETB' ? (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/20 text-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-semibold text-xs">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ethiopian Birr Transfer Accounts</span>
                  </div>

                  {/* Telebirr */}
                  <div className="p-2 bg-white dark:bg-[#121B17] rounded-xl border border-emerald-950/10 dark:border-emerald-500/10 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[11px] text-stone-900 dark:text-stone-100">
                        Telebirr Mobile Pay
                      </div>
                      <div className="font-mono text-xs text-emerald-800 dark:text-emerald-300">
                        0911234567
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('0911234567', 'telebirr')}
                      className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center gap-1"
                    >
                      {copiedKey === 'telebirr' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'telebirr' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Commercial Bank of Ethiopia (CBE) */}
                  <div className="p-2 bg-white dark:bg-[#121B17] rounded-xl border border-emerald-950/10 dark:border-emerald-500/10 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[11px] text-stone-900 dark:text-stone-100">
                        Commercial Bank of Ethiopia (CBE)
                      </div>
                      <div className="font-mono text-xs text-emerald-800 dark:text-emerald-300">
                        1000234567891
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('1000234567891', 'cbe')}
                      className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center gap-1"
                    >
                      {copiedKey === 'cbe' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'cbe' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="text-[10px] text-stone-500 dark:text-stone-400">
                    Account Name: <strong>Tena Holistic Wellness</strong>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/20 text-xs space-y-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-semibold text-xs">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>USD Global Payment Accounts</span>
                  </div>

                  {/* Telegram / TON Wallet */}
                  <div className="p-2 bg-white dark:bg-[#121B17] rounded-xl border border-emerald-950/10 dark:border-emerald-500/10 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[11px] text-stone-900 dark:text-stone-100">
                        Telegram Pay / TON
                      </div>
                      <div className="font-mono text-xs text-emerald-800 dark:text-emerald-300">
                        @tena_treasury
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('@tena_treasury', 'tg')}
                      className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center gap-1"
                    >
                      {copiedKey === 'tg' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'tg' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* USDT / Crypto */}
                  <div className="p-2 bg-white dark:bg-[#121B17] rounded-xl border border-emerald-950/10 dark:border-emerald-500/10 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[11px] text-stone-900 dark:text-stone-100">
                        USDT (TRC-20)
                      </div>
                      <div className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 truncate max-w-[170px]">
                        TY9xJ8KenaH0listic987Tr20
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('TY9xJ8KenaH0listic987Tr20', 'usdt')}
                      className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center gap-1"
                    >
                      {copiedKey === 'usdt' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'usdt' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AMOUNT SELECTION (PRESETS + CUSTOM) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Select {currency === 'ETB' ? 'Birr' : 'Dollar'} Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {(currency === 'ETB' ? PRESET_ETB : PRESET_USD).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setIsCustom(false);
                        if (currency === 'ETB') setEtbAmount(val);
                        else setUsdAmount(val);
                      }}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        !isCustom && (currency === 'ETB' ? etbAmount === val : usdAmount === val)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-emerald-500/50'
                      }`}
                    >
                      {currency === 'ETB' ? `${val} ብር` : `$${val}`}
                    </button>
                  ))}
                </div>

                {/* Custom Amount input */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-stone-400">
                    {currency === 'ETB' ? 'ETB' : '$'}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step={currency === 'ETB' ? '10' : '0.5'}
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setIsCustom(true);
                    }}
                    placeholder={`Or enter custom ${currency === 'ETB' ? 'Birr' : 'Dollar'} amount...`}
                    className="w-full pl-11 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121B17] text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 selectable-text"
                  />
                </div>
              </div>

              {/* PAYMENT PROOF UPLOAD */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Attach Transfer Slip / Receipt (Screenshot)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    selectedFile
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 bg-stone-50/50 dark:bg-stone-900/30'
                  }`}
                >
                  {previewUrl ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-emerald-500/30 shadow-xs"
                      />
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {selectedFile?.name}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB &bull; Tap to replace
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Ready
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-2">
                      <div className="w-9 h-9 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-medium text-stone-700 dark:text-stone-300">
                        <span>Click to upload or drag screenshot</span>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        PNG, JPG, or WEBP receipts from Telebirr, CBE, or Bank app
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300/40 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || currentAmount <= 0}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading & Submitting...</span>
                  </>
                ) : (
                  <span>
                    Submit Deposit ({currency === 'ETB' ? `${currentAmount} Birr` : `$${currentAmount}`})
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
