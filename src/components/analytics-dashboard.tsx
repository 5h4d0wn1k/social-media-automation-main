import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useSocialStore } from '@/lib/store';
import { getPostAnalytics, PostAnalytics } from '@/lib/api';
import { format, subDays, isWithinInterval } from 'date-fns';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Loader2, Download } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { DateRange } from 'react-day-picker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function AnalyticsDashboard() {
  const posts = useSocialStore((state) => state.posts);
  const [analytics, setAnalytics] = useState<Record<string, PostAnalytics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const analyticsData: Record<string, PostAnalytics> = {};
        
        for (const post of posts) {
          try {
            analyticsData[post.id] = await getPostAnalytics(post.platform, post.id);
          } catch (error) {
            console.error(`Error fetching analytics for post ${post.id}:`, error);
          }
        }
        
        setAnalytics(analyticsData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [posts]);

  const filteredPosts = posts.filter(post => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const postDate = new Date(post.scheduledTime);
    return isWithinInterval(postDate, { start: dateRange.from, end: dateRange.to });
  });

  const engagementData = {
    labels: filteredPosts.map(post => format(new Date(post.scheduledTime), 'MMM dd, HH:mm')),
    datasets: [
      {
        label: 'Engagement Rate (%)',
        data: filteredPosts.map(post => {
          const value = analytics[post.id]?.engagement;
          return typeof value === 'number' ? value : 0;
        }),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const platformDistribution = {
    labels: Object.keys(
      filteredPosts.reduce((acc, post) => {
        acc[post.platform] = (acc[post.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
    datasets: [{
      data: Object.values(
        filteredPosts.reduce((acc, post) => {
          acc[post.platform] = (acc[post.platform] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#36A2EB',
      ],
    }],
  };

  const interactionData = {
    labels: filteredPosts.map(post => format(new Date(post.scheduledTime), 'MMM dd, HH:mm')),
    datasets: [
      {
        label: 'Likes',
        data: filteredPosts.map(post => {
          const value = analytics[post.id]?.likes;
          return typeof value === 'number' ? value : 0;
        }),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Comments',
        data: filteredPosts.map(post => {
          const value = analytics[post.id]?.comments;
          return typeof value === 'number' ? value : 0;
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Shares',
        data: filteredPosts.map(post => {
          const value = analytics[post.id]?.shares;
          return typeof value === 'number' ? value : 0;
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const exportAnalytics = () => {
    // Skip export if no posts
    if (filteredPosts.length === 0) {
      return;
    }
    
    const data = filteredPosts.map(post => ({
      platform: post.platform,
      date: format(new Date(post.scheduledTime), 'yyyy-MM-dd HH:mm'),
      content: post.content,
      likes: analytics[post.id]?.likes || 0,
      comments: analytics[post.id]?.comments || 0,
      shares: analytics[post.id]?.shares || 0,
      views: analytics[post.id]?.views || 0,
      engagement: typeof analytics[post.id]?.engagement === 'number' 
        ? (analytics[post.id]?.engagement || 0).toFixed(2) + '%' 
        : '0.00%',
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  'Pick a date range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={exportAnalytics}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Posts</h3>
          <p className="text-3xl font-bold">{filteredPosts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Engagement</h3>
          <p className="text-3xl font-bold">
            {(Object.values(analytics)
              .filter(a => a)
              .reduce((sum, a) => sum + (a.engagement || 0), 0) || 0)
              .toFixed(2)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Interactions</h3>
          <p className="text-3xl font-bold">
            {Object.values(analytics)
              .filter(a => a)
              .reduce((sum, a) => sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Views</h3>
          <p className="text-3xl font-bold">
            {Object.values(analytics)
              .filter(a => a)
              .reduce((sum, a) => sum + (a.views || 0), 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Engagement Over Time</h3>
          <Line data={engagementData} options={{ responsive: true }} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Platform Distribution</h3>
          <Doughnut data={platformDistribution} options={{ responsive: true }} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Interactions by Post</h3>
        <Bar data={interactionData} options={{ responsive: true }} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Posts Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Platform</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Likes</th>
                <th className="text-left p-2">Comments</th>
                <th className="text-left p-2">Shares</th>
                <th className="text-left p-2">Views</th>
                <th className="text-left p-2">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.slice(-10).map(post => (
                <tr key={post.id} className="border-b">
                  <td className="p-2 capitalize">{post.platform}</td>
                  <td className="p-2">{format(new Date(post.scheduledTime), 'MMM dd, HH:mm')}</td>
                  <td className="p-2">{analytics[post.id]?.likes || 0}</td>
                  <td className="p-2">{analytics[post.id]?.comments || 0}</td>
                  <td className="p-2">{analytics[post.id]?.shares || 0}</td>
                  <td className="p-2">{analytics[post.id]?.views || 0}</td>
                  <td className="p-2">{(analytics[post.id]?.engagement || 0).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}