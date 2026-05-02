import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  IconReceipt,
  IconCash,
  IconAlertCircle,
  IconSearch,
  IconFileExport,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { PaymentCollectionSheet } from "@/components/transaction/payment-collection-sheet";
import { InvoiceDetailSheet } from "@/components/transaction/transaction-invoice-sheet";

interface Invoice {
  id: string;
  invoiceNo: string;
  patientName: string;
  mrNumber: string;
  totalAmount: number;
  payableAmount: number;
  status: "PENDING" | "DONE";
  date: string;
}

interface LoaderData {
  invoices: Invoice[];
  stats: {
    totalCollectedToday: number;
    totalReceivables: number;
    invoicesGenerated: number;
  };
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
}

// Data Loader
export async function adminInvoiceLoader(): Promise<LoaderData> {
  const mockedInvoices: Invoice[] = [
    { id: "inv-1", invoiceNo: "INV-2026-0001", patientName: "Ali Ahmed", mrNumber: "MR-2026-0001", totalAmount: 3500, payableAmount: 3500, status: "DONE", date: "2026-05-01 10:30 AM" },
    { id: "inv-2", invoiceNo: "INV-2026-0002", patientName: "Sana Khan", mrNumber: "MR-2026-0002", totalAmount: 2000, payableAmount: 2000, status: "PENDING", date: "2026-05-01 11:15 AM" },
    { id: "inv-3", invoiceNo: "INV-2026-0003", patientName: "Usman Tariq", mrNumber: "MR-2026-0003", totalAmount: 5000, payableAmount: 4500, status: "DONE", date: "2026-05-01 12:00 PM" },
    { id: "inv-4", invoiceNo: "INV-2026-0004", patientName: "Fatima Zahra", mrNumber: "MR-2026-0004", totalAmount: 800, payableAmount: 800, status: "PENDING", date: "2026-05-01 02:15 PM" },
  ];

  return {
    invoices: mockedInvoices,
    stats: { totalCollectedToday: 8000, totalReceivables: 2800, invoicesGenerated: 24 },
    pagination: { page: 1, totalPages: 12, totalCount: 580 }
  };
}

export default function AdminInvoicesPage() {
  const { invoices, stats, pagination } = useLoaderData() as LoaderData;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "DONE">("ALL");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [collectPaymentInvoice, setCollectPaymentInvoice] = useState<Invoice | null>(null);
  const [viewReceiptId, setViewReceiptId] = useState<string | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter === "ALL") return true;
    return inv.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header (Exact match to Patient Page) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground text-sm">Manage patient billing, collect payments, and track receivables.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <IconFileExport size={18} /> Export CSV
        </Button>
      </div>

      {/* KPI Dashboard (Exact match to Patient Page) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Collected Today</span>
              <IconCash size={20} className="text-green-500/70" />
            </div>
            <span className="text-3xl font-heading font-bold">Rs {stats.totalCollectedToday.toLocaleString()}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Pending Receivables</span>
              <IconAlertCircle size={20} className="text-orange-500/70" />
            </div>
            <span className="text-3xl font-heading font-bold">Rs {stats.totalReceivables.toLocaleString()}</span>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Invoices Generated</span>
              <IconReceipt size={20} className="text-muted-foreground/50" />
            </div>
            <span className="text-3xl font-heading font-bold">{stats.invoicesGenerated}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/10">
          <div className="relative w-full max-w-md">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by Invoice No or MR Number..."
              className="pl-10 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs defaultValue="ALL" onValueChange={(v) => setStatusFilter(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full sm:w-[300px] grid-cols-3">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="DONE">Paid</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[150px]">Invoice No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Patient Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Payable Amount</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-muted/10 transition-colors">

                {/* ID styling from Patient Page */}
                <TableCell className="font-mono font-medium text-primary">
                  {inv.invoiceNo}
                </TableCell>

                {/* Secondary data styling */}
                <TableCell className="text-sm text-muted-foreground">
                  {inv.date}
                </TableCell>

                {/* Name styling from Patient Page */}
                <TableCell>
                  <div className="font-medium text-foreground">{inv.patientName}</div>
                  <div className="font-mono text-muted-foreground text-sm">{inv.mrNumber}</div>
                </TableCell>

                {/* Tag with color applied (as requested) */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium tracking-wider bg-background ${inv.status === "DONE"
                      ? "text-green-600 border-green-500/30"
                      : "text-orange-600 border-orange-500/30"
                      }`}
                  >
                    {inv.status}
                  </Badge>
                </TableCell>

                {/* Amount styling */}
                <TableCell className="text-right font-mono font-medium">
                  Rs {inv.payableAmount.toLocaleString()}
                </TableCell>

                {/* Button style*/}
                <TableCell className="text-right">
                  {inv.status === "PENDING" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setCollectPaymentInvoice(inv)} // Open Collection Form
                    >
                      Collect Payment
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setViewReceiptId(inv.id)} // Open Details/Receipt
                    >
                      View Receipt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls (Exact match to Patient Page) */}
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

      <PaymentCollectionSheet
        invoice={collectPaymentInvoice}
        open={!!collectPaymentInvoice}
        onOpenChange={(open) => !open && setCollectPaymentInvoice(null)}
      />

      <InvoiceDetailSheet
        transactionId={viewReceiptId}
        open={!!viewReceiptId}
        onOpenChange={(open) => !open && setViewReceiptId(null)}
      />
    </div>
  );
}
