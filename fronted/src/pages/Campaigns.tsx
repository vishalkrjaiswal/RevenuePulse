import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Megaphone, Calendar, Target } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

interface Campaign {
  _id: string;
  name: string;
  message: string;
  segmentId?: {
    _id: string;
    name: string;
  };
  status: string;
  createdAt: string;
  scheduledAt?: string;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const response = await api.get('/api/campaigns');
        setCampaigns(response.data || []);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      'SENT': 'status-active',
      'PENDING': 'status-pending',
      'DRAFT': 'status-inactive',
      'SCHEDULED': 'status-pending'
    };
    
    return (
      <span className={statusClasses[status] || 'status-inactive'}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Campaign Name',
      render: (value: string, row: Campaign) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {row.message.length > 50 ? `${row.message.substring(0, 50)}...` : row.message}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'segmentId',
      label: 'Target Segment',
      render: (value: any) => (
        value ? (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-foreground">{value.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">No segment</span>
        )
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  const handleRowClick = (campaign: Campaign) => {
    navigate(`/campaigns/${campaign._id}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading campaigns..." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header 
        title="Campaigns" 
        subtitle={`Manage your ${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''} and track performance`}
      >
        <Button
          variant="gradient"
          icon={Plus}
          onClick={() => navigate('/campaigns/new')}
        >
          Create Campaign
        </Button>
      </Header>

      {campaigns.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No campaigns created yet</h3>
          <p className="text-muted-foreground mb-6">
            Start engaging with your customers by creating targeted campaigns.
          </p>
          <Button
            variant="gradient"
            icon={Plus}
            onClick={() => navigate('/campaigns/new')}
          >
            Create Your First Campaign
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={campaigns}
          onRowClick={handleRowClick}
          loading={loading}
        />
      )}
    </div>
  );
}