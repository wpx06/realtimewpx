import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { realtimeApi } from '@/services/realtimeApi';
import { VisitData, ConversionData } from '@/types';
import { format } from 'date-fns';
import { CountryFlag } from '@/components/CountryFlag';

const LivePerforms = () => {
  const [liveClicks, setLiveClicks] = useState<VisitData[]>([]);
  const [liveConversions, setLiveConversions] = useState<ConversionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const prevConversionsCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clicks, conversions] = await Promise.all([
          realtimeApi.getLiveClicks(),
          realtimeApi.getLiveConversions(),
        ]);
        setLiveClicks(clicks);
        setLiveConversions(conversions);
        // Play sound if new conversion detected
        if (
          prevConversionsCount.current !== 0 &&
          conversions.length > prevConversionsCount.current
        ) {
          audioRef.current?.play();
        }
        prevConversionsCount.current = conversions.length;
      } catch (error) {
        console.error('Error fetching live data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  // Filter conversions hanya untuk hari ini UTC+0
  const todayUTC = new Date();
  const todayUTCString = todayUTC.toISOString().slice(0, 10); // yyyy-mm-dd
  const filteredConversions = liveConversions.filter((c) => {
    // c.time format: yyyy-mm-dd HH:mm:ss atau ISO
    const dateStr = c.time ? c.time.slice(0, 10) : '';
    return dateStr === todayUTCString;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src="/dana.mp3" preload="auto" />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live Performs</h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Recent Clicks Table - Compact Version */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Clicks Today
          </CardTitle>
          <CardDescription className="text-sm">Berdasarkan Waktu UTC +0</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[700px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-8 px-2 text-xs">Time</TableHead>
                  <TableHead className="h-8 px-2 text-xs">SUB ID</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Geo</TableHead>
                  <TableHead className="h-8 px-2 text-xs">OS</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Ref</TableHead>
                  <TableHead className="h-8 px-2 text-xs">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveClicks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground text-xs py-4">
                      No recent clicks
                    </TableCell>
                  </TableRow>
                ) : (
                  liveClicks.map((click) => (
                    <TableRow key={click.id} className="h-8">
                      <TableCell className="font-mono text-xs py-1 px-2">
                        {formatTime(click.timestamp)}
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge variant="secondary" className="text-xs py-0 px-1 h-5">
                          {click.subsource}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <div className="flex items-center gap-2">
                          <CountryFlag 
                            countryCode={click.country} 
                            className="w-5 h-4"
                          />
                          <span className="text-xs text-muted-foreground font-mono">{click.country}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <img 
                          src={realtimeApi.getOSIcon(click.user_agent)}
                          alt={click.user_agent}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.style.display = 'none';
                            const span = document.createElement('span');
                            span.textContent = '💻';
                            span.className = 'text-lg';
                            imgElement.parentNode?.insertBefore(span, imgElement);
                          }}
                        />
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <img 
                          src={realtimeApi.getReferrerIcon(click.referer)}
                          alt={click.referer}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.style.display = 'none';
                            const span = document.createElement('span');
                            span.textContent = '🌐';
                            span.className = 'text-lg';
                            imgElement.parentNode?.insertBefore(span, imgElement);
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs py-1 px-2">
                        {click.ip}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Conversions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Conversions Today
          </CardTitle>
          <CardDescription className="text-sm">Berdasarkan Waktu UTC +0</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Total Payouts di pojok kiri atas */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                Total Earning Today: $
                {filteredConversions.reduce((sum, c) => sum + parseFloat(c.payout), 0).toFixed(2)}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-8 px-2 text-xs">Time</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Network</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Geo</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Payouts</TableHead>
                  <TableHead className="h-8 px-2 text-xs">SUB ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConversions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-4">
                      No recent conversions
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConversions.map((conversion) => (
                    <TableRow key={conversion.id} className="h-8">
                      <TableCell className="font-mono text-xs py-1 px-2">
                        {formatTime(conversion.time)}
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge variant="outline" className="text-xs">TRAFEE</Badge>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <CountryFlag 
                          countryCode={conversion.country} 
                          className="w-6 h-5"
                        />
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ${conversion.payout}
                        </span>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge variant="secondary">{conversion.subid}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivePerforms;
