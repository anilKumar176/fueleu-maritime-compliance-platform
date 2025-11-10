"use client"

import { useState, useEffect } from 'react'
import { Route } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'

export default function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [baselineRoute, setBaselineRoute] = useState<Route | null>(null)

  useEffect(() => {
    fetchRoutes()
  }, [])

  useEffect(() => {
    filterRoutes()
  }, [routes, searchTerm, yearFilter])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/routes?limit=100')
      if (response.ok) {
        const data = await response.json()
        setRoutes(data)
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRoutes = () => {
    let filtered = routes

    if (searchTerm) {
      filtered = filtered.filter(route =>
        route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.vesselName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(route => route.year === parseInt(yearFilter))
    }

    setFilteredRoutes(filtered)
  }

  const setAsBaseline = (route: Route) => {
    setBaselineRoute(route)
    localStorage.setItem('baselineRoute', JSON.stringify(route))
  }

  const years = Array.from(new Set(routes.map(r => r.year))).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading routes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maritime Routes</CardTitle>
          <CardDescription>
            View and analyze all maritime routes with compliance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by route or vessel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {baselineRoute && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Baseline: {baselineRoute.routeName} ({baselineRoute.vesselName})
              </p>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead className="text-right">Distance (NM)</TableHead>
                  <TableHead className="text-right">Fuel (MT)</TableHead>
                  <TableHead className="text-right">GHG Intensity</TableHead>
                  <TableHead className="text-right">Compliance Balance</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Year</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No routes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoutes.map(route => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.routeName}</TableCell>
                      <TableCell>{route.vesselName}</TableCell>
                      <TableCell className="text-right">{route.distanceNm.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{route.fuelConsumedMt.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {route.ghgIntensity.toFixed(1)} gCO₂eq/MJ
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={route.complianceBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {route.complianceBalance >= 0 ? '+' : ''}{route.complianceBalance.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {route.complianceBalance >= 0 ? (
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
                      </TableCell>
                      <TableCell className="text-center">{route.year}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAsBaseline(route)}
                        >
                          Set Baseline
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
