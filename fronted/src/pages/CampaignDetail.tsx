import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Megaphone,  MessageSquare, Calendar, Send } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { toast } from '@/hooks/use-toast';

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
  sentAt?: string;
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  

  useEffect(() => {
    async function loadCampaign() {
      if (!id) return;
      try {
        const response = await api.get(`/api/campaigns/${id}`);
        setCampaign(response.data);
      } catch (error) {
        console.error('Failed to load campaign:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCampaign();
  }, [id]);

  const handleSendCampaign = async () => {
    if (!campaign) return;
    setSending(true);
    try {
      await api.post(`/campaigns/${campaign._id}/send`);
      setCampaign(prev =>
        prev ? { ...prev, status: 'SENT', sentAt: new Date().toISOString() } : null
      );
      toast({
        title: 'Campaign sent successfully',
        description: 'Your campaign has been sent to the target audience.',
      });
    } catch (error: any) {
      console.error('Failed to send campaign:', error);
      toast({
        title: 'Failed to send campaign',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };


  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      SENT: 'status-active',
      PENDING: 'status-pending',
      DRAFT: 'status-inactive',
      SCHEDULED: 'status-pending',
    };
    return <span className={statusClasses[status] || 'status-inactive'}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading campaign details..." />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Campaign Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The campaign you're looking for doesn't exist.
          </p>
          <Button variant="outline" onClick={() => navigate('/campaigns')}>
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header
        title={campaign.name}
        subtitle={`Campaign created on ${new Date(campaign.createdAt).toLocaleDateString()}`}
      >
        <div className="flex gap-2">
          <Button
            variant="gradient"
            icon={Send}
            onClick={handleSendCampaign}
            loading={sending}
          >
            {campaign.status === 'DRAFT' ? 'Send Campaign' : 'Resend Campaign'}
          </Button>
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/campaigns')}>
            Back to Campaigns
          </Button>
        </div>
      </Header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Megaphone className="w-5 h-5" /> Campaign Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Campaign Name</label>
                <p className="text-foreground mt-1 text-lg font-medium">{campaign.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">{getStatusBadge(campaign.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {campaign.sentAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sent</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Send className="w-4 h-4 text-green-400" />
                    <p className="text-green-400">
                      {new Date(campaign.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Message */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Campaign Message
            </h3>
            <div className="p-4 bg-surface rounded-lg border border-border">
              <p className="text-foreground whitespace-pre-wrap">{campaign.message}</p>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {campaign.message.length} characters
            </div>
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/campaigns/new')}
                className="w-full justify-start"
              >
                Create New Campaign
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/campaigns')}
                className="w-full justify-start"
              >
                View All Campaigns
              </Button>
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="glass-card p-6 text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-foreground">{campaign.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{getStatusBadge(campaign.status)}</p>
            <div className="mt-4 text-xs text-muted-foreground">
              Campaign ID: {campaign._id.slice(-8)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
