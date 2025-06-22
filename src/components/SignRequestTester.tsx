import React, { useState, useEffect } from 'react';
import { FileSignature, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SignRequestResponse {
  embed_url: string;
  document_id?: string;
  signrequest_id?: string;
}

export default function SignRequestTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Auto-load the SignRequest embed on component mount
  useEffect(() => {
    loadSignRequestEmbed();
  }, []);

  const loadSignRequestEmbed = async () => {
    setIsLoading(true);
    setError('');
    setEmbedUrl('');
    setStatus('loading');

    try {
      // Using environment variables for the Supabase configuration
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing. Please check your .env file.');
      }

      const functionUrl = `${supabaseUrl}/functions/v1/create-signrequest-document`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = data as SignRequestResponse;
      if (result.embed_url) {
        setEmbedUrl(result.embed_url);
        setStatus('success');
      } else {
        throw new Error('No embed URL returned from the function');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Creating SignRequest document...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">SignRequest embed loaded successfully!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-3 text-red-600">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Failed to load SignRequest embed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-3 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Ready to load SignRequest</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FileSignature className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SignRequest Demo</h1>
                <p className="text-gray-600">Live document signing integration</p>
              </div>
            </div>
            <button
              onClick={loadSignRequestEmbed}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Reload Document'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Status Bar */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          {getStatusDisplay()}
          {error && (
            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Error Details:</p>
              <p className="text-sm text-red-600 mt-1 font-mono">{error}</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {embedUrl ? (
            <div className="relative">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Document Ready for Signing</p>
                    <p className="text-xs text-green-600 font-mono truncate max-w-md">{embedUrl}</p>
                  </div>
                </div>
              </div>
              <div className="relative bg-gray-50">
                <iframe
                  src={embedUrl}
                  className="w-full h-[800px] border-0"
                  title="SignRequest Document"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Loading SignRequest embed...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[800px] flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md mx-auto p-8">
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Creating Your Document
                    </h3>
                    <p className="text-gray-600">
                      Setting up the SignRequest document with your template...
                    </p>
                  </>
                ) : status === 'error' ? (
                  <>
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Unable to Load Document
                    </h3>
                    <p className="text-gray-600 mb-4">
                      There was an issue creating the SignRequest document. Please check your configuration.
                    </p>
                    <button
                      onClick={loadSignRequestEmbed}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </>
                ) : (
                  <>
                    <FileSignature className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      SignRequest Document
                    </h3>
                    <p className="text-gray-600">
                      Your document will appear here once loaded
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Demo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Template Used</h4>
              <p className="text-blue-700">Subscription Agreement Template</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-1">Test Signer</h4>
              <p className="text-green-700">test.signer@example.com</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-1">Integration</h4>
              <p className="text-purple-700">Supabase Edge Function</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}