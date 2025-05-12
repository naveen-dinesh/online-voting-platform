
"use client";

import type { ResultData } from "@/types";
import { BarChart, PieChart as RechartsPieChart, Sector, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useCallback, useEffect } from "react";
import { ChartConfig, ChartContainer, ChartLegend as ShadCNChartLegend, ChartLegendContent, ChartTooltip as ShadCNChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import { TrendingUp, PieChartIcon, BarChartIcon as LucideBarChartIcon } from "lucide-react";

interface ResultsChartsProps {
  results: ResultData[];
  ballotTitle: string; // Already displayed on page, but can be used for context if needed
}

// Define a broader palette of chart colors from the theme
const CHART_COLORS_KEYS: (keyof ChartConfig)[] = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'primary', 'accent'];

const getCssVariableValue = (variableName: string) => {
  if (typeof window === 'undefined') return '#8884d8'; // Default for SSR
  return getComputedStyle(document.documentElement).getPropertyValue(variableName.startsWith('--') ? variableName : `--${variableName}`).trim();
};


const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 6) * cos;
  const sy = cy + (outerRadius + 6) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 18;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-semibold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="shadow-md"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 8}
        fill={fill}
        opacity={0.5}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-sm font-medium">{`${value} Vote${value === 1 ? '' : 's'}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} dy={16} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};


export function ResultsCharts({ results, ballotTitle }: ResultsChartsProps) {
  const [activeIndex, setActiveIndex] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [chartColors, setChartColors] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    // Dynamically get colors from CSS variables on client
    const colors = CHART_COLORS_KEYS.map(key => getCssVariableValue(`--${key}`));
    setChartColors(colors);
  }, []);

  const onPieEnter = useCallback((questionId: string, _: any, index: number) => {
    setActiveIndex(prev => ({ ...prev, [questionId]: index }));
  }, []);

  if (!mounted || chartColors.length === 0) {
    return (
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((resultItem) => (
           <Card key={resultItem.questionId} className="shadow-lg animate-pulse">
             <CardHeader>
               <CardTitle className="text-xl h-6 bg-muted-foreground/20 rounded w-3/4"></CardTitle>
             </CardHeader>
             <CardContent className="h-[350px] flex items-center justify-center bg-muted/30 rounded-b-md">
               <p className="text-muted-foreground">Loading chart data...</p>
             </CardContent>
           </Card>
         ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {results.map((resultItem, resultIndex) => {
        const totalVotesForQuestion = resultItem.options.reduce((sum, opt) => sum + opt.count, 0);
        const chartData = resultItem.options.map((opt, index) => ({ 
            name: opt.optionText, 
            value: opt.count, // For Pie chart
            votes: opt.count, // For Bar chart
            fill: chartColors[index % chartColors.length] 
        }));
        
        const currentChartConfig: ChartConfig = resultItem.options.reduce((config, option, index) => {
          config[option.optionText.replace(/\s+/g, '')] = { // Create a key from option text for config
            label: option.optionText,
            color: chartColors[index % chartColors.length],
          };
          return config;
        }, {} as ChartConfig);
        
        const usePieChart = resultItem.options.length <= 5 && totalVotesForQuestion > 0; // Use Pie for few options & if votes exist

        return (
          <Card key={resultItem.questionId} className="shadow-xl overflow-hidden border-primary/10 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-muted/30 p-5">
              <div className="flex items-center space-x-3">
                {usePieChart ? <PieChartIcon className="h-7 w-7 text-primary" /> : <LucideBarChartIcon className="h-7 w-7 text-primary" />}
                <div>
                    <CardTitle className="text-2xl font-semibold text-foreground">{resultItem.questionText}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Total Votes for this question: {totalVotesForQuestion}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {totalVotesForQuestion === 0 ? (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mb-4" />
                  <p className="text-lg">No votes have been cast for this question yet.</p>
                </div>
              ) : (
                <ChartContainer config={currentChartConfig} className="aspect-video h-[350px] md:h-[400px] w-full">
                  {usePieChart ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <ShadCNChartTooltip 
                            cursor={false}
                            content={<ChartTooltipContent hideLabel nameKey="name" />} 
                        />
                        <Pie
                          activeIndex={activeIndex[resultItem.questionId] === undefined ? 0 : activeIndex[resultItem.questionId]}
                          activeShape={renderActiveShape}
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={window.innerWidth < 768 ? 50 : 70} // Smaller on mobile
                          outerRadius={window.innerWidth < 768 ? 90: 110} // Smaller on mobile
                          dataKey="value"
                          onMouseEnter={(_, index) => onPieEnter(resultItem.questionId, _, index)}
                          stroke="hsl(var(--card))" 
                          strokeWidth={2}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${resultIndex}-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                         <ShadCNChartLegend content={<ChartLegendContent nameKey="name"/>} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : ( // Bar Chart
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" width={Math.max(100, ...chartData.map(d => d.name.length * 6))} interval={0} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                        <ShadCNChartTooltip 
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" nameKey="name" />} 
                        />
                        <ShadCNChartLegend content={<ChartLegendContent nameKey="name"/>} />
                        <Bar dataKey="votes" name="Votes" radius={[0, 4, 4, 0]} barSize={25}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-bar-${resultIndex}-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
