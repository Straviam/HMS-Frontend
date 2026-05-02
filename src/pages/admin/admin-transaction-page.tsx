import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  IconReceipt2,
  IconActivity,
  IconStethoscope,
  IconBed,
  IconSearch,
  IconFileExport,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { TransactionAuditSheet } from "@/components/transaction/transaction-audit-sheet";

interface Transaction {
  id: string;
  txnNo: string;
  patientName: string;
  type: "SERVICE" | "DOCTOR" | "ROOM";
  detail: string;
  amount: number;
  date: string;
}

interface LoaderData {
  transactions: Transaction[];
  stats: {
    totalToday: number;
    serviceRev: number;
    doctorRev: number;
    roomRev: number;
  };
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
}

// Data Loader (Simulating a paginated database query)
export async function adminTransactionLoader(): Promise<LoaderData> {
  const mockedTransactions: Transaction[] = [
    { id: "1", txnNo: "TXN-260501-001", patientName: "Ali Ahmed", type: "SERVICE", detail: "Chest X-Ray", amount: 1500, date: "2026-05-01 10:30 AM" },
    { id: "2", txnNo: "TXN-260501-002", patientName: "Sana Khan", type: "DOCTOR", detail: "Dr. Salman (Consult)", amount: 2000, date: "2026-05-01 11:15 AM" },
    { id: "3", txnNo: "TXN-260501-003", patientName: "Usman Tariq", type: "ROOM", detail: "General Ward (Day 1)", amount: 5000, date: "2026-05-01 12:00 PM" },
    { id: "4", txnNo: "TXN-260501-004", patientName: "Fatima Zahra", type: "SERVICE", detail: "Complete Blood Count", amount: 800, date: "2026-05-01 02:15 PM" },
    { id: "5", txnNo: "TXN-260501-005", patientName: "Zain Malik", type: "DOCTOR", detail: "Dr. Ayesha (Follow-up)", amount: 1500, date: "2026-05-01 03:00 PM" },
  ];

  return {
    transactions: mockedTransactions,
    stats: { totalToday: 10800, serviceRev: 2300, doctorRev: 3500, roomRev: 5000 },
    pagination: { page: 1, totalPages: 45, totalCount: 2240 }
  };
}

// Main Component
export default function AdminTransactionsPage() {
  const { transactions, stats, pagination } = useLoaderData() as LoaderData;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // NOTE: this is the new flow of doing the same thing as done in doctors
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Master Ledger</h1>
          <p className="text-muted-foreground text-sm">Chronological record of all hospital charges and financial transactions.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <IconFileExport size={18} /> Export CSV
        </Button>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Revenue Today</span>
              <IconReceipt2 size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold text-primary">Rs {stats.totalToday.toLocaleString()}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Service Revenue</span>
              <IconActivity size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold">Rs {stats.serviceRev.toLocaleString()}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Doctor Revenue</span>
              <IconStethoscope size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold">Rs {stats.doctorRev.toLocaleString()}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Room Revenue</span>
              <IconBed size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold">Rs {stats.roomRev.toLocaleString()}</span>
          </CardContent>
        </Card>
      </div>

      {/* High-Density Data Table Section */}
      <Card className="shadow-sm border-border/50">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/10">
          <div className="relative w-full max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by TXN No, Patient, or Detail..."
              className="pl-10 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[180px]">Txn No</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="font-mono font-medium text-primary">
                  {txn.txnNo}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {txn.date}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {txn.patientName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-medium tracking-wider bg-background uppercase">
                    {txn.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {txn.detail}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  Rs {txn.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setSelectedTxnId(txn.id)}
                  >
                    Inspect Record
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="p-4 border-t bg-muted/10 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Showing <strong className="text-foreground">{(pagination.page - 1) * 50 + 1}</strong> to <strong className="text-foreground">{Math.min(pagination.page * 50, pagination.totalCount)}</strong> of <strong className="text-foreground">{pagination.totalCount}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page === 1} className="h-8 w-8 p-0">
              <IconChevronLeft size={16} />
            </Button>
            <div className="font-medium px-2">Page {pagination.page} of {pagination.totalPages}</div>
            <Button variant="outline" size="sm" disabled={pagination.page === pagination.totalPages} className="h-8 w-8 p-0">
              <IconChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
      <TransactionAuditSheet
        transactionId={selectedTxnId}
        open={!!selectedTxnId}
        onOpenChange={(open) => !open && setSelectedTxnId(null)}
      />
    </div>
  );
}
