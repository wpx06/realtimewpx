import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mysqlApi } from '@/services/mysqlApi';
import { TeamPerformance, CountryBreakdown } from '@/types';
import { format, startOfWeek, endOfWeek, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CountryFlag } from '@/components/CountryFlag';

const getTodayUTCString = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10); // yyyy-mm-dd
};

const PerformsTeam = () => {
  const [teamData, setTeamData] = useState<TeamPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState(getTodayUTCString());
  const [endDate, setEndDate] = useState(getTodayUTCString());
  const [preset, setPreset] = useState('today');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setPreset('today');
    const todayUTCString = getTodayUTCString();
    setStartDate(todayUTCString);
    setEndDate(todayUTCString);
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setIsLoading(true);
    try {
      const data = await mysqlApi.getTeamPerformance(startDate, endDate);
      console.log('Received team data:', data);
      console.log('Total conversions:', data.reduce((sum, team) => sum + team.conversions, 0));
      console.log('Total earnings:', data.reduce((sum, team) => sum + team.earnings, 0));
      setTeamData(data);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const todayUTCString = getTodayUTCString();
    switch (value) {
      case 'custom':
        // Don't change dates when custom is selected
        break;
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
      case 'thisweek': {
        const today = new Date();
        const firstDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - today.getUTCDay() + 1));
        const lastDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - today.getUTCDay() + 7));
        setStartDate(firstDay.toISOString().slice(0, 10));
        setEndDate(lastDay.toISOString().slice(0, 10));
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

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    // Set preset to custom when dates are manually changed
    setPreset('custom');
  };

  const handleLoad = async () => {
    await fetchTeamData();
  };

  const toggleRow = (subid: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(subid)) {
      newExpanded.delete(subid);
    } else {
      newExpanded.add(subid);
    }
    setExpandedRows(newExpanded);
  };

  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM dd');
  const currentWeekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM dd, yyyy');

  // Tambahkan validasi agar tidak error jika teamData bukan array
  const safeTeamData = Array.isArray(teamData) ? teamData : [];
  console.log('Current safeTeamData:', safeTeamData);
  console.log('Current total conversions:', safeTeamData.reduce((sum, team) => sum + team.conversions, 0));
  console.log('Current total earnings:', safeTeamData.reduce((sum, team) => sum + team.earnings, 0));

  // Fungsi aman untuk render angka
  function safeLocale(val: any) {
    const n = Number(val);
    return isNaN(n) ? "0" : n.toLocaleString();
  }
  function safeFixed(val: any) {
    const n = Number(val);
    return isNaN(n) ? "0.00" : n.toFixed(2);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Performs Team</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSummary(!showSummary)}
            className="text-sm whitespace-nowrap"
          >
            {showSummary ? 'Hide Summary' : 'Show Summary'}
          </Button>
          <Badge variant="outline" className="text-sm">
            Week: {currentWeekStart} - {currentWeekEnd}
          </Badge>
        </div>
      </div>

      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Team Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${safeTeamData.reduce((sum, team) => sum + (Number(team.earnings) || 0), 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">This week</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {safeTeamData.reduce((sum, team) => sum + (Number(team.conversions) || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">All team members</div>
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
                  <SelectItem value="custom">Custom Range</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="thisweek">This Week</SelectItem>
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
                onChange={(e) => handleDateChange('start', e.target.value)}
                max={endDate}
                style={{ cursor: "pointer" }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange('end', e.target.value)}
                min={startDate}
                style={{ cursor: "pointer" }}
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

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>
            Data Terhitung 1 Minggu (Senin - Minggu) Waktu UTC+0
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[700px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>SUB ID</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Unique</TableHead>
                  <TableHead className="text-right">
                    <span className="md:hidden">Conv</span>
                    <span className="hidden md:inline">Conversions</span>
                  </TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeTeamData.map((team) => (
                  <React.Fragment key={team.subid}>
                    <TableRow className="hover:bg-accent/50">
                      <TableCell className="text-center">
                        <Badge 
                          variant={team.rank <= 3 ? "default" : "secondary"}
                          className={
                            team.rank === 1 ? "bg-yellow-500 text-white" :
                            team.rank === 2 ? "bg-gray-400 text-white" :
                            team.rank === 3 ? "bg-amber-600 text-white" : ""
                          }
                        >
                          #{team.rank}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(team.subid)}
                            className="p-1 h-6 w-6 text-xs"
                          >
                            {expandedRows.has(team.subid) ? '−' : '+'}
                          </Button>
                          <Badge variant="outline">{team.subid}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{safeLocale(team.clicks)}</TableCell>
                      <TableCell className="text-right">{safeLocale(team.unique)}</TableCell>
                      <TableCell className="text-right font-semibold">{safeLocale(team.conversions)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                        ${safeFixed(team.earnings)}
                      </TableCell>
                    </TableRow>
                    
                    {expandedRows.has(team.subid) && team.countries && team.countries.length > 0 && (
                      <>
                        <TableRow className="bg-muted/30">
                          <TableCell />
                          <TableCell className="font-bold">Country</TableCell>
                          <TableCell className="text-right font-bold">Clicks</TableCell>
                          <TableCell className="text-right font-bold">Unique</TableCell>
                          <TableCell className="text-right font-bold">Conversions</TableCell>
                          <TableCell className="text-right font-bold">Earnings</TableCell>
                        </TableRow>
                        {team.countries
                          .slice() // copy array agar tidak mutate
                          .sort((a, b) => b.conversions - a.conversions)
                          .map((country) => (
                            <TableRow key={country.country} className="bg-muted/30">
                              <TableCell />
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <CountryFlag countryCode={country.country} className="w-5 h-4" />
                                  <span className="font-medium">{country.country}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary">{safeLocale(country.clicks)}</TableCell>
                              <TableCell className="text-right font-bold">{safeLocale(country.unique)}</TableCell>
                              <TableCell className="text-right font-bold">{safeLocale(country.conversions)}</TableCell>
                              <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                                ${safeFixed(country.earnings)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
                {/* Summary Row */}
                <TableRow className="bg-muted font-bold">
                  <TableCell colSpan={4} className="text-right">Total:</TableCell>
                  <TableCell className="text-right">
                    {safeLocale(safeTeamData.reduce((sum, team) => sum + (Number(team.conversions) || 0), 0))}
                  </TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400">
                    ${safeFixed(safeTeamData.reduce((sum, team) => sum + (Number(team.earnings) || 0), 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformsTeam;
