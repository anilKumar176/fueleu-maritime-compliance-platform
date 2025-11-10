"use client"

import { useState, useEffect } from 'react'
import { BankingRecord } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Coins, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { toast } from 'sonner'

export default function BankingTab() {
  const [records, setRecords] = useState<BankingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<BankingRecord | null>(null)
  const [bankAmount, setBankAmount] = useState('')
  const [applyAmount, setApplyAmount] = useState('')
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'bank' | 'apply'>('bank')

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/banking-records?limit=100')
      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error('Error fetching banking records:', error)
    } finally {
      setLoading(false)
    }
  }

  const openBankDialog = (record: BankingRecord) => {
    setSelectedRecord(record)
    setActionType('bank')
    setBankAmount('')
    setActionDialogOpen(true)
  }

  const openApplyDialog = (record: BankingRecord) => {
    setSelectedRecord(record)
    setActionType('apply')
    setApplyAmount('')
    setActionDialogOpen(true)
  }

  const handleBankAction = async () => {
    if (!selectedRecord) return

    const amount = parseFloat(actionType === 'bank' ? bankAmount : applyAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount')
      return
    }

    try {
      let newBanked = selectedRecord.bankedCb
      let newApplied = selectedRecord.appliedCb
      let newRemaining = selectedRecord.remainingCb

      if (actionType === 'bank') {
        if (amount > newRemaining) {
          toast.error('Cannot bank more than remaining CB')
          return
        }
        newBanked += amount
        newRemaining -= amount
      } else {
        if (amount > newBanked) {
          toast.error('Cannot apply more than banked CB')
          return
        }
        newApplied += amount
        newBanked -= amount
        newRemaining += amount
      }

      const response = await fetch(`/api/banking-records?id=${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankedCb: newBanked,
          appliedCb: newApplied,
          remainingCb: newRemaining
        })
      })

      if (response.ok) {
        toast.success(`Successfully ${actionType === 'bank' ? 'banked' : 'applied'} ${amount.toFixed(1)} CB`)
        setActionDialogOpen(false)
        fetchRecords()
      } else {
        toast.error('Failed to update banking record')
      }
    } catch (error) {
      console.error('Error updating banking record:', error)
      toast.error('An error occurred')
    }
  }

  const totalBanked = records.reduce((sum, r) => sum + r.bankedCb, 0)
  const totalApplied = records.reduce((sum, r) => sum + r.appliedCb, 0)
  const totalRemaining = records.reduce((sum, r) => sum + r.remainingCb, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading banking records...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banked CB</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBanked.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Available for future use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applied CB</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplied.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Used from previous years</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Remaining CB</CardTitle>
            {totalRemaining >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalRemaining >= 0 ? '+' : ''}{totalRemaining.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Current balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banking Records</CardTitle>
          <CardDescription>
            Manage compliance balance banking and borrowing for vessels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vessel</TableHead>
                  <TableHead className="text-center">Year</TableHead>
                  <TableHead className="text-right">Banked CB</TableHead>
                  <TableHead className="text-right">Applied CB</TableHead>
                  <TableHead className="text-right">Remaining CB</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No banking records found
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.vesselName}</TableCell>
                      <TableCell className="text-center">{record.year}</TableCell>
                      <TableCell className="text-right">{record.bankedCb.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{record.appliedCb.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                        <span className={record.remainingCb >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {record.remainingCb >= 0 ? '+' : ''}{record.remainingCb.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {record.remainingCb >= 0 ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                            Surplus
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Deficit
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openBankDialog(record)}
                            disabled={record.remainingCb <= 0}
                          >
                            Bank
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openApplyDialog(record)}
                            disabled={record.bankedCb <= 0}
                          >
                            Apply
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'bank' ? 'Bank Compliance Balance' : 'Apply Banked CB'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'bank' 
                ? 'Save excess compliance balance for future use'
                : 'Use previously banked compliance balance'}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Vessel</Label>
                <div className="font-medium">{selectedRecord.vesselName} ({selectedRecord.year})</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Banked CB</Label>
                  <div className="font-medium">{selectedRecord.bankedCb.toFixed(1)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Remaining CB</Label>
                  <div className="font-medium">{selectedRecord.remainingCb.toFixed(1)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount to {actionType === 'bank' ? 'Bank' : 'Apply'}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.1"
                  placeholder="Enter amount"
                  value={actionType === 'bank' ? bankAmount : applyAmount}
                  onChange={(e) => actionType === 'bank' ? setBankAmount(e.target.value) : setApplyAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {actionType === 'bank' 
                    ? `Maximum: ${selectedRecord.remainingCb.toFixed(1)}`
                    : `Maximum: ${selectedRecord.bankedCb.toFixed(1)}`}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBankAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
