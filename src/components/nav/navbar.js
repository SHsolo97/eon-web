import "./nav.css";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Dropdown, Menu, Button, Badge } from "antd";
import logo from "../../assets/bitslogo.png";
import NotificationRender from "./notificationRender";

import { LogoutOutlined, DownOutlined, BellOutlined } from "@ant-design/icons";
import {
  logOutUser,
  readNotifications,
  getNotifications,
} from "../../actions/commonActions";

/**
 * top navigation bar that contains
 * if not logged in:
 * Login button,
 * registration drop down
 * EOn icon,
 * BITS icon
 * if logged in :
 * name || organization name depending upon the role of user,
 * notification bell for subscribers
 * dropdown to navigate to change Password or My Profile
 * dropdown alos consists the logout button
 */
class Navbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openMenu: false,
      openNotification: false,
      notifications: [],
    };
  }

  componentDidMount() {
    this.setState({
      notifications: this.props.notifications,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.notifications !== prevProps.notifications) {
      this.setState({
        notifications: this.props.notifications,
      });
    }
    if (this.props.userData !== prevProps.userData) {
      const { userData, userRole, accessToken, getNotification } = this.props;
      if (userData.user_id && userRole === "subscriber" && accessToken !== "") {
        getNotification(accessToken);
      }
    }
  }

  handleChange = () => {
    window.location.reload();
  };

  openNotificationWithIcon = () => {
    this.setState({
      openNotification: !this.state.openNotification,
    });
  };

  handleClick = () => {
    this.setState({
      openMenu: true,
    });
  };

  handleClosePopover = () => {
    this.setState({
      openMenu: false,
    });
  };

  takeMenuAction = (input) => {
    if (input.key === "1") this.props.history.push(`/register/organiser`);
    else if (input.key === "2") this.props.history.push(`/register/subscriber`);
    else if (input.key === "3") this.props.history.push(`/change-password`);
    else if (input.key === "4") this.props.history.push(`/my-profile`);
    else if (input.key === "5") {
      this.props.history.push(`/dashboard?type=wishlist`);
    } else {
      this.logout();
    }
  };

  logout = () => {
    this.props.logOutUser({
      callback: () => {
        localStorage.clear();
        if (!localStorage.getItem("token")) this.props.history.push("/login");
      },
    });
  };

  clearAll = () => {
    const { notifications } = this.props;
    let listId = [];
    for (let i = 0; i < notifications.length; ++i) {
      listId.push(notifications[i].id);
    }
    if (listId.length !== 0) {
      this.props.readNotifications({
        list: { notification_ids: listId },
        access: this.props.accessToken,
      });
    }
    this.setState({
      openNotification: false,
    });
  };

  goBack = () => {
    this.props.history.push("/login");
  };

  handleClearOneNotification = (id) => {
    let listId = [id];
    this.props.readNotifications({
      list: { notification_ids: listId },
      access: this.props.accessToken,
    });

    let notification = this.state.notifications;
    notification = notification.filter((data) => data.id !== id);
    this.setState({
      notifications: notification,
    });
  };
  menu = () => {
    return (
      <Menu onClick={(key) => this.takeMenuAction(key)}>
        <Menu.Item key="1">Organizer Registration</Menu.Item>
        <Menu.Item key="2">Subscriber Registration</Menu.Item>
      </Menu>
    );
  };
  menuSidebar = () => {
    return (
      <Menu onClick={(key) => this.takeMenuAction(key)}>
        <Menu.Item key="3">Change Password</Menu.Item>
        <Menu.Item key="4">Profile</Menu.Item>
        {this.props.userRole === "subscriber" && (
          <Menu.Item key="5">Wishlist</Menu.Item>
        )}
        <Menu.Item key="6">
          <LogoutOutlined />
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const { notifications } = this.state;
    return (
      <div className="nav-container">
        {!localStorage.getItem("token") && (
          <img style={{ width: "3%" }} src={logo} />
        )}
        <div className="top-nav">
          {this.props.accessToken === "" &&
          (this.props.location.pathname !== "/login" &&
            this.props.location.pathname !== "/") ? (
            <Button
              style={{ color: "#262C6F", border: "none", fontWeight: "bold" }}
              onClick={this.goBack}
            >
              Login
            </Button>
          ) : null}
          {this.props.userRole === "subscriber" && (
            <Badge
              count={notifications.length}
              showZero={false}
              dot={notifications.length !== 0 ? true : false}
            >
              <BellOutlined
                className="nav-items"
                style={{
                  fontSize: "20px",
                  marginRight: "-5px",
                  marginTop: "-1px",
                }}
                onClick={this.openNotificationWithIcon}
              />
            </Badge>
          )}
          {this.state.openNotification && (
            <NotificationRender
              notifications={notifications}
              openNotificationWithIcon={this.openNotificationWithIcon}
              clearAll={this.clearAll}
              handleClearOneNotification={this.handleClearOneNotification}
            />
          )}
          {localStorage.getItem("token") && this.props.accessToken !== "" ? (
            <Dropdown overlay={this.menuSidebar}>
              <div className="nav-items">
                {this.props.userData.name
                  ? this.props.userData.name
                  : this.props.userData.organization}{" "}
                <DownOutlined />
              </div>
            </Dropdown>
          ) : (
            <Dropdown overlay={this.menu}>
              <div className="nav-items">
                Register <DownOutlined />
              </div>
            </Dropdown>
          )}
          <div className="logo-text">EOn</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({
  userReducer: { accessToken, userData, userRole },
  notificationReducer: { notifications },
}) => ({
  accessToken,
  userData,
  userRole,
  notifications,
});

const mapDispatchToProps = {
  logOutUser: logOutUser,
  getNotification: getNotifications,
  readNotifications: readNotifications,
};

Navbar.propTypes = {
  notifications: PropTypes.array,
  accessToken: PropTypes.string,
  userData: PropTypes.object,
  userRole: PropTypes.string,
  logOutUser: PropTypes.func,
  readNotifications: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object,
  getNotification: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
