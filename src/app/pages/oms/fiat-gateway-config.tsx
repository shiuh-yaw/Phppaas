/**
 * Fiat Gateway Configuration - OMS Merchant
 * Multi-tenant CVPay gateway settings management
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Settings,
  Save,
  TestTube,
  CheckCircle2,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useOmsTranslation } from "../../components/oms/oms-i18n";
import { RbacGuard } from "../../components/oms/oms-rbac";
import { logAuditEvent } from "../../components/oms/oms-audit-log";
import { toast } from "sonner";
import type { FiatGatewayConfig, CVPayPaymentMethod, CVPayCurrency } from "../../services/cvpay-types";
import { PAYMENT_METHODS } from "../../services/cvpay-service";
import { createCVPayClient } from "../../services/cvpay-client";

export default function FiatGatewayConfigPage() {
  const { t } = useOmsTranslation();
  
  const [config, setConfig] = useState<FiatGatewayConfig>({
    id: "cfg_1",
    tenantId: "tenant_1",
    provider: "CVPAY",
    merchantId: "MERCHANT_TEST_001",
    apiKey: "pk_test_1234567890",
    apiSecret: "sk_test_0987654321abcdef",
    environment: "SANDBOX",
    apiBaseUrl: "https://api-sandbox.cvpay.org",
    enabled: true,
    supportedMethods: ["GCASH", "PAYMAYA", "BDO", "BPI", "7ELEVEN"],
    supportedCurrencies: ["PHP"],
    depositMin: 100,
    depositMax: 100000,
    withdrawalMin: 100,
    withdrawalMax: 100000,
    dailyDepositLimit: 500000,
    dailyWithdrawalLimit: 500000,
    depositFeeType: "PERCENTAGE",
    depositFeeValue: 0,
    withdrawalFeeType: "PERCENTAGE",
    withdrawalFeeValue: 1,
    notifyUrl: "https://api.lucktaya.com/webhooks/cvpay",
    returnUrl: "https://lucktaya.com/wallet",
    autoApproveDeposits: true,
    autoApproveWithdrawals: false,
    autoApprovalThreshold: 10000,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: "admin_001",
    updatedBy: "admin_001",
  });

  const [showApiSecret, setShowApiSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUpdate = <K extends keyof FiatGatewayConfig>(key: K, value: FiatGatewayConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const client = createCVPayClient(config);
      const response = await client.getMerchantInfo();
      
      setTestResult({
        success: true,
        message: `Connected to CVPay. Merchant: ${response.data.merchantName} (${response.data.status})`,
      });
      
      logAuditEvent({
        action: "TEST_GATEWAY_CONNECTION",
        category: "FIAT_CONFIG",
        details: { provider: "CVPAY", success: true },
      });
      
      toast.success(t("Connection test successful!"));
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || t("Connection test failed"),
      });
      
      logAuditEvent({
        action: "TEST_GATEWAY_CONNECTION",
        category: "FIAT_CONFIG",
        details: { provider: "CVPAY", success: false, error: error.message },
      });
      
      toast.error(t("Connection test failed"));
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logAuditEvent({
        action: "UPDATE_GATEWAY_CONFIG",
        category: "FIAT_CONFIG",
        details: { provider: "CVPAY", merchantId: config.merchantId },
      });
      
      toast.success(t("Configuration saved successfully!"));
    } finally {
      setSaving(false);
    }
  };

  const togglePaymentMethod = (method: CVPayPaymentMethod) => {
    const current = config.supportedMethods;
    const updated = current.includes(method)
      ? current.filter(m => m !== method)
      : [...current, method];
    handleUpdate("supportedMethods", updated);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("Fiat Gateway Configuration")}</h1>
          <p className="mt-1 text-sm text-gray-600">{t("Configure CVPay payment gateway settings")}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
            <TestTube className={`mr-2 size-4 ${testing ? "animate-pulse" : ""}`} />
            {testing ? t("Testing...") : t("Test Connection")}
          </Button>
          <RbacGuard permission="fiat:config:write">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 size-4" />
              {saving ? t("Saving...") : t("Save Changes")}
            </Button>
          </RbacGuard>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          {testResult.success ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertTriangle className="size-4" />
          )}
          <AlertTitle>{testResult.success ? t("Success") : t("Error")}</AlertTitle>
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Basic Settings")}</CardTitle>
              <CardDescription>{t("General gateway configuration")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("Enable Gateway")}</Label>
                  <p className="text-sm text-gray-500">{t("Allow fiat transactions through CVPay")}</p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => handleUpdate("enabled", checked)}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="environment">{t("Environment")}</Label>
                  <Select
                    value={config.environment}
                    onValueChange={(value) => handleUpdate("environment", value as "SANDBOX" | "PRODUCTION")}
                  >
                    <SelectTrigger id="environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SANDBOX">Sandbox (Testing)</SelectItem>
                      <SelectItem value="PRODUCTION">Production (Live)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">{t("Provider")}</Label>
                  <Input id="provider" value={config.provider} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchantId">{t("Merchant ID")}</Label>
                  <Input
                    id="merchantId"
                    value={config.merchantId}
                    onChange={(e) => handleUpdate("merchantId", e.target.value)}
                    placeholder="MERCHANT_001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t("API Key")}</Label>
                  <Input
                    id="apiKey"
                    value={config.apiKey}
                    onChange={(e) => handleUpdate("apiKey", e.target.value)}
                    placeholder="pk_..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="apiSecret">{t("API Secret")}</Label>
                  <div className="relative">
                    <Input
                      id="apiSecret"
                      type={showApiSecret ? "text" : "password"}
                      value={config.apiSecret}
                      onChange={(e) => handleUpdate("apiSecret", e.target.value)}
                      placeholder="sk_..."
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="apiBaseUrl">{t("API Base URL")}</Label>
                  <Input
                    id="apiBaseUrl"
                    value={config.apiBaseUrl}
                    onChange={(e) => handleUpdate("apiBaseUrl", e.target.value)}
                    placeholder="https://api.cvpay.org"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limits & Fees */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Limits & Fees")}</CardTitle>
              <CardDescription>{t("Transaction limits and fee configuration")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-3 font-semibold">{t("Deposit Limits")}</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="depositMin">{t("Minimum (₱)")}</Label>
                    <Input
                      id="depositMin"
                      type="number"
                      value={config.depositMin}
                      onChange={(e) => handleUpdate("depositMin", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depositMax">{t("Maximum (₱)")}</Label>
                    <Input
                      id="depositMax"
                      type="number"
                      value={config.depositMax}
                      onChange={(e) => handleUpdate("depositMax", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyDepositLimit">{t("Daily Limit (₱)")}</Label>
                    <Input
                      id="dailyDepositLimit"
                      type="number"
                      value={config.dailyDepositLimit}
                      onChange={(e) => handleUpdate("dailyDepositLimit", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 font-semibold">{t("Withdrawal Limits")}</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="withdrawalMin">{t("Minimum (₱)")}</Label>
                    <Input
                      id="withdrawalMin"
                      type="number"
                      value={config.withdrawalMin}
                      onChange={(e) => handleUpdate("withdrawalMin", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="withdrawalMax">{t("Maximum (₱)")}</Label>
                    <Input
                      id="withdrawalMax"
                      type="number"
                      value={config.withdrawalMax}
                      onChange={(e) => handleUpdate("withdrawalMax", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyWithdrawalLimit">{t("Daily Limit (₱)")}</Label>
                    <Input
                      id="dailyWithdrawalLimit"
                      type="number"
                      value={config.dailyWithdrawalLimit}
                      onChange={(e) => handleUpdate("dailyWithdrawalLimit", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 font-semibold">{t("Fee Configuration")}</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("Deposit Fee Type")}</Label>
                    <Select
                      value={config.depositFeeType}
                      onValueChange={(value) => handleUpdate("depositFeeType", value as "PERCENTAGE" | "FIXED")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">{t("Percentage")}</SelectItem>
                        <SelectItem value="FIXED">{t("Fixed Amount")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depositFeeValue">
                      {config.depositFeeType === "PERCENTAGE" ? t("Deposit Fee (%)") : t("Deposit Fee (₱)")}
                    </Label>
                    <Input
                      id="depositFeeValue"
                      type="number"
                      step="0.01"
                      value={config.depositFeeValue}
                      onChange={(e) => handleUpdate("depositFeeValue", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Withdrawal Fee Type")}</Label>
                    <Select
                      value={config.withdrawalFeeType}
                      onValueChange={(value) => handleUpdate("withdrawalFeeType", value as "PERCENTAGE" | "FIXED")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">{t("Percentage")}</SelectItem>
                        <SelectItem value="FIXED">{t("Fixed Amount")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="withdrawalFeeValue">
                      {config.withdrawalFeeType === "PERCENTAGE" ? t("Withdrawal Fee (%)") : t("Withdrawal Fee (₱)")}
                    </Label>
                    <Input
                      id="withdrawalFeeValue"
                      type="number"
                      step="0.01"
                      value={config.withdrawalFeeValue}
                      onChange={(e) => handleUpdate("withdrawalFeeValue", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Payment Methods")}</CardTitle>
              <CardDescription>{t("Enable/disable payment channels")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("Method")}</TableHead>
                      <TableHead>{t("Channel")}</TableHead>
                      <TableHead>{t("Min/Max")}</TableHead>
                      <TableHead>{t("Fee")}</TableHead>
                      <TableHead className="text-right">{t("Enabled")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(PAYMENT_METHODS).map((method) => (
                      <TableRow key={method.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="flex size-8 items-center justify-center rounded-md text-xs font-bold"
                              style={{ background: method.color, color: method.textColor }}
                            >
                              {method.icon}
                            </div>
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-xs text-gray-500">{method.nameLocal}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{method.channelType}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          ₱{method.minAmount.toLocaleString()} - ₱{method.maxAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{method.fee}</TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={config.supportedMethods.includes(method.id)}
                            onCheckedChange={() => togglePaymentMethod(method.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Automation */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Automation Settings")}</CardTitle>
              <CardDescription>{t("Auto-approval and processing rules")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("Auto-approve Deposits")}</Label>
                  <p className="text-sm text-gray-500">{t("Automatically approve all deposits")}</p>
                </div>
                <Switch
                  checked={config.autoApproveDeposits}
                  onCheckedChange={(checked) => handleUpdate("autoApproveDeposits", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("Auto-approve Withdrawals")}</Label>
                  <p className="text-sm text-gray-500">{t("Automatically approve withdrawals below threshold")}</p>
                </div>
                <Switch
                  checked={config.autoApproveWithdrawals}
                  onCheckedChange={(checked) => handleUpdate("autoApproveWithdrawals", checked)}
                />
              </div>

              {config.autoApproveWithdrawals && (
                <div className="space-y-2">
                  <Label htmlFor="autoApprovalThreshold">{t("Auto-approval Threshold (₱)")}</Label>
                  <Input
                    id="autoApprovalThreshold"
                    type="number"
                    value={config.autoApprovalThreshold}
                    onChange={(e) => handleUpdate("autoApprovalThreshold", Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    {t("Withdrawals above this amount require manual approval")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhook URLs */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Webhook & Redirect URLs")}</CardTitle>
              <CardDescription>{t("Callback endpoints for CVPay")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notifyUrl">{t("Webhook Notification URL")}</Label>
                <Input
                  id="notifyUrl"
                  value={config.notifyUrl}
                  onChange={(e) => handleUpdate("notifyUrl", e.target.value)}
                  placeholder="https://api.yoursite.com/webhooks/cvpay"
                />
                <p className="text-xs text-gray-500">
                  {t("CVPay will send transaction status updates to this URL")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnUrl">{t("User Return URL")}</Label>
                <Input
                  id="returnUrl"
                  value={config.returnUrl}
                  onChange={(e) => handleUpdate("returnUrl", e.target.value)}
                  placeholder="https://yoursite.com/wallet"
                />
                <p className="text-xs text-gray-500">
                  {t("Users will be redirected here after completing payment")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Gateway Status")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t("Status")}</span>
                <Badge variant={config.enabled ? "default" : "outline"} className={config.enabled ? "bg-green-100 text-green-700" : ""}>
                  {config.enabled ? t("Enabled") : t("Disabled")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t("Environment")}</span>
                <Badge variant="outline">
                  {config.environment}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t("Provider")}</span>
                <span className="text-sm font-medium">{config.provider}</span>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Information")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>{t("CVPay is a Philippine-based payment gateway supporting e-wallets, banks, and OTC channels.")}</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-gray-900">{t("Supported Currencies:")}</p>
                <p className="mt-1">PHP (Philippine Peso)</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-gray-900">{t("Last Updated:")}</p>
                <p className="mt-1">{new Date(config.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Quick Actions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/oms/fiat-transactions">
                  <Wallet className="mr-2 size-4" />
                  {t("View Transactions")}
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleTestConnection}>
                <RefreshCw className="mr-2 size-4" />
                {t("Test Connection")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
