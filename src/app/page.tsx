"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RoutesTab from '@/components/RoutesTab'
import CompareTab from '@/components/CompareTab'
import BankingTab from '@/components/BankingTab'
import PoolingTab from '@/components/PoolingTab'
import { Ship, GitCompare, PiggyBank, Users } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Toaster />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            FuelEU Maritime Compliance
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage maritime routes, compliance balance, banking, and pooling
          </p>
        </div>

        <Tabs defaultValue="routes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="routes" className="gap-2">
              <Ship className="h-4 w-4" />
              <span className="hidden sm:inline">Routes</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="banking" className="gap-2">
              <PiggyBank className="h-4 w-4" />
              <span className="hidden sm:inline">Banking</span>
            </TabsTrigger>
            <TabsTrigger value="pooling" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Pooling</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="routes">
            <RoutesTab />
          </TabsContent>

          <TabsContent value="compare">
            <CompareTab />
          </TabsContent>

          <TabsContent value="banking">
            <BankingTab />
          </TabsContent>

          <TabsContent value="pooling">
            <PoolingTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}