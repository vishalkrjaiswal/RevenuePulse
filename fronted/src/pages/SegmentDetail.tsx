import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Filter, } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';

interface Segment {
  _id: string;
  name: string;
  description?: string;
  rules: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  createdAt: string;
}

export default function SegmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [segment, setSegment] = useState<Segment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSegment() {
      if (!id) return;
      
      try {
        const response = await api.get(`/api/segments/${id}`);
        setSegment(response.data);
      } catch (error) {
        console.error('Failed to load segment:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSegment();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading segment details..." />
      </div>
    );
  }

  if (!segment) {
    return (
      <div className="p-8">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Segment Not Found</h2>
          <p className="text-muted-foreground mb-4">The segment you're looking for doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate('/segments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Segments
          </Button>
        </div>
      </div>
    );
  }

  const operatorLabels: Record<string, string> = {
    equals: 'equals',
    contains: 'contains',
    greaterThan: 'greater than',
    lessThan: 'less than'
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header 
        title={segment.name} 
        subtitle={segment.description || 'Customer segment details'}
      >
        <Button
          variant="outline"
          onClick={() => navigate('/segments')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Segments
        </Button>
      </Header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segment Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Segment Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-foreground mt-1 text-lg font-medium">{segment.name}</p>
              </div>
              {segment.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-foreground mt-1">{segment.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-foreground mt-1">{new Date(segment.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Segment Rules */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Segment Rules
            </h3>
            <div className="space-y-3">
              {segment.rules.map((rule, index) => (
                <div key={index} className="p-4 bg-surface rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase">Field</label>
                      <p className="text-foreground font-mono text-sm mt-1">{rule.field}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase">Operator</label>
                      <p className="text-foreground mt-1">{operatorLabels[rule.operator] || rule.operator}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase">Value</label>
                      <p className="text-foreground font-mono text-sm mt-1">{rule.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/campaigns/new?segmentId=${segment._id}`)}
                className="w-full justify-start"
              >
                Create Campaign
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/segments/new')}
                className="w-full justify-start"
              >
                Create New Segment
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/segments')}
                className="w-full justify-start"
              >
                View All Segments
              </Button>
            </div>
          </div>

          {/* Segment Stats */}
          <div className="glass-card p-6 text-center">
            <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-foreground">{segment.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {segment.rules.length} rule{segment.rules.length !== 1 ? 's' : ''} defined
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}