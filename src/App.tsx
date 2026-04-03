/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Capture from './pages/Capture';
import Journal from './pages/Journal';
import Tapestry from './pages/Tapestry';
import Profile from './pages/Profile';
import Insights from './pages/Insights';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Capture />} />
          <Route path="journal" element={<Journal />} />
          <Route path="tapestry" element={<Tapestry />} />
          <Route path="profile" element={<Profile />} />
          <Route path="insights" element={<Insights />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
