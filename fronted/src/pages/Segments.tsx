import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Target, Filter } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';

interface Segment {
  _id: string;
  name: string;
  rules: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  description?: string;
  createdAt: string;
}

export default function Segments() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSegments() {
      try {
        const response = await api.get('/api/segments');
        setSegments(response.data || []);
      } catch (error) {
        console.warn('GET /api/segments not present on backend, showing empty list.');
        setSegments([]);
      } finally {
        setLoading(false);
      }
    }

    loadSegments();
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Segment Name',
      render: (value: string, row: Segment) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-foreground">{value}</div>
            {row.description && (
              <div className="text-sm text-muted-foreground">{row.description}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'rules',
      label: 'Rules',
      render: (value: Segment['rules']) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>{value?.length || 0} rule{(value?.length || 0) !== 1 ? 's' : ''}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => (
        <span className="text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  const handleRowClick = (segment: Segment) => {
    navigate(`/segments/${segment._id}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading segments..." />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header 
        title="Customer Segments" 
        subtitle={`Manage your ${segments.length} segment${segments.length !== 1 ? 's' : ''} for targeted campaigns`}
      >
        <Button
          variant="default"
          onClick={() => navigate('/segments/new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Segment
        </Button>
      </Header>

      {segments.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No segments created yet</h3>
          <p className="text-muted-foreground mb-6">
            Create customer segments to target specific groups with your campaigns.
          </p>
          <Button
            variant="default"
            onClick={() => navigate('/segments/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Segment
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={segments}
          onRowClick={handleRowClick}
          loading={loading}
        />
      )}
    </div>
  );
}