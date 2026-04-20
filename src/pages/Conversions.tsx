import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mysqlApi } from '@/services/mysqlApi';
import { ConversionData } from '@/types';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CountryFlag } from '@/components/CountryFlag';

function getTodayUTCString() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // yyyy-mm-dd
}

const Conversions = () => {
  const [conversions, setConversions] = useState<ConversionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(getTodayUTCString());
  const [endDate, setEndDate] = useState(getTodayUTCString());
  const [preset, setPreset] = useState('today');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    handleLoad();
  }, []);

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
      const data = await mysqlApi.getConversionsByDate(startDate, endDate);
      setConversions(data);
    } catch (error) {
      console.error('Error fetching conversions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Conversions</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSummary(!showSummary)}
          className="text-sm whitespace-nowrap"
        >
          {showSummary ? 'Hide Summary' : 'Show Summary'}
        </Button>
      </div>

      {/* Conversion Summary - Now toggleable */}
      {showSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Conversion Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {conversions.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Conversions
                </div>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${conversions.reduce((sum, c) => sum + parseFloat(c.payout), 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Payouts
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Conversions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Conversions Data</CardTitle>
          {/* <CardDescription>Conversion events with detailed information</CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>SUB ID</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No conversions available
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {conversions.map((conversion) => (
                      <TableRow key={conversion.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(conversion.time), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{conversion.subid}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <CountryFlag 
                              countryCode={conversion.country}
                              className="w-6 h-5"
                            />
                            <span className="text-sm text-muted-foreground">
                              {conversion.country}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ${conversion.payout}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow className="bg-muted font-bold">
                      <TableCell colSpan={3} className="text-right">Total:</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400">
                        ${conversions.reduce((sum, c) => sum + parseFloat(c.payout), 0).toFixed(2)}
                      </TableCell>
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

export default Conversions;
