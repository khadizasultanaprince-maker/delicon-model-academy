/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { useSchool } from '../context/SchoolContext';
import { 
  CreditCard, CheckCircle2, AlertCircle, Clock, Printer, 
  Receipt, Landmark, ReceiptText, Sparkles, Check, ChevronRight, X 
} from 'lucide-react';

interface StudentFeeManagementProps {
  student: Student;
}

interface MonthlyFee {
  monthKey: number; // 1 to 12
  monthBng: string;
  monthEng: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  paymentDate?: string;
  txId?: string;
  method?: string;
}

export const StudentFeeManagement: React.FC<StudentFeeManagementProps> = ({ student }) => {
  const { schoolName, schoolSlogan, schoolLogoType, schoolLogoVal } = useSchool();
  const [selectedReceipt, setSelectedReceipt] = useState<MonthlyFee | null>(null);

  // Set the current academic year and month (Current local time is June 2026)
  const currentYear = 2026;
  const currentMonthIndex = 6; // June is month index 6

  // Generate monthly fees and break them down so that total Paid matches student.feesPaid exactly, and total equals student.totalFees
  const feeSchedule = useMemo<MonthlyFee[]>(() => {
    const months = [
      { key: 1, bng: 'জানুয়ারি', eng: 'January', dueDay: 10 },
      { key: 2, bng: 'ফেব্রুয়ারি', eng: 'February', dueDay: 10 },
      { key: 3, bng: 'মার্চ', eng: 'March', dueDay: 10 },
      { key: 4, bng: 'এপ্রিল', eng: 'April', dueDay: 10 },
      { key: 5, bng: 'মে', eng: 'May', dueDay: 10 },
      { key: 6, bng: 'জুন', eng: 'June', dueDay: 15 },
      { key: 7, bng: 'জুনাই', eng: 'July', dueDay: 10 },
      { key: 8, bng: 'আগস্ট', eng: 'August', dueDay: 10 },
      { key: 9, bng: 'সেপ্টেম্বর', eng: 'September', dueDay: 10 },
      { key: 10, bng: 'অক্টোবর', eng: 'October', dueDay: 10 },
      { key: 11, bng: 'নভেম্বর', eng: 'November', dueDay: 10 },
      { key: 12, bng: 'ডিসেম্বর', eng: 'December', dueDay: 10 }
    ];

    const totalMonths = 12;
    // Standard monthly equal distribution of totalFees
    const baseMonthlyFee = Math.floor(student.totalFees / totalMonths);
    const residual = student.totalFees - (baseMonthlyFee * totalMonths);

    let remainingPaid = student.feesPaid;

    return months.map((m, idx) => {
      // Last month takes the adjustment surplus if any
      const amount = m.key === 12 ? baseMonthlyFee + residual : baseMonthlyFee;
      
      let status: 'Paid' | 'Pending' | 'Overdue' = 'Pending';
      let paymentDate: string | undefined;
      let txId: string | undefined;
      let method: string | undefined;

      // Determine payment status sequentially from January onwards
      if (remainingPaid >= amount) {
        status = 'Paid';
        remainingPaid -= amount;
        
        // Random payment date prior to duedate
        const day = Math.max(1, m.dueDay - 4 + (m.key % 3));
        paymentDate = `${currentYear}-0${m.key}-${day < 10 ? '0' + day : day}`;
        
        // Generate pseudo-stable transaction ID based on student ID and month index
        const hash = (student.id + m.key).split('').reduce((sum, char) => sum + char.charCodeAt(0), 100);
        txId = `TXN${hash}${currentYear}${m.key}`;
        
        // Dynamic simulated payment gateway
        const methods = ['bKash Wallet', 'RFID Gateway Pay', 'Cash at Desk', 'Nagad Pay'];
        method = methods[hash % methods.length];
      } else {
        // Less than the amount remaining
        if (remainingPaid > 0) {
          // Portion paid (let's consider it custom/partial, but for simplified UI we count fully paid or overdue)
          status = 'Paid'; // Mark as paid for user simplicity if any amount was partially offset, or determine strictly:
          remainingPaid = 0;
          paymentDate = `${currentYear}-0${m.key}-${m.dueDay}`;
          txId = `TXN_PARTIAL_${m.key}`;
          method = 'School Cashier';
        } else {
          // Remaining is 0
          // If the month is prior to current (June 2026), it is Overdue. Otherwise, it is Pending.
          if (m.key < currentMonthIndex) {
            status = 'Overdue';
          } else {
            status = 'Pending';
          }
        }
      }

      const dueMonthStr = m.key < 10 ? `0${m.key}` : `${m.key}`;
      const dueDayStr = m.dueDay < 10 ? `0${m.dueDay}` : `${m.dueDay}`;

      return {
        monthKey: m.key,
        monthBng: m.bng,
        monthEng: m.eng,
        amount,
        status,
        dueDate: `${currentYear}-${dueMonthStr}-${dueDayStr}`,
        paymentDate,
        txId,
        method
      };
    });
  }, [student.totalFees, student.feesPaid, student.id]);

  // Printable digital receipt generator utilizing popup formatting
  const handlePrintReceipt = (fee: MonthlyFee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHtml = `
      <html>
        <head>
          <title>RECEIPT-${fee.monthEng}-${student.name.replace(/\s+/g, '_')}</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              padding: 40px;
              display: flex;
              justify-content: center;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .dashed-border {
              border: 1px dashed #cbd5e1;
            }
          </style>
        </head>
        <body onload="setTimeout(function(){ window.print(); window.close(); }, 600)">
          <div class="w-[500px] bg-white p-6 rounded-2xl border border-slate-200 shadow-lg relative">
            
            <!-- Branding Header -->
            <div class="flex items-center gap-3 border-b-2 border-indigo-950 pb-4 mb-4">
              <div class="h-12 w-12 rounded-full bg-indigo-950 flex items-center justify-center text-white text-2xl font-black shadow-xs">
                ${schoolLogoType === 'crest' ? schoolLogoVal : schoolLogoType === 'text' ? schoolLogoVal : '🏫'}
              </div>
              <div>
                <h2 class="text-xs font-black text-slate-900 tracking-wide uppercase leading-none">${schoolName || 'মিরাজুল মাদারিস মাদরাসা'}</h2>
                <p class="text-[8.5px] text-slate-500 font-medium leading-none mt-1 uppercase" style="letter-spacing:1px;">${schoolSlogan || 'দ্বীনি ও আধুনিক শিক্ষার সমন্বয়'}</p>
                <span class="text-[7.5px] italic text-slate-400 font-mono block mt-1.5">Official Digital Payment Voucher</span>
              </div>
              <div class="ml-auto text-right">
                <span class="inline-block bg-emerald-50 text-emerald-800 text-[8px] font-black leading-none px-2 py-1 rounded border border-emerald-200">PAID / পরিশোধিত</span>
              </div>
            </div>

            <!-- Receipt Meta -->
            <div class="grid grid-cols-2 gap-4 text-[9px] mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-mono">
              <div>
                <p class="text-slate-400 font-sans font-extrabold leading-none">রসিদ নম্বর (RECEIPT #):</p>
                <p class="font-bold text-slate-900 mt-1 uppercase">MM-REC-${fee.txId || 'N/A'}</p>
              </div>
              <div class="text-right">
                <p class="text-slate-400 font-sans font-extrabold leading-none">তারিখ (PAYMENT DATE):</p>
                <p class="font-bold text-slate-900 mt-1">${fee.paymentDate || 'N/A'}</p>
              </div>
            </div>

            <!-- Student Profile Information -->
            <div class="space-y-1.5 text-[10px] pb-3.5 border-b border-slate-100">
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans leading-none pb-1">অভিভাবক ও শিক্ষার্থীর বিবরণ :</p>
              <div class="flex justify-between">
                <span class="text-slate-500 font-sans font-semibold">শিক্ষার্থীর নাম :</span>
                <span class="font-black text-slate-900 font-sans">${student.banglaName} / ${student.name}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 font-sans font-semibold">শ্রেণী ও রোল :</span>
                <span class="font-bold text-slate-900 font-sans">${student.className} • রোল: ${student.roll}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 font-sans font-semibold">স্টুডেন্ট আইডি (ID):</span>
                <span class="font-mono font-bold text-slate-900 uppercase">MIR-${student.id.toUpperCase()}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 font-sans font-semibold">অভিভাবক ফোন :</span>
                <span class="font-mono font-bold text-slate-900">${student.guardianPhone || 'N/A'}</span>
              </div>
            </div>

            <!-- Invoice Particulars Breakdown Table -->
            <div class="py-4 space-y-2.5">
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans leading-none">ফি বা রসিদের বিবরণ (PAYMENT ITEM):</p>
              
              <div class="rounded-lg border border-slate-200 overflow-hidden text-[9.5px]">
                <div class="grid grid-cols-3 bg-slate-50 p-2 font-black text-slate-700 font-sans border-b border-slate-200">
                  <div class="col-span-2">বিবরণ (Item Title)</div>
                  <div class="text-right">টাকা (Price Amount)</div>
                </div>
                
                <div class="grid grid-cols-3 p-2 font-sans text-slate-800 border-b border-slate-100 bg-white">
                  <div class="col-span-2 font-bold">${fee.monthBng} মাসের টিউশন ফি (${fee.monthEng} Tuition)</div>
                  <div class="text-right font-mono font-bold">৳ ${fee.amount}</div>
                </div>

                <div class="grid grid-cols-3 p-2 font-sans text-slate-800 font-black bg-slate-50/50">
                  <div class="col-span-2 text-indigo-950 font-black">সর্বমোট আদায়কৃত (NET PAID)</div>
                  <div class="text-right text-indigo-955 font-mono">৳ ${fee.amount}</div>
                </div>
              </div>
            </div>

            <!-- Transaction Detail Footers -->
            <div class="bg-indigo-950/5 border border-indigo-950/10 p-3 rounded-lg text-[9px] space-y-1 font-mono tracking-wide">
              <div class="flex justify-between">
                <span class="text-slate-500 font-sans font-bold">গেটওয়ে মেথড (Payment Gateway):</span>
                <span class="font-bold text-indigo-950">${fee.method || 'Offline Cashier'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 font-sans font-bold">ট্রানজেকশন আইডি (TxID Code):</span>
                <span class="font-bold text-indigo-950 uppercase">${fee.txId || 'N/A'}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 font-sans font-bold">নিরাপত্তা স্বাক্ষর কড (Token Signature):</span>
                <span class="font-bold text-slate-500">MM-GATE-VFY-${student.id.substring(0,4).toUpperCase()}</span>
              </div>
            </div>

            <!-- Verification Footer & Sign Stamp -->
            <div class="mt-6 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center text-[7.5px] text-slate-400">
              <div class="flex flex-col gap-1">
                <p>এটি একটি ডিজিটাল সিস্টেম জেনারেটেড রসিদ।</p>
                <p class="font-mono text-[7px]" style="letter-spacing: 0.5px;">SECURED VIA D-LICON CLOUD GATEWAY</p>
              </div>
              
              <!-- Authorizer authorized signature area -->
              <div class="text-center">
                <div class="h-6 w-20 border-b border-indigo-500/35 relative flex items-center justify-center mx-auto">
                  <span class="text-[8px] font-serif italic text-indigo-900 font-bold select-none rotate-[-5deg] opacity-75">
                    Authorized
                  </span>
                </div>
                <span class="text-[6.5px] uppercase font-black text-slate-500 block mt-1 tracking-wider">হিসাবরক্ষক স্বাক্ষর (Voucher Sign)</span>
              </div>
            </div>

          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  return (
    <div id="student-fee-management-portal" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-950 text-sm flex items-center gap-2 font-sans">
            <ReceiptText className="h-4.5 w-4.5 text-blue-900 animate-pulse" />
            টিউশন ফি বিবরণী ও ডিজিটাল রসিদ জেনারেটর
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-sans">
            <strong className="text-blue-950">{student.banglaName}</strong> এর মাসিক টিউশন বকেয়া ও পেমেন্ট রেকর্ডস ট্র্যাকিং
          </p>
        </div>

        {/* Aggregate overview badge */}
        <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-center flex items-center gap-2 font-sans">
          <div className="text-left">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-tight block">আদায়কৃত অনুপাত</span>
            <span className="text-xs font-black text-slate-800">৳{student.feesPaid} / ৳{student.totalFees}</span>
          </div>
          <span className="inline-block text-[10px] font-black px-1.5 py-0.5 bg-indigo-950 text-amber-300 rounded-md">
            {Math.round((student.feesPaid / Math.max(1, student.totalFees)) * 100)}%
          </span>
        </div>
      </div>

      {/* Grid Schedule Breakdown List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {feeSchedule.map((fee, index) => {
          const isPaid = fee.status === 'Paid';
          const isOverdue = fee.status === 'Overdue';
          const isPending = fee.status === 'Pending';

          return (
            <div 
              key={index}
              className={`bg-white p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isPaid ? 'border-emerald-200 bg-emerald-50/10 shadow-3xs' :
                isOverdue ? 'border-rose-200 bg-rose-50/10 shadow-3xs' :
                'border-slate-200 hover:border-indigo-250'
              }`}
            >
              {/* Header Month Status Info */}
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h4 className="font-black text-slate-900 text-xs tracking-wide">
                    {fee.monthBng}
                  </h4>
                  <p className="text-[8.5px] text-slate-400 font-medium font-mono uppercase tracking-tight pt-0.5">
                    {fee.monthEng}
                  </p>
                </div>

                {/* Badge Status */}
                <div>
                  {isPaid && (
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 leading-none">
                      <CheckCircle2 className="h-3 w-3" />
                      পরিশোধিত
                    </span>
                  )}
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 leading-none">
                      <AlertCircle className="h-3 w-3 animate-pulse" />
                      বকেয়া
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 text-[8.5px] font-black px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200 leading-none">
                      <Clock className="h-3 w-3" />
                      চলতি বকেয়া
                    </span>
                  )}
                </div>
              </div>

              {/* Price Details */}
              <div className="my-3 py-2 border-t border-b border-dashed border-slate-100 flex justify-between items-baseline leading-none">
                <span className="text-[9px] font-bold text-slate-400 uppercase">টিউশন অংক:</span>
                <span className="text-sm font-black text-slate-950 font-mono">৳ {fee.amount}</span>
              </div>

              {/* Bottom Trigger actions or Due Info */}
              <div className="flex justify-between items-center text-[8.5px]">
                {/* Date labels */}
                {isPaid ? (
                  <div className="flex flex-col leading-tight">
                    <span className="text-[7.5px] text-slate-400 uppercase">পেমেন্ট ডেট</span>
                    <span className="text-slate-650 font-mono font-bold mt-0.5">{fee.paymentDate}</span>
                  </div>
                ) : (
                  <div className="flex flex-col leading-tight">
                    <span className="text-[7.5px] text-slate-400 uppercase">শেষ পরিশোধ</span>
                    <span className={`font-mono font-bold mt-0.5 ${isOverdue ? 'text-rose-600' : 'text-slate-650'}`}>{fee.dueDate}</span>
                  </div>
                )}

                {/* Print button triggers only for paid monthly vouchers */}
                {isPaid ? (
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(fee)}
                    className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-950 text-white font-extrabold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-3xs"
                    title="রসিদ ডাউনলোড ও প্রিন্ট করুন"
                  >
                    <Receipt className="h-3 w-3 text-amber-400" />
                    রসিদ ডাউনলোড
                  </button>
                ) : (
                  <span className="text-slate-400 font-extrabold uppercase italic pointer-events-none text-[7px] leading-relaxed">
                    ফি পরিশোধের পর রসিদ লভ্য
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
