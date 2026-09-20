import React from 'react';

const ReportSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
    <div className="flex items-center mb-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
    <div className="h-32 w-full bg-gray-200 rounded-lg mb-3"></div>
    <div className="flex justify-between">
      <div className="h-8 w-20 bg-gray-200 rounded"></div>
      <div className="h-8 w-20 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const UserSkeleton: React.FC = () => (
  <div className="flex items-center p-3 border-b border-gray-100 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-gray-200 mr-3"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="h-8 w-20 bg-gray-200 rounded"></div>
  </div>
);

const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="h-64 w-full bg-gray-200 rounded"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
    
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="p-0">
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export { ReportSkeleton, UserSkeleton, DashboardSkeleton };