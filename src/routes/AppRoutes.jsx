import { Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import WizardLayout from '../layouts/WizardLayout.jsx';
import Login from '../pages/auth/Login/Login.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword/ForgotPassword.jsx';
import Register from '../pages/auth/Register/Register.jsx';
import Dashboard from '../pages/account/Dashboard/Dashboard.jsx';
import ChangePassword from '../pages/account/ChangePassword/ChangePassword.jsx';
import PrivacySecurity from '../pages/account/PrivacySecurity/PrivacySecurity.jsx';
import CloseAccount from '../pages/account/CloseAccount/CloseAccount.jsx';
import EditProfile from '../pages/account/EditProfile/EditProfile.jsx';
import Gallery from '../pages/account/Gallery/Gallery.jsx';
import Me from '../pages/account/Me/Me.jsx';
import Matches from '../pages/app/Matches/Matches.jsx';
import Search from '../pages/app/Search/Search.jsx';
import Chat from '../pages/app/Chat/Chat.jsx';
import Notifications from '../pages/app/Notifications/Notifications.jsx';
import ProfileDetails from '../pages/app/ProfileDetails/ProfileDetails.jsx';
import Home from '../pages/app/Home/Home.jsx';
import ComingSoon from '../pages/ComingSoon.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public: auth pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<WizardLayout />}>
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Logged-in pages: each page renders its own layout (AccountLayout, ...) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile-details" element={<ProfileDetails />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/search" element={<Search />} />
        <Route path="/me" element={<Me />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-security" element={<PrivacySecurity />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/close-account" element={<CloseAccount />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/gallery" element={<Gallery />} />
      </Route>


      {/* Pages not converted yet: each gets its own route as it is ported */}
      <Route path="*" element={<ComingSoon />} />
    </Routes>
  );
}
