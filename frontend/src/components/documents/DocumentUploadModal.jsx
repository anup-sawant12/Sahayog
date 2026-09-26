import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileCheck,
  File,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import documentApi from '../../services/document.api';

const DOCUMENT_DEFINITIONS = [
  {
    type: 'IDENTITY_PROOF',
    label: 'Identity Proof',
    desc: 'Government ID: Aadhaar Card, Voter ID, Passport, or Driving License',
  },
  {
    type: 'PAN_CARD',
    label: 'PAN Card',
    desc: 'Official Permanent Account Number card issued by Income Tax Department',
  },
  {
    type: 'ADDRESS_PROOF',
    label: 'Address Proof',
    desc: 'Recent Electricity Bill, Ration Card, or Registered Rent Agreement',
  },
  {
    type: 'TRADE_CERTIFICATE',
    label: 'Trade Certificate',
    desc: 'ITI, Skill India, Vocational Training, or Technical Trade Certificate',
  },
  {
    type: 'POLICE_VERIFICATION',
    label: 'Police Verification',
    desc: 'Police clearance certificate or verification character certificate',
  },
];

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DocumentUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
  existingDocuments = [],
  preselectedType = null,
  isReplacement = false,
}) => {
  const [selectedType, setSelectedType] = useState(preselectedType || 'IDENTITY_PROOF');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);

  // Sync preselected type if passed
  useEffect(() => {
    if (preselectedType) {
      setSelectedType(preselectedType);
    } else {
      // Find first type that is not yet verified or pending
      const uploadedTypes = existingDocuments
        .filter((d) => d.verificationStatus !== 'REJECTED')
        .map((d) => d.documentType);
      const available = DOCUMENT_DEFINITIONS.find((d) => !uploadedTypes.includes(d.type));
      if (available) {
        setSelectedType(available.type);
      }
    }
  }, [preselectedType, existingDocuments, isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setErrorMessage('');
      setSuccessMessage('');
      setUploadProgress(0);
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateFile = (file) => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return false;
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `Invalid file type ".${ext}". Only PDF, JPG, JPEG, and PNG files are allowed.`
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum limit of 10 MB.`
      );
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a document file.');
      return;
    }

    if (!selectedType) {
      setErrorMessage('Please choose a document type.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setUploadProgress(10);

    try {
      // Build FormData for upload
      const formData = new FormData();
      formData.append('documentType', selectedType);
      formData.append('file', selectedFile);

      const response = await documentApi.uploadDocument(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setUploadProgress(100);
      setSuccessMessage(
        response.message || 'Document uploaded successfully! It is now pending verification.'
      );

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to upload document. Please verify your file and try again.';
      setErrorMessage(msg);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: isReplacement ? '#fef3c7' : '#f0fdfa',
                color: isReplacement ? '#d97706' : '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isReplacement ? <RefreshCw size={22} /> : <UploadCloud size={22} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {isReplacement ? 'Replace Rejected Document' : 'Upload Verification Document'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Securely submit compliance documents for platform verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Replacement Alert Notice */}
            {isReplacement && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  color: '#92400e',
                  fontSize: '13px',
                }}
              >
                <RefreshCw size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Replacement Mode:</strong> You are submitting a new document to replace the previously rejected record. Once uploaded, its status will become <strong>Pending</strong> for admin re-verification.
                </div>
              </div>
            )}

            {/* Document Type Selector */}
            <div>
              <label
                htmlFor="documentType"
                style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}
              >
                Document Type <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <select
                id="documentType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={isUploading || isReplacement}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: isReplacement ? '#f1f5f9' : '#ffffff',
                  fontSize: '14px',
                  color: '#0f172a',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: isReplacement ? 'not-allowed' : 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                {DOCUMENT_DEFINITIONS.map((def) => {
                  const alreadyDoc = existingDocuments.find((d) => d.documentType === def.type);
                  const isRejected = alreadyDoc?.verificationStatus === 'REJECTED';
                  const isUploaded = !!alreadyDoc && !isRejected;

                  return (
                    <option
                      key={def.type}
                      value={def.type}
                      disabled={isUploaded && def.type !== preselectedType}
                    >
                      {def.label} {isUploaded ? '(Already Uploaded)' : isRejected ? '(Rejected - Can Replace)' : ''}
                    </option>
                  );
                })}
              </select>

              {/* Selected Type Description */}
              {selectedType && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>
                  {DOCUMENT_DEFINITIONS.find((d) => d.type === selectedType)?.desc}
                </p>
              )}
            </div>

            {/* Drag and Drop Upload Area */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Select or Drop File <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? '#0d9488' : '#cbd5e1'}`,
                  borderRadius: '16px',
                  padding: '28px 20px',
                  textAlign: 'center',
                  background: dragActive ? '#f0fdfa' : '#f8fafc',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <UploadCloud size={28} />
                </div>

                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  Click to browse or drag and drop document here
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Supported Formats: PDF, JPG, JPEG, PNG (Max size: 10 MB)
                </div>
              </div>
            </div>

            {/* Selected File Details Chip */}
            {selectedFile && (
              <div
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: '#0d9488',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <File size={20} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Document'}
                    </div>
                  </div>
                </div>

                {!isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Upload Progress Bar */}
            {isUploading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                  <span>Uploading document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)',
                      borderRadius: '9999px',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#b91c1c',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#15803d',
                  fontSize: '13px',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: isUploading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                background: !selectedFile || isUploading ? '#94a3b8' : '#0d9488',
                border: 'none',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.25)',
                transition: 'background 0.15s ease',
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileCheck size={16} />
                  {isReplacement ? 'Submit Replacement' : 'Upload Document'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
