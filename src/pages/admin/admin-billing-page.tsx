import { useEffect, useState } from "react";
import { useLoaderData, useSearchParams, type LoaderFunctionArgs } from "react-router";
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
import { getApiOptions } from "@/lib/utils";

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

export async function adminInvoiceLoader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const page = url.searchParams.get("page") || "1";
    const status = url.searchParams.get("status") || "ALL";

    const statusQuery = status !== "ALL" ? `&status=${status}` : "";

    const [invoicesRes, statsRes] = await Promise.all([
      fetch(`http://localhost:4040/api/v1/invoices?search=${q}&page=${page}&limit=10${statusQuery}`, getApiOptions),
      fetch("http://localhost:4040/api/v1/invoices/stats", getApiOptions)
    ]);

    if (!invoicesRes.ok) {
      const err = await invoicesRes.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch invoices list.");
    }

    if (!statsRes.ok) {
      const err = await statsRes.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch invoice stats.");
    }

    const invoiceData = await invoicesRes.json();
    const statsData = await statsRes.json();

    return {
      invoices: invoiceData.data.invoices,
      stats: statsData.data,
      pagination: invoiceData.data.pagination
    };
  }
  catch (error) {
    console.error("Loader Exception:", error instanceof Error ? error.message : "Unknown error");
    throw new Response("Failed to load invoice data from server.", {
      status: 500,
      statusText: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
}

export default function AdminInvoicesPage() {
  const { invoices, stats, pagination } = useLoaderData() as LoaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const statusFilter = (searchParams.get("status") as "ALL" | "DRAFT" | "ISSUED" | "PAID") || "ALL";

  // Action States
  const [collectPaymentInvoice, setCollectPaymentInvoice] = useState<Invoice | null>(null);
  const [viewReceiptId, setViewReceiptId] = useState<string | null>(null);
  const [manageDraftInvoice, setManageDraftInvoice] = useState<Invoice | null>(null);

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

        newParams.set("page", "1");
        return newParams;
      }, { replace: true });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, setSearchParams]);

  const handleStatusChange = (status: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (status === "ALL") {
        newParams.delete("status");
      } else {
        newParams.set("status", status);
      }
      newParams.set("page", "1");
      return newParams;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      return newParams;
    });
  };

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

          <Tabs value={statusFilter} onValueChange={handleStatusChange} className="w-full sm:w-auto">
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
            {invoices.map((inv) => {
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
                    {new Date(inv.date).toLocaleString()}
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
