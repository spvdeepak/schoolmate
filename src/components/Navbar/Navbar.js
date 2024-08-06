import React from "react";
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  RocketOutlined,
  BellOutlined,
  IdcardOutlined,
  MailOutlined,
  DollarCircleOutlined,
  BookOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  TeamOutlined,
  ScheduleOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  StockOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Navbar = () => {
  const location = useLocation();

  const getMenuKey = (pathname) => {
    switch (pathname) {
      case "/classes":
        return "1";
      case "/performance":
        return "2";
      case "/notify":
        return "3";
      case "/exam":
        return "4";
      case "/contact":
        return "5";
      case "/fees":
      case "/fee-structure":
        return "sub1";
      case "/subject":
        return "8";
      case "/stock":
        return "9";
      case "/educator":
        return "10";
      case "/student":
        return "11";
      case "/timetable":
        return "12";
      case "/calendar":
        return "13";
      case "/promote":
        return "14";
      case "/group":
        return "15";
      default:
        return null;
    }
  };

  return (
    <Sider width={270} theme="light" style={{ minHeight: "100vh" }}>
      {/**<div style={{ height: "64px", textAlign: "center", padding: "16px 0" }}>
        <img src="path/to/your/logo.png" alt="Logo" style={{ maxHeight: "100%", maxWidth: "100%" }} />
  </div>*/}

      <Menu mode="vertical" theme="light" style={{ flexGrow: 1 }} selectedKeys={[getMenuKey(location.pathname)]}>
        <Menu.Item key="1" icon={<AppstoreOutlined />}>
          <Link to="/classes">Classes</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<RocketOutlined />}>
          <Link to="/performance">Performance</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<BellOutlined />}>
          <Link to="/notify">Notifications</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<IdcardOutlined />}>
          <Link to="/exam">Exam Cell</Link>
        </Menu.Item>
        <Menu.Item key="5" icon={<MailOutlined />}>
          <Link to="/contact">Contact</Link>
        </Menu.Item>
        <Menu.Item key="6" icon={<DollarCircleOutlined />}>
          <Link to="/fees">Fees Details</Link>
        </Menu.Item>
        <Menu.Item key="7" icon={<DatabaseOutlined />}>
          <Link to="/fee-structure">Fee Structure</Link>
        </Menu.Item>
        <Menu.Item key="8" icon={<BookOutlined />}>
          <Link to="/subject">Subject</Link>
        </Menu.Item>
        <Menu.Item key="9" icon={<StockOutlined />}>
          <Link to="/stock">Stocks</Link>
        </Menu.Item>
        <Menu.Item key="10" icon={<UserOutlined />}>
          <Link to="/educator">Teachers</Link>
        </Menu.Item>
        <Menu.Item key="11" icon={<TeamOutlined />}>
          <Link to="/student">Students</Link>
        </Menu.Item>
        <Menu.Item key="12" icon={<ScheduleOutlined />}>
          <Link to="/timetable">TimeTable</Link>
        </Menu.Item>
        <Menu.Item key="13" icon={<CalendarOutlined />}>
          <Link to="/calendar">Calendar</Link>
        </Menu.Item>
        <Menu.Item key="14" icon={<ArrowUpOutlined />}>
          <Link to="/promote">Promote</Link>
        </Menu.Item>
        <Menu.Item key="15" icon={<UsergroupAddOutlined />}>
          <Link to="/group">Group</Link>
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />} style={{ position: "absolute" }}>
          <Link to="/">Logout</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Navbar;
