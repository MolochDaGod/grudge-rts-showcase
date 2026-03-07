import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Globe, Worm, Eye, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { ScrapingJob, ScrapedPage } from "@/shared/schema";

export default function ScrapingTool() {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState("10");
  const [crawlDepth, setCrawlDepth] = useState("1");
  const [outputFormat, setOutputFormat] = useState("json");
  const { toast } = useToast();

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<ScrapingJob[]>({
    queryKey: ["/api/scraping/jobs"],
    refetchInterval: 2000, // Refresh every 2 seconds for real-time updates
  });

  const startScrapingMutation = useMutation({
    mutationFn: async (data: { url: string; maxPages: number; crawlDepth: number; outputFormat: string }) => {
      const response = await apiRequest("POST", "/api/scraping/start", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scraping Started",
        description: "Your scraping job has been queued and will begin shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scraping/jobs"] });
      setUrl("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    startScrapingMutation.mutate({
      url,
      maxPages: parseInt(maxPages),
      crawlDepth: parseInt(crawlDepth),
      outputFormat,
    });
  };

  const handleDownload = async (jobId: number, format: string) => {
    try {
      const response = await fetch(`/api/scraping/jobs/${jobId}/download?format=${format}`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `scraped_data_${jobId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your scraped data is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download scraped data.",
        variant: "destructive",
      });
    }
  };

  const activeJob = jobs.find(job => job.status === "running");
  const completedJobs = jobs.filter(job => job.status === "completed");

  return (
    <section id="scraping" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Web Scraping Tool</h2>
          <p className="text-xl text-gray-600">
            Enter any website URL and watch our AI-powered crawler extract all content
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Scraping Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Start New Scraping Job</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <div className="relative mt-2">
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-10"
                      required
                    />
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Max Pages</Label>
                    <Select value={maxPages} onValueChange={setMaxPages}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 pages</SelectItem>
                        <SelectItem value="50">50 pages</SelectItem>
                        <SelectItem value="100">100 pages</SelectItem>
                        <SelectItem value="1000">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Crawl Depth</Label>
                    <Select value={crawlDepth} onValueChange={setCrawlDepth}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Level 1</SelectItem>
                        <SelectItem value="2">Level 2</SelectItem>
                        <SelectItem value="3">Level 3</SelectItem>
                        <SelectItem value="10">All levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Output Format</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="gradient-bg"
                    disabled={startScrapingMutation.isPending}
                  >
                    <Worm className="mr-2 h-4 w-4" />
                    {startScrapingMutation.isPending ? "Starting..." : "Start Scraping"}
                  </Button>
                  <Button type="button" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Site
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Active Job Progress */}
          {activeJob && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Scraping Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{activeJob.progress}%</span>
                  </div>
                  <Progress value={activeJob.progress} className="w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{activeJob.pagesFound}</div>
                    <div className="text-sm text-gray-600">Pages Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{activeJob.pagesScraped}</div>
                    <div className="text-sm text-gray-600">Pages Scraped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {Math.max(0, (activeJob.maxPages || 10) - activeJob.pagesScraped)}
                    </div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Current Job</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>🔍 Scraping: {activeJob.url}</div>
                    <div>📊 Status: {activeJob.status}</div>
                    <div>⚙️ Format: {activeJob.outputFormat}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Completed Jobs
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{job.url}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{job.pagesScraped} pages scraped</span>
                            <Badge variant="secondary">{job.outputFormat}</Badge>
                            <span>{new Date(job.completedAt!).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(job.id, job.outputFormat || "json")}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                      
                      {job.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <AlertCircle className="inline mr-1 h-4 w-4" />
                          {job.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!activeJob && completedJobs.length === 0 && !jobsLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <Worm className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scraping jobs yet</h3>
                <p className="text-gray-600">Enter a URL above to start your first scraping job.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
