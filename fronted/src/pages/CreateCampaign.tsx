import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Megaphone,
  MessageSquare,
  Sparkles,
  Send,
} from "lucide-react";
import api from "../api/apiClient";
import Header from "../components/Header";
import Button from "../components/Button";
import { toast } from "@/hooks/use-toast";

interface Segment {
  _id: string;
  name: string;
}

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    segmentId: "",
    product: "",
    audience: "",
    tone: "friendly",
  });

  useEffect(() => {
    async function loadSegments() {
      try {
        const response = await api.get("/api/segments");
        setSegments(response.data || []);
      } catch (error) {
        console.error("Failed to load segments:", error);
      }
    }
    loadSegments();
  }, []);

  const handleSubmit = async (e: React.FormEvent, autoSend = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const campaignData = {
        name: formData.name,
        message: formData.message,
        segmentId: formData.segmentId || undefined,
      };

      let response;
      if (autoSend) {
        // ✅ new endpoint for create & send
        response = await api.post(
          "/api/campaigns/create-and-send",
          campaignData
        );
        toast({
          title: "Campaign created & sent",
          description: `${formData.name} has been created and sent.`,
        });
      } else {
        // 🧱 old flow for just creating
        response = await api.post("/api/campaigns", campaignData);
        toast({
          title: "Campaign created successfully",
          description: `${formData.name} campaign has been created.`,
        });
      }

      const campaignId = response.data.campaign?._id || response.data._id;
      navigate(`/campaigns/${campaignId}`);
    } catch (error: any) {
      console.error("Failed to create campaign:", error);
      toast({
        title: "Failed to create campaign",
        description:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    setGenerating(true);
    setAiSuggestions([]);
    try {
      const response = await api.post("/campaigns/ai-suggestions", {
        product: formData.product || formData.name || "our product",
        audience: formData.audience || "customers",
        tone: formData.tone || "friendly",
      });
      setAiSuggestions(response.data.suggestions || []);
      toast({
        title: "AI Suggestions Ready",
        description: "We generated campaign messages for you to review.",
      });
    } catch (error: any) {
      console.error("Failed to generate suggestions:", error);
      toast({
        title: "AI suggestion failed",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header
        title="Create Campaign"
        subtitle="Design and target your customer communication campaign"
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => navigate("/campaigns")}
        >
          Back to Campaigns
        </Button>
      </Header>

      <div className="max-w-2xl">
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          {/* Campaign Info */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Megaphone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Campaign Information
              </h3>
            </div>

            <div className="form-group">
              <label className="form-label">Campaign Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Black Friday Sale 2024"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Segment</label>
              <select
                className="form-input"
                value={formData.segmentId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    segmentId: e.target.value,
                  }))
                }
              >
                <option value="">Select Segment</option>
                {segments.map((segment) => (
                  <option key={segment._id} value={segment._id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaign Message */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Campaign Message
              </h3>
            </div>

            <textarea
              className="form-input"
              rows={6}
              placeholder="Enter your campaign message here..."
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              required
            />

            {/* AI Inputs + Suggestion */}
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                className="form-input flex-1"
                placeholder="Product (optional)"
                value={formData.product}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, product: e.target.value }))
                }
              />
              {/*}
              <input
                type="text"
                className="form-input flex-1"
                placeholder="Audience (optional)"
                value={formData.audience}
                onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
              />*/}
              <select
                className="form-input flex-1"
                value={formData.tone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tone: e.target.value }))
                }
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="exciting">Exciting</option>
                <option value="luxury">Luxury</option>
              </select>
              <Button
                type="button"
                variant="outline"
                icon={Sparkles}
                onClick={generateSuggestions}
                loading={generating}
              >
                Generate with AI
              </Button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-foreground">AI Suggestions:</h4>
                {aiSuggestions.map((msg, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface rounded-lg border border-border cursor-pointer hover:bg-accent"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, message: msg }))
                    }
                  >
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="gradient"
              icon={Save}
              loading={loading}
              disabled={!formData.name || !formData.message}
            >
              Create Campaign
            </Button>
            <Button
              type="button"
              variant="gradient"
              icon={Send}
              loading={loading}
              disabled={!formData.name || !formData.message}
              onClick={(e) => handleSubmit(e as any, true)}
            >
              Create & Send
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/campaigns")}
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
