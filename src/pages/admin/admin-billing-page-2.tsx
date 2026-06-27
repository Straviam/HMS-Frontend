import { useState } from "react";
import { useLoaderData } from "react-router";
import {
  IconReceipt,
  IconCash,
  IconAlertCircle,
  IconSearch,
  IconFileExport,
  IconChevronLeft,
  IconChevronRight,
  IconEdit
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
import { ManageDraftSheet } from "@/components/transaction/manage-draft-invoice-sheet";

interface Invoice {
  id: string;
  invoiceNo: string;
  patientName: string;
  mrNumber: string;
  totalAmount: number;
  payableAmount: number;
  status: "DRAFT" | "ISSUED" | "PAID";
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

export async function adminInvoiceLoader(): Promise<LoaderData> {
  const mockedInvoices: Invoice[] = [
    { id: "inv-1", invoiceNo: "INV-2026-0001", patientName: "Ali Ahmed", mrNumber: "MR-2026-0001", totalAmount: 3500, payableAmount: 3500, status: "PAID", date: "2026-05-01 10:30 AM" },
    { id: "inv-2", invoiceNo: "INV-2026-0002", patientName: "Sana Khan", mrNumber: "MR-2026-0002", totalAmount: 2000, payableAmount: 2000, status: "ISSUED", date: "2026-05-01 11:15 AM" },
    { id: "inv-3", invoiceNo: "INV-2026-0003", patientName: "Usman Tariq", mrNumber: "MR-2026-0003", totalAmount: 5000, payableAmount: 4500, status: "DRAFT", date: "2026-05-01 12:00 PM" },
    { id: "inv-4", invoiceNo: "INV-2026-0004", patientName: "Fatima Zahra", mrNumber: "MR-2026-0004", totalAmount: 800, payableAmount: 800, status: "ISSUED", date: "2026-05-01 02:15 PM" },
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

  const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "ISSUED" | "PAID">("ALL");

  // Action States
  const [collectPaymentInvoice, setCollectPaymentInvoice] = useState<Invoice | null>(null);
  const [viewReceiptId, setViewReceiptId] = useState<string | null>(null);

  // Prep state for your upcoming Draft Sheet
  const [manageDraftInvoice, setManageDraftInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter === "ALL") return true;
    return inv.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground text-sm">Manage patient billing, collect payments, and track receivables.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <IconFileExport size={18} /> Export CSV
        </Button>
      </div>

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
              <span className="text-sm font-medium text-muted-foreground">Pending Receivables (Issued)</span>
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

          {/* 4. Updated Tabs to reflect 4 options */}
          <Tabs defaultValue="ALL" onValueChange={(v) => setStatusFilter(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full sm:w-[400px] grid-cols-4">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="DRAFT">Active/Draft</TabsTrigger>
              <TabsTrigger value="ISSUED">Awaiting Pay</TabsTrigger>
              <TabsTrigger value="PAID">Paid</TabsTrigger>
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
            {filteredInvoices.map((inv) => {
              let badgeColor = "";
              if (inv.status === "PAID") badgeColor = "text-green-600 border-green-500/30";
              else if (inv.status === "ISSUED") badgeColor = "text-orange-600 border-orange-500/30";
              else if (inv.status === "DRAFT") badgeColor = "text-blue-600 border-blue-500/30";

              return (
                <TableRow key={inv.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-mono font-medium text-primary">
                    {inv.invoiceNo}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {inv.date}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground">{inv.patientName}</div>
                    <div className="font-mono text-muted-foreground text-sm">{inv.mrNumber}</div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium tracking-wider bg-background ${badgeColor}`}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-mono font-medium">
                    Rs {inv.payableAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => {
                        if (inv.status === "ISSUED") setCollectPaymentInvoice(inv);
                        if (inv.status === "DRAFT") setManageDraftInvoice(inv);
                        if (inv.status === "PAID") setViewReceiptId(inv.id);
                      }}
                    >
                      {inv.status === "ISSUED" && (
                        <>
                          <IconCash size={16} /> Collect
                        </>
                      )}

                      {inv.status === "DRAFT" && (
                        <>
                          <IconEdit size={16} /> Manage
                        </>
                      )}

                      {inv.status === "PAID" && (
                        <>
                          <IconReceipt size={16} /> Receipt
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

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
      <ManageDraftSheet
        invoice={manageDraftInvoice}
        open={!!manageDraftInvoice}
        onOpenChange={(open) => !open && setManageDraftInvoice(null)}
      />
    </div>
  );
}
