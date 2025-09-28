import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart3, Package, CloudSun, TrendingUp, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
  },
  {
    title: "Inventory",
    url: createPageUrl("Inventory"),
    icon: Package,
  },
  {
    title: "Weather Impact",
    url: createPageUrl("Weather"),
    icon: CloudSun,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: TrendingUp,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <style>
          {`
            :root {
              --primary-blue: #3B82F6;
              --accent-blue: #1E40AF;
              --success-green: #10B981;
              --warning-yellow: #F59E0B;
              --danger-red: #EF4444;
              --neutral-gray: #6B7280;
              --light-gray: #F9FAFB;
              --white: #FFFFFF;
            }
            
            .gradient-bg {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .glass-effect {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .shadow-elegant {
              box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
            }
          `}
        </style>
        
        <Sidebar className="border-r border-gray-100 shadow-elegant">
          <SidebarHeader className="border-b border-gray-100 p-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-white">Kopik</h1>
                <p className="text-xs text-blue-100">AI Inventory Oracle</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 rounded-xl mb-2 ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Daily Savings</span>
                    <span className="font-bold text-green-600">+$340</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Waste Reduction</span>
                    <span className="font-bold text-green-600">-28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Confidence</span>
                    <span className="font-bold text-blue-600">94%</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">DC</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">Demo Cafe</p>
                <p className="text-xs text-gray-500 truncate">Premium Plan</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-100 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900">Kopik</h1>
            </div>
          </header>

          <div className="flex-1 bg-gray-50 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}