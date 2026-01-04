import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Target, Plus, Trash2, Sparkles } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header';
import Button from '../components/Button';
import { toast } from '@/hooks/use-toast';

interface Rule {
  field: string;
  operator: string;
  value: string;
}

const operators = [
  { value: 'equals', label: 'equals' },
  { value: 'contains', label: 'contains' },
  { value: 'greaterThan', label: 'greater than (>)' },
  { value: 'lessThan', label: 'less than (<)' },
];

export default function CreateSegment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rules: [{ field: '', operator: 'equals', value: '' }] as Rule[]
  });

  // AI Rule Builder state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const segmentData: any = {
        name: formData.name,
        rules: formData.rules
          .filter(rule => rule.field && rule.value)
          .map(rule => ({
            ...rule,
            value: isNaN(Number(rule.value)) ? rule.value : Number(rule.value)
          }))
      };

      if (segmentData.rules.length === 0) {
        toast({
          title: "No rules defined",
          description: "Please add at least one rule to define the segment.",
          variant: "destructive",
        });
        return;
      }

      const response = await api.post('/api/segments', segmentData);

      toast({
        title: "Segment created successfully",
        description: `${formData.name} segment has been created.`,
      });

      navigate(`/segments/${response.data._id}`);
    } catch (error: any) {
      console.error('Failed to create segment:', error);
      toast({
        title: "Failed to create segment",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, { field: '', operator: 'equals', value: '' }]
    }));
  };

  const removeRule = (index: number) => {
    if (formData.rules.length > 1) {
      setFormData(prev => ({
        ...prev,
        rules: prev.rules.filter((_, i) => i !== index)
      }));
    }
  };

  const updateRule = (index: number, field: keyof Rule, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  // AI Rule Builder
  const generateRulesWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.post('/segments/ai-rules', { prompt: aiPrompt });
      setFormData(prev => ({
        ...prev,
        rules: res.data.rules.map((r: any) => ({
          field: r.field.replace(/^attributes\./, ''), // clean UI
          operator: r.operator,
          value: String(r.value),
        })),
      }));
      toast({
        title: "AI Rules Generated",
        description: "Rules have been added from your prompt.",
      });
    } catch (err: any) {
      toast({
        title: "AI Rule Builder Failed",
        description: err.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header
        title="Create Segment"
        subtitle="Define rules to segment your customers for targeted campaigns"
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => navigate('/segments')}
        >
          Back to Segments
        </Button>
      </Header>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Segment Information */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Segment Information</h3>
            </div>

            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Segment Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., High Value Customers"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* AI Rule Builder */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">AI Rule Builder</h3>
            </div>
            <textarea
              className="form-input w-full rounded-md border p-2"
              rows={3}
              placeholder="e.g., Customers who spent more than 1000 and are younger than 30"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button
              type="button"
              variant="gradient"
              className="mt-3"
              onClick={generateRulesWithAI}
              loading={aiLoading}
              icon={Sparkles}
            >
              {aiLoading ? "Generating..." : "Generate Rules with AI"}
            </Button>
          </div>

          {/* Segment Rules */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Segment Rules</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={addRule}
              >
                Add Rule
              </Button>
            </div>

            <div className="space-y-4">
              {formData.rules.map((rule, index) => (
                <div key={index} className="p-4 bg-surface rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4">
                      <label className="form-label">Field</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., totalSpending"
                        value={rule.field}
                        onChange={(e) => updateRule(index, 'field', e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="form-label">Operator</label>
                      <select
                        className="form-input"
                        value={rule.operator}
                        onChange={(e) => updateRule(index, 'operator', e.target.value)}
                        required
                      >
                        {operators.map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-4">
                      <label className="form-label">Value</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter comparison value"
                        value={rule.value}
                        onChange={(e) => updateRule(index, 'value', e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-1">
                      {formData.rules.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => removeRule(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-info/10 rounded-lg border border-info/20">
              <h4 className="font-medium text-foreground mb-2">Rule Examples:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <code>totalSpending</code> greaterThan <code>1000</code></li>
                <li>• <code>email</code> contains <code>@company.com</code></li>
                <li>• <code>name</code> equals <code>John Doe</code></li>
                <li>• <code>age</code> lessThan <code>30</code></li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="gradient"
              icon={Save}
              loading={loading}
              disabled={!formData.name || formData.rules.some(rule => !rule.field || !rule.value)}
            >
              Create Segment
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/segments')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
