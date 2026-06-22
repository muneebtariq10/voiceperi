import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_BASE_URL;
export default function PromptEditor({ lang = "en" }: { lang?: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const res = await fetch(`${API_URL}api/agents/admin/prompt-template`);
        const data = await res.json();
        setContent(data.content);
      } catch (error) {
        toast.error("Failed to load the prompt template.");
      } finally {
        setLoading(false);
      }
    };
    loadPrompt();
  }, [lang]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}api/agents/admin/prompt-template`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        toast.success("Prompt updated successfully.");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Failed to save the prompt template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit Prompt Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={25}
              className="w-full text-sm font-mono resize-y"
              placeholder="Edit prompt content here..."
            />
          )}
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
