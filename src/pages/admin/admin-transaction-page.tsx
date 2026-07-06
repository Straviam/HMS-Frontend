import { useEffect, useState } from "react";
import { useLoaderData, useSearchParams, type LoaderFunctionArgs } from "react-router";
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
import { getApiOptions, API_BASE_URL } from "@/lib/utils";

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

export async function adminTransactionLoader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const page = url.searchParams.get("page") || "1";

    const [transactionsRes, statsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/transactions?search=${q}&page=${page}&limit=10`, getApiOptions),
      fetch(`${API_BASE_URL}/transactions/stats`, getApiOptions)
    ]);

    if (!transactionsRes.ok) {
      const err = await transactionsRes.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch transactions list.");
    }

    if (!statsRes.ok) {
      const err = await statsRes.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch transaction stats.");
    }

    const transactionData = await transactionsRes.json();
    const statsData = await statsRes.json();

    return {
      transactions: transactionData.data.transactions,
      stats: statsData.data,
      pagination: transactionData.data.pagination
    };
  }
  catch (error) {
    console.error("Loader Exception:", error instanceof Error ? error.message : "Unknown error");
    throw new Response("Failed to load transaction data from server.", {
      status: 500,
      statusText: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
}

// Main Component
export default function AdminTransactionsPage() {
  const { transactions, stats, pagination } = useLoaderData() as LoaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

  // Debounced Search Logic
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchParams((prev) => {
        const currentQ = prev.get("q") || "";
        if (searchTerm === currentQ) return prev;

        const newParams = new URLSearchParams(prev);
        if (searchTerm) {
          newParams.set("q", searchTerm);
        } else {
          newParams.delete("q");
        }

        newParams.set("page", "1"); // Reset to page 1 on new search
        return newParams;
      }, { replace: true });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      return newParams;
    });
  };

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

      {/* Data Table  */}
      <Card className="shadow-sm border-border/50">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/10">
          <div className="relative w-full max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by TXN No, Patient..."
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
                  {new Date(txn.date).toLocaleString()}
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
            Showing <strong className="text-foreground">{(pagination.page - 1) * 10 + 1}</strong> to <strong className="text-foreground">{Math.min(pagination.page * 10, pagination.totalCount)}</strong> of <strong className="text-foreground">{pagination.totalCount}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <IconChevronLeft size={16} />
            </Button>
            <div className="font-medium px-2">Page {pagination.page} of {pagination.totalPages}</div>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(pagination.page + 1)}
            >
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
