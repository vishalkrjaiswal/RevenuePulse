
import { useEffect, useState } from 'react';
import { MessageSquare, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header'; // Assuming you have this component
import DataTable from '../components/DataTable'; // Assuming you have this component
import LoadingSpinner from '../components/LoadingSpinner'; // Assuming you have this component

// This interface defines the final, *normalized* shape of a log object
interface NormalizedLog {
  _id: string;
  customer: {
    _id: string;
    email?: string;
    name?: string;
  };
  campaign: {
    _id: string;
    name?: string;
  } | null;
  status: 'SENT' | 'FAILED' | 'PENDING' | 'UNKNOWN';
  createdAt: string;
  sentAt?: string;
  response?: string;
  message: string;
}

export default function CommunicationLogs() {
  const [logs, setLogs] = useState<NormalizedLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Using the robust data fetching and normalization logic from your first code example
  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.get('/api/communication-logs');
        const rawData = res.data || [];

        // Normalize each log object to ensure a predictable shape for the UI
        const normalizedLogs = rawData.map((log: any) => {
          // 1. Normalize Status (convert 'sent'/'failed' to uppercase)
          const statusRaw = (log.status || '').toString();
          const status = statusRaw ? statusRaw.toUpperCase() : 'UNKNOWN';

          // 2. Normalize Customer (handle object vs. string ID)
          let customer: NormalizedLog['customer'];
          if (log.customerId && typeof log.customerId === 'object') {
            customer = {
              _id: log.customerId._id || log.customerId.id,
              email: log.customerId.email,
              name: log.customerId.name,
            };
          } else {
            // Create a consistent object shape even if we only have an ID
            customer = { _id: log.customerId, email: undefined, name: undefined };
          }

          // 3. Normalize Campaign (handle object vs. string ID)
          let campaign: NormalizedLog['campaign'] = null;
          if (log.campaignId) {
            if (typeof log.campaignId === 'object') {
              campaign = {
                _id: log.campaignId._id || log.campaignId.id,
                name: log.campaignId.name,
              };
            } else {
              campaign = { _id: log.campaignId, name: undefined };
            }
          }

          return {
            ...log,
            status,
            customer,
            campaign,
          };
        });

        setLogs(normalizedLogs);
      } catch (error) {
        console.error('Failed to load communication logs:', error);
        setLogs([]); // Set to empty array on error to prevent UI crashes
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  // --- UI Helper Functions from your second example ---

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'SENT': 'bg-green-500/10 text-green-400 border-green-500/20',
      'FAILED': 'bg-red-500/10 text-red-400 border-red-500/20',
      'PENDING': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'UNKNOWN': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'status-inactive'}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  // --- Column Definitions for the DataTable ---

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (value: NormalizedLog['customer']) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {(value?.name || value?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-800">
              {value?.name || 'Unknown Customer'}
            </div>
            <div className="text-sm text-gray-500">{value?.email || value?._id || 'No email'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'campaign',
      label: 'Campaign',
      render: (value: NormalizedLog['campaign']) => (
        value ? (
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700">{value?.name || 'Unnamed Campaign'}</span>
          </div>
        ) : (
          <span className="text-gray-500">Direct Message</span>
        )
      )
    },
    {
      key: 'message',
      label: 'Message',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-gray-800 truncate" title={value}>
            {value && value.length > 50 ? `${value.substring(0, 50)}...` : (value || 'No message content')}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (_: any, row: NormalizedLog) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date(row.sentAt || row.createdAt).toLocaleString()}</span>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading communication logs..." />
      </div>
    );
  }

  // --- Main Render Logic ---

  return (
    <div className="p-8 space-y-6">
      <Header 
        title="Communication Logs" 
        subtitle={`Track all customer communications - ${logs.length} log${logs.length !== 1 ? 's' : ''} recorded`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-2xl font-bold text-gray-800">{logs.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Successfully Sent</p>
              <p className="text-2xl font-bold text-green-500">
                {logs.filter(log => log.status === 'SENT').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Failed/Pending</p>
              <p className="text-2xl font-bold text-red-500">
                {logs.filter(log => log.status === 'FAILED' || log.status === 'PENDING').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Data Table or Empty State */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center mt-6">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No communication logs found</h3>
          <p className="text-gray-500">
            Logs will appear here as you send messages to your customers.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
        />
      )}
    </div>
  );
}
