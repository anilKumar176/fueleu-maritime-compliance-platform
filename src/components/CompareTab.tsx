"use client"

import { useState, useEffect } from 'react'
import { Route } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

export default function CompareTab() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [baselineRoute, setBaselineRoute] = useState<Route | null>(null)
  const [comparisonRoute, setComparisonRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBaseline()
    fetchRoutes()
  }, [])

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

  const loadBaseline = () => {
    const saved = localStorage.getItem('baselineRoute')
    if (saved) {
      try {
        setBaselineRoute(JSON.parse(saved))
      } catch (error) {
        console.error('Error parsing baseline:', error)
      }
    }
  }

  const selectComparison = (routeId: string) => {
    const route = routes.find(r => r.id === parseInt(routeId))
    setComparisonRoute(route || null)
  }

  const calculateDifference = (baseline: number, comparison: number) => {
    const diff = comparison - baseline
    const percentChange = ((diff / baseline) * 100)
    return { diff, percentChange }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading routes...</div>
        </CardContent>
      </Card>
    )
  }

  if (!baselineRoute) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a baseline route in the Routes tab first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare Routes</CardTitle>
          <CardDescription>
            Compare baseline route with another route to analyze performance differences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Baseline Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Current Baseline</div>
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                {baselineRoute.routeName} - {baselineRoute.vesselName} ({baselineRoute.year})
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                GHG Intensity: {baselineRoute.ghgIntensity.toFixed(1)} gCO₂eq/MJ
              </div>
            </div>

            {/* Comparison Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Comparison Route</label>
              <Select onValueChange={selectComparison} value={comparisonRoute?.id.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a route to compare..." />
                </SelectTrigger>
                <SelectContent>
                  {routes
                    .filter(r => r.id !== baselineRoute.id)
                    .map(route => (
                      <SelectItem key={route.id} value={route.id.toString()}>
                        {route.routeName} - {route.vesselName} ({route.year})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {comparisonRoute && (
              <div className="grid gap-6">
                {/* Route Cards */}
                <div className="grid md:grid-cols-3 gap-4 items-center">
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Baseline Route
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <p className="font-semibold">{baselineRoute.routeName}</p>
                        <p className="text-sm text-muted-foreground">{baselineRoute.vesselName}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Comparison Route
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <p className="font-semibold">{comparisonRoute.routeName}</p>
                        <p className="text-sm text-muted-foreground">{comparisonRoute.vesselName}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <ComparisonRow
                        label="Distance"
                        baseline={`${baselineRoute.distanceNm.toLocaleString()} NM`}
                        comparison={`${comparisonRoute.distanceNm.toLocaleString()} NM`}
                        diff={calculateDifference(baselineRoute.distanceNm, comparisonRoute.distanceNm)}
                      />
                      <ComparisonRow
                        label="Fuel Consumed"
                        baseline={`${baselineRoute.fuelConsumedMt.toLocaleString()} MT`}
                        comparison={`${comparisonRoute.fuelConsumedMt.toLocaleString()} MT`}
                        diff={calculateDifference(baselineRoute.fuelConsumedMt, comparisonRoute.fuelConsumedMt)}
                      />
                      <ComparisonRow
                        label="GHG Intensity"
                        baseline={`${baselineRoute.ghgIntensity.toFixed(1)} gCO₂eq/MJ`}
                        comparison={`${comparisonRoute.ghgIntensity.toFixed(1)} gCO₂eq/MJ`}
                        diff={calculateDifference(baselineRoute.ghgIntensity, comparisonRoute.ghgIntensity)}
                        inverseBetter
                      />
                      <ComparisonRow
                        label="Compliance Balance"
                        baseline={baselineRoute.complianceBalance.toFixed(1)}
                        comparison={comparisonRoute.complianceBalance.toFixed(1)}
                        diff={calculateDifference(baselineRoute.complianceBalance, comparisonRoute.complianceBalance)}
                        showSign
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">Baseline</span>
                        {baselineRoute.complianceBalance >= 0 ? (
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
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">Comparison</span>
                        {comparisonRoute.complianceBalance >= 0 ? (
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
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ComparisonRow({
  label,
  baseline,
  comparison,
  diff,
  inverseBetter = false,
  showSign = false
}: {
  label: string
  baseline: string
  comparison: string
  diff: { diff: number; percentChange: number }
  inverseBetter?: boolean
  showSign?: boolean
}) {
  const isPositive = diff.diff > 0
  const isBetter = inverseBetter ? !isPositive : isPositive
  const color = Math.abs(diff.diff) < 0.01 ? 'text-muted-foreground' : 
    isBetter ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="font-medium">{label}</div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Baseline</div>
          <div className="font-medium">{showSign && parseFloat(baseline) >= 0 ? '+' : ''}{baseline}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Comparison</div>
          <div className="font-medium">{showSign && parseFloat(comparison) >= 0 ? '+' : ''}{comparison}</div>
        </div>
        <div className={`text-right min-w-[80px] ${color}`}>
          <div className="text-sm font-medium">
            {isPositive ? '+' : ''}{diff.percentChange.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}