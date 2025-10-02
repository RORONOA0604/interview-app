// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Interviewee from './pages/Interviewee';
import Interviewer from './pages/Interviewer';

const { Header, Content } = Layout;

// ✅ FIX: Define menu items as an array of objects for the `items` prop.
const menuItems = [
  {
    key: 'interviewee',
    icon: <UserOutlined />,
    label: <Link to="/">Interviewee</Link>,
  },
  {
    key: 'interviewer',
    icon: <TeamOutlined />,
    label: <Link to="/interviewer">Interviewer</Link>,
  },
];

export default function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header>
          {/* ✅ FIX: Pass the array to the `items` prop instead of using children */}
          <Menu
            theme="dark"
            mode="horizontal"
            selectable={false}
            items={menuItems}
          />
        </Header>
        <Content style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Interviewee />} />
            <Route path="/interviewer" element={<Interviewer />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}