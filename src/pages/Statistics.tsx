import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mysqlApi } from '@/services/mysqlApi';
import { StatsSummary, StatsData } from '@/types';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

function getTodayUTCString() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // yyyy-mm-dd
}

const Statistics = () => {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(getTodayUTCString());
  const [endDate, setEndDate] = useState(getTodayUTCString());
  const [preset, setPreset] = useState('today');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setPreset('today');
    const todayUTCString = getTodayUTCString();
    setStartDate(todayUTCString);
    setEndDate(todayUTCString);
    fetchSummary();
    handleLoad();
  }, []);

  // Calculate totals from loaded data
  const calculateTotalsFromData = (data: StatsData[]) => {
    const totals = data.reduce((acc, item) => ({
      totalClicks: acc.totalClicks + item.clicks,
      totalUnique: acc.totalUnique + item.unique,
      totalConversions: acc.totalConversions + item.conversions,
      totalEarning: acc.totalEarning + item.earnings,
    }), {
      totalClicks: 0,
      totalUnique: 0,
      totalConversions: 0,
      totalEarning: 0,
    });
    
    setSummary(totals);
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await mysqlApi.getStatsSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const todayUTCString = getTodayUTCString();
    switch (value) {
      case 'today':
        setStartDate(todayUTCString);
        setEndDate(todayUTCString);
        break;
      case 'yesterday': {
        const yesterdayUTC = new Date();
        yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
        const yesterdayUTCString = yesterdayUTC.toISOString().slice(0, 10);
        setStartDate(yesterdayUTCString);
        setEndDate(yesterdayUTCString);
        break;
      }
      case 'last7days': {
        const today = new Date();
        const last7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        setStartDate(last7.toISOString().slice(0, 10));
        setEndDate(todayUTCString);
        break;
      }
      case 'thismonth': {
        const today = new Date();
        const firstDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
        const lastDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
        setStartDate(firstDay.toISOString().slice(0, 10));
        setEndDate(lastDay.toISOString().slice(0, 10));
        break;
      }
      case 'lastmonth': {
        const today = new Date();
        const firstDayLastMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
        const lastDayLastMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));
        setStartDate(firstDayLastMonth.toISOString().slice(0, 10));
        setEndDate(lastDayLastMonth.toISOString().slice(0, 10));
        break;
      }
    }
  };

  const handleLoad = async () => {
    setIsLoading(true);
    try {
      const data = await mysqlApi.getStatsData(startDate, endDate);
      setStatsData(data);
      calculateTotalsFromData(data);
    } catch (error) {
      console.error('Error fetching stats data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Statistics</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSummary(!showSummary)}
          className="text-sm whitespace-nowrap"
        >
          {showSummary ? 'Hide Summary' : 'Show Summary'}
        </Button>
      </div>

      {/* Summary Cards - Now toggleable */}
      {showSummary && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <span className="text-2xl">👆</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Unique</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalUnique.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalConversions.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earning</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalEarning.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Date Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preset</label>
              <Select value={preset} onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="thismonth">This Month</SelectItem>
                  <SelectItem value="lastmonth">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Button onClick={handleLoad} disabled={isLoading} className="lg:col-span-2">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                'Load'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics Traffic</CardTitle>
          {/* <CardDescription>Detailed breakdown per SUB ID</CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[700px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>SUB ID</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Unique</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Click "Load" to view statistics
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {statsData.map((stat) => (
                      <TableRow key={stat.subid}>
                        <TableCell>
                          <Badge variant="outline">{stat.subid}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{stat.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{stat.unique.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{stat.conversions.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${stat.earnings.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow className="bg-muted font-bold">
                      <TableCell className="text-right">Total:</TableCell>
                      <TableCell className="text-right">{statsData.reduce((sum, s) => sum + s.clicks, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{statsData.reduce((sum, s) => sum + s.unique, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{statsData.reduce((sum, s) => sum + s.conversions, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400">${statsData.reduce((sum, s) => sum + s.earnings, 0).toFixed(2)}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
