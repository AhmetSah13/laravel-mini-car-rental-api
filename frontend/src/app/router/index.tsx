import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { GuestRoute } from '@/features/auth/components/GuestRoute'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { AdminRoute } from '@/features/auth/components/AdminRoute'
import { HomePage } from '@/features/home/pages/HomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ProfilePage } from '@/features/auth/pages/ProfilePage'
import { CarsListPage } from '@/features/cars/pages/CarsListPage'
import { CarDetailPage } from '@/features/cars/pages/CarDetailPage'
import { BrandsListPage } from '@/features/brands/pages/BrandsListPage'
import { BrandDetailPage } from '@/features/brands/pages/BrandDetailPage'
import { AdminBrandsPage } from '@/features/brands/pages/AdminBrandsPage'
import { AdminCarsPage } from '@/features/cars/pages/AdminCarsPage'
import { AdminCustomersPage } from '@/features/customers/pages/AdminCustomersPage'
import { RentalsListPage } from '@/features/rentals/pages/RentalsListPage'
import { RentalCreatePage } from '@/features/rentals/pages/RentalCreatePage'
import { RentalDetailPage } from '@/features/rentals/pages/RentalDetailPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cars" element={<CarsListPage />} />
          <Route path="cars/:id" element={<CarDetailPage />} />
          <Route path="brands" element={<BrandsListPage />} />
          <Route path="brands/:id" element={<BrandDetailPage />} />
          <Route
            path="login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="rentals" element={<RentalsListPage />} />
          <Route path="rentals/new" element={<RentalCreatePage />} />
          <Route path="rentals/:id" element={<RentalDetailPage />} />
          <Route
            path="admin/brands"
            element={
              <AdminRoute>
                <AdminBrandsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/cars"
            element={
              <AdminRoute>
                <AdminCarsPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/customers"
            element={
              <AdminRoute>
                <AdminCustomersPage />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
