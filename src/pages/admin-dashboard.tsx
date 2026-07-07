import { useEffect } from "react";
// 1. Import useRevalidator for the polling mechanism
import { useLoaderData, useRevalidator } from "react-router";
import {
  IconUsers,
  IconTrendingUp,
  IconTrendingDown,
  IconCash,
  IconAlertCircle, // Changed icon for Receivables
  IconBed,
  IconCalendarEvent,
  IconActivity
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

interface DashboardData {
  kpis: {
    revenue: { value: number; trend: number; label: string };
    patients: { value: number; trend: number; label: string };
    // 2. Replaced Wait Time with Pending Receivables
    receivables: { value: number; trend: number; label: string };
    occupancy: { value: number; trend: number; label: string };
  };
  revenueData: Array<{ day: string; revenue: number }>;
  departmentBreakdown: Array<{ name: string; value: number; color: string }>;
  recentTransactions: Array<{ id: string; txnNo: string; time: string; text: string; type: string; amount: number }>;
}

export async function adminDashboardLoader(): Promise<DashboardData> {
  return {
    kpis: {
      revenue: { value: 142500, trend: 12.5, label: "Gross Revenue" },
      patients: { value: 142, trend: 5.2, label: "Patient Volume" },
      receivables: { value: 28500, trend: -4.1, label: "Pending Receivables" }, // Negative trend here is good!
      occupancy: { value: 85, trend: 1.5, label: "Bed Occupancy" },
    },
    revenueData: [
      { day: "Mon", revenue: 95000 },
      { day: "Tue", revenue: 105000 },
      { day: "Wed", revenue: 98000 },
      { day: "Thu", revenue: 120000 },
      { day: "Fri", revenue: 142500 },
      { day: "Sat", revenue: 130000 },
      { day: "Sun", revenue: 85000 },
    ],
    departmentBreakdown: [
      { name: "Services", value: 45000, color: "#3b82f6" },
      { name: "Consults", value: 55000, color: "#ec4899" },
      { name: "Rooms", value: 42500, color: "#f59e0b" },
    ],
    // Strictly limited to 5 rows from backend
    recentTransactions: [
      { id: "1", time: "10:42 AM", txnNo: "TXN-260501-005", text: "Charge added: General Ward (Day 1)", type: "ROOM", amount: 5000 },
      { id: "2", time: "10:35 AM", txnNo: "TXN-260501-004", text: "Charge added: Dr. Salman (Consult)", type: "DOCTOR", amount: 2000 },
      { id: "3", time: "10:15 AM", txnNo: "TXN-260501-003", text: "Charge added: Complete Blood Count", type: "SERVICE", amount: 800 },
      { id: "4", time: "09:50 AM", txnNo: "TXN-260501-002", text: "Charge added: Chest X-Ray", type: "SERVICE", amount: 1500 },
      { id: "5", time: "09:15 AM", txnNo: "TXN-260501-001", text: "Charge added: Dr. Ayesha (Follow-up)", type: "DOCTOR", amount: 1500 },
    ]
  };
}

export default function AdminDashboardPage() {
  const { kpis, revenueData, departmentBreakdown, recentTransactions } = useLoaderData() as DashboardData;
  const revalidator = useRevalidator();

  // 3. The Polling Mechanism (Fires every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      // revalidate() tells React Router to re-run the loader in the background
      // If the state is 'idle', it means a fetch isn't already happening
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    }, 30000); // 30,000 ms = 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [revalidator]);

  const renderTrend = (trend: number, invertGoodBad = false) => {
    const isPositive = trend > 0;
    const isGood = invertGoodBad ? !isPositive : isPositive;

    return (
      <div className="flex items-baseline gap-2 mt-1">
        <span className={`text-sm font-heading font-bold ${isGood ? 'text-green-500' : 'text-red-500'} flex items-center`}>
          {isPositive ? <IconTrendingUp size={16} className="mr-1" /> : <IconTrendingDown size={16} className="mr-1" />}
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-muted-foreground">vs last week</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground text-sm">Real-time operational health and financial overview.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Subtle indicator that the page is auto-updating */}
          {revalidator.state === "loading" && (
            <span className="text-xs text-muted-foreground animate-pulse">Syncing...</span>
          )}
          <Button variant="outline" className="gap-2">
            <IconCalendarEvent size={18} /> Last 7 Days
          </Button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{kpis.revenue.label}</span>
              <IconCash size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold mt-1">Rs {kpis.revenue.value.toLocaleString()}</span>
            {renderTrend(kpis.revenue.trend)}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{kpis.patients.label}</span>
              <IconUsers size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold mt-1">{kpis.patients.value}</span>
            {renderTrend(kpis.patients.trend)}
          </CardContent>
        </Card>

        {/* Updated KPI Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{kpis.receivables.label}</span>
              <IconAlertCircle size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold mt-1">Rs {kpis.receivables.value.toLocaleString()}</span>
            {/* inverted: going down is good for owed money */}
            {renderTrend(kpis.receivables.trend, true)}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{kpis.occupancy.label}</span>
              <IconBed size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold mt-1">{kpis.occupancy.value}%</span>
            {renderTrend(kpis.occupancy.trend)}
          </CardContent>
        </Card>
      </div>

      {/* ... (Charts remain exactly the same) ... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2 shadow-sm border-border/50 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/10">
            <span className="font-medium text-foreground">7-Day Revenue Trend</span>
          </div>
          <CardContent className="p-6 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dx={-10} tickFormatter={(value) => `Rs ${value / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '6px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/10">
            <span className="font-medium text-foreground">Revenue Breakdown</span>
          </div>
          <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {departmentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '6px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-3 mt-6">
              {departmentBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                  <span className="font-mono font-medium text-foreground">Rs {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Live Transaction Feed Table (Pagination Removed!) */}
      <Card className="shadow-sm border-border/50">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/10">
          <div className="relative w-full max-w-md flex items-center gap-2">
            <IconActivity className="text-primary" size={18} />
            <span className="font-medium">Live Transaction Feed</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-primary">
            View Ledger
          </Button>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[150px]">Txn No</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Transaction Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((txn) => (
              <TableRow key={txn.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="font-mono font-medium text-primary">
                  {txn.txnNo}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground text-sm">
                  {txn.time}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {txn.text}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-medium tracking-wider bg-background">
                    {txn.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-foreground">
                  Rs {txn.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Note: No pagination block here anymore! */}
      </Card>

    </div>
  );
}

