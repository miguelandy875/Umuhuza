import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { reportsApi } from '../../api/reports';
import Button from './Button';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId?: number;
  userId?: number;
  reportType: 'listing' | 'user';
  itemTitle?: string; // For display purposes
}

const REPORT_TYPES = [
  { value: 'spam', label: 'Spam or Misleading', description: 'This content is spam or misleading' },
  { value: 'fraud', label: 'Fraud or Scam', description: 'This appears to be fraudulent or a scam' },
  { value: 'inappropriate', label: 'Inappropriate Content', description: 'Contains inappropriate or offensive content' },
  { value: 'duplicate', label: 'Duplicate Listing', description: 'This is a duplicate of another listing' },
  { value: 'harassment', label: 'Harassment', description: 'This user is harassing me or others' },
  { value: 'other', label: 'Other', description: 'Other reason not listed above' },
];

export default function ReportModal({
  isOpen,
  onClose,
  listingId,
  userId,
  reportType,
  itemTitle,
}: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [reason, setReason] = useState('');

  const reportMutation = useMutation({
    mutationFn: reportsApi.create,
    onSuccess: () => {
      toast.success('Report submitted successfully. We\'ll review it soon.');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit report');
    },
  });

  const handleClose = () => {
    setSelectedType('');
    setReason('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast.error('Please select a reason for reporting');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide details about your report');
      return;
    }

    if (reason.trim().length < 20) {
      toast.error('Please provide at least 20 characters explaining your report');
      return;
    }

    reportMutation.mutate({
      listing_id: listingId,
      reported_userid: userId,
      report_type: selectedType as any,
      report_reason: reason.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Report {reportType === 'listing' ? 'Listing' : 'User'}
              </h2>
              {itemTitle && (
                <p className="text-sm text-gray-600 mt-1">
                  "{itemTitle}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Please report responsibly</p>
              <p>
                False reports may result in action against your account. Only report content
                that genuinely violates our policies.
              </p>
            </div>
          </div>

          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Why are you reporting this {reportType}? *
            </label>
            <div className="space-y-2">
              {REPORT_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedType === type.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="report_type"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        selectedType === type.value
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedType === type.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{type.label}</p>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please provide additional details *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you're reporting this. Include any relevant details that will help us review your report..."
              rows={6}
              className="input resize-none"
              maxLength={1000}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500">
                Minimum 20 characters required
              </p>
              <p className="text-sm text-gray-500">
                {reason.length} / 1000
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={reportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1"
              isLoading={reportMutation.isPending}
            >
              <Flag className="w-4 h-4" />
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
