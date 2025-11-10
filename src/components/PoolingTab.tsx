"use client"

import { useState, useEffect } from 'react'
import { Pool, PoolMember } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'

export default function PoolingTab() {
  const [pools, setPools] = useState<Pool[]>([])
  const [poolMembers, setPoolMembers] = useState<PoolMember[]>([])
  const [loading, setLoading] = useState(true)
  const [createPoolOpen, setCreatePoolOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [newPoolName, setNewPoolName] = useState('')
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null)
  const [newMemberVessel, setNewMemberVessel] = useState('')
  const [newMemberContribution, setNewMemberContribution] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [poolsRes, membersRes] = await Promise.all([
        fetch('/api/pools?limit=100'),
        fetch('/api/pool-members?limit=100')
      ])
      
      if (poolsRes.ok && membersRes.ok) {
        const poolsData = await poolsRes.json()
        const membersData = await membersRes.json()
        setPools(poolsData)
        setPoolMembers(membersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPool = async () => {
    if (!newPoolName.trim()) {
      toast.error('Please enter a pool name')
      return
    }

    try {
      const response = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolName: newPoolName.trim() })
      })

      if (response.ok) {
        toast.success('Pool created successfully')
        setCreatePoolOpen(false)
        setNewPoolName('')
        fetchData()
      } else {
        toast.error('Failed to create pool')
      }
    } catch (error) {
      console.error('Error creating pool:', error)
      toast.error('An error occurred')
    }
  }

  const addMember = async () => {
    if (!selectedPoolId) {
      toast.error('Please select a pool')
      return
    }
    if (!newMemberVessel.trim()) {
      toast.error('Please enter a vessel name')
      return
    }
    const contribution = parseFloat(newMemberContribution)
    if (isNaN(contribution)) {
      toast.error('Please enter a valid contribution amount')
      return
    }

    try {
      const response = await fetch('/api/pool-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: selectedPoolId,
          vesselName: newMemberVessel.trim(),
          contributionCb: contribution
        })
      })

      if (response.ok) {
        toast.success('Member added successfully')
        setAddMemberOpen(false)
        setNewMemberVessel('')
        setNewMemberContribution('')
        fetchData()
      } else {
        toast.error('Failed to add member')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error('An error occurred')
    }
  }

  const getPoolMembers = (poolId: number) => {
    return poolMembers.filter(m => m.poolId === poolId)
  }

  const calculatePoolTotal = (poolId: number) => {
    return getPoolMembers(poolId).reduce((sum, m) => sum + m.contributionCb, 0)
  }

  const calculatePoolAverage = (poolId: number) => {
    const members = getPoolMembers(poolId)
    if (members.length === 0) return 0
    return calculatePoolTotal(poolId) / members.length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading pools...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Compliance Pooling</h2>
          <p className="text-muted-foreground">Manage compliance pools and vessel contributions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreatePoolOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pool
          </Button>
          <Button variant="outline" onClick={() => setAddMemberOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {pools.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pools created yet. Create your first pool to get started.</p>
          </CardContent>
        </Card>
      ) : (
        pools.map(pool => {
          const members = getPoolMembers(pool.id)
          const totalCb = calculatePoolTotal(pool.id)
          const avgCb = calculatePoolAverage(pool.id)

          return (
            <Card key={pool.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pool.poolName}</CardTitle>
                    <CardDescription>
                      {members.length} member{members.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      <span className={totalCb >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {totalCb >= 0 ? '+' : ''}{totalCb.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Total Pool CB</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Average CB per Vessel</div>
                    <div className="text-xl font-semibold">
                      <span className={avgCb >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {avgCb >= 0 ? '+' : ''}{avgCb.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Pool Status</div>
                    <div>
                      {totalCb >= 0 ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Compliant
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Non-Compliant
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {members.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vessel</TableHead>
                          <TableHead className="text-right">Contribution (CB)</TableHead>
                          <TableHead className="text-right">Before Pool</TableHead>
                          <TableHead className="text-right">After Pool</TableHead>
                          <TableHead className="text-center">Status Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map(member => {
                          const beforePool = member.contributionCb
                          const afterPool = avgCb
                          const wasCompliant = beforePool >= 0
                          const isCompliant = afterPool >= 0
                          const statusChanged = wasCompliant !== isCompliant

                          return (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">{member.vesselName}</TableCell>
                              <TableCell className="text-right">
                                <span className={member.contributionCb >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  {member.contributionCb >= 0 ? '+' : ''}{member.contributionCb.toFixed(1)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={beforePool >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  {beforePool >= 0 ? '+' : ''}{beforePool.toFixed(1)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={afterPool >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  {afterPool >= 0 ? '+' : ''}{afterPool.toFixed(1)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {statusChanged ? (
                                  isCompliant ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                      Now Compliant
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">
                                      <TrendingDown className="h-3 w-3 mr-1" />
                                      Now Non-Compliant
                                    </Badge>
                                  )
                                ) : (
                                  <Badge variant="secondary">No Change</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}

      <Dialog open={createPoolOpen} onOpenChange={setCreatePoolOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Pool</DialogTitle>
            <DialogDescription>
              Create a new compliance pool for vessel collaboration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="poolName">Pool Name</Label>
              <Input
                id="poolName"
                placeholder="e.g., European Shipping Alliance"
                value={newPoolName}
                onChange={(e) => setNewPoolName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePoolOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createPool}>Create Pool</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pool Member</DialogTitle>
            <DialogDescription>
              Add a vessel to an existing compliance pool
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pool">Select Pool</Label>
              <Select onValueChange={(value) => setSelectedPoolId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pool..." />
                </SelectTrigger>
                <SelectContent>
                  {pools.map(pool => (
                    <SelectItem key={pool.id} value={pool.id.toString()}>
                      {pool.poolName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name</Label>
              <Input
                id="vesselName"
                placeholder="e.g., Atlantic Star"
                value={newMemberVessel}
                onChange={(e) => setNewMemberVessel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contribution">CB Contribution</Label>
              <Input
                id="contribution"
                type="number"
                step="0.1"
                placeholder="e.g., 8500.5"
                value={newMemberContribution}
                onChange={(e) => setNewMemberContribution(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter positive for surplus, negative for deficit
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
