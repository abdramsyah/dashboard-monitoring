import {
  CaretUpOutlined,
  CaretDownOutlined,
  CheckOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button, Drawer } from "antd";
import decodeToken from "@/util/decodeToken";
import { getCSSRole } from "@/util/getRole";
import { getNavigate } from "@/util/getRole";
import { usePathname, useRouter } from "next/navigation";
import { getInitialName } from "@/util/commons";
import { MobileView } from "react-device-detect";
import { useDispatch, useSelector } from "react-redux";
import nProgress from "nprogress";
import MenuCard from "./MenuCard";
import {
  MenuDataType,
  ModuleType,
  RoleEnum,
  RoleModulesType,
} from "@/types/auth";
import { DecodedTokenType } from "@/types/auth";
import { moduleDataOption } from "@/constants/auth";

import "moment/locale/id";
import ChevronLeft from "@/assets/svg/icon/chevron-left";
import { STORAGE_KEY } from "@/constants/localStorageKey";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
  rightHeader?: ReactNode[];
}

const LayoutComponent: React.FC<LayoutProps> = ({
  children,
  rightHeader,
}: LayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const token = useMemo(() => localStorage.getItem(STORAGE_KEY.TOKEN), []);
  const rolesAfterRefresh = useMemo(
    () => localStorage.getItem(STORAGE_KEY.SELECTED_ROLE) as RoleEnum | null,
    []
  );

  const decodedToken: DecodedTokenType = useMemo(
    () => decodeToken(token),
    [token]
  );
  const placement = "left";
  const pathUrl = pathname.replace("/", "");
  const initRole = decodedToken?.rolesModules[0].role_name;

  const { menuData }: { menuData: MenuDataType | undefined } = useSelector(
    ({ auth }) => auth
  );

  const [showMenu, setShowMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const [docTitle, setDocTitle] = useState<string>();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleLogout = useCallback(async () => {
    console.log("asdad - handleLogout");
    nProgress.start();
    dispatch({ type: "auth/LOGOUT" });
    localStorage.clear();
    router.replace("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickRole = useCallback(
    (role: RoleEnum) => {
      nProgress.start();
      const rolesLink = getNavigate(role, menuData);

      localStorage.setItem(STORAGE_KEY.SELECTED_ROLE, role);

      setShowMenu((state) => !state);
      router.push(rolesLink);
    },
    [menuData, router]
  );

  useEffect(() => {
    if (!token) {
      handleLogout();
    } else {
      const tokenExpired = decodedToken?.exp;
      const date = new Date();
      const d = new Date(0);
      d.setUTCSeconds(tokenExpired);

      if (date > d) {
        handleLogout();
      }
    }
  }, [token, decodedToken?.exp, handleLogout]);

  useEffect(() => {
    return () => {
      nProgress.done();
    };
  }, []);

  useEffect(() => {
    const newTitle =
      menuData &&
      menuData[rolesAfterRefresh || initRole]?.find(
        (e) => e.module_path === pathname
      )?.module_description;

    setDocTitle(newTitle);
    document.title = `Lampion | ${newTitle}`;
  }, [initRole, menuData, pathname, rolesAfterRefresh]);

  useEffect(() => {
    let body: MenuDataType = {};
    decodedToken?.rolesModules?.forEach((rl) => {
      body[rl.role_name] = rl.modules.map((md) => {
        if (md.module_name in moduleDataOption) {
          return { ...md, ...moduleDataOption[md.module_name] };
        }
        return { ...md };
      });
    });

    console.log("asdad - menuModule - body", body);

    dispatch({ type: "auth/SET_MENU_DATA", body });
  }, [decodedToken?.rolesModules, dispatch]);

  var d = document.querySelectorAll<HTMLElement>(".chip-block"),
    i: number,
    w: number,
    width: number,
    height: number;

  for (i = 0; i < d.length; i++) {
    width = d[i].offsetWidth;
    height = d[i].offsetHeight;

    for (w = width; w; w--) {
      d[i].style.width = w + "px";
      if (d[i].offsetHeight !== height) break;
    }

    if (w < d[i].scrollWidth) {
      d[i].style.width = d[i].style.maxWidth = d[i].scrollWidth + "px";
    } else {
      d[i].style.width = w + 1 + "px";
    }
  }

  console.log("asdad - layout - render", rolesAfterRefresh, decodedToken);

  const renderMenuCard = useCallback(
    (module: ModuleType, idx: number) => (
      <Link href={module.module_path} prefetch>
        <MenuCard
          key={idx.toString()}
          module={module}
          pathUrl={pathUrl}
          onClick={() => {
            nProgress.start();
          }}
        />
      </Link>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const renderMenu = useMemo(
    () => (
      <div className="nav">
        <div className={`display-block`}>
          {rolesAfterRefresh &&
            menuData &&
            menuData[rolesAfterRefresh]?.map(renderMenuCard)}
        </div>
      </div>
    ),
    [menuData, renderMenuCard, rolesAfterRefresh]
  );

  const renderRoleRow = useCallback(
    (row: Omit<RoleModulesType, "modules">, index: number) => {
      const rolesDetail = getCSSRole()[row.role_name];

      return (
        <button
          disabled={(rolesAfterRefresh || initRole) === row.role_name}
          className="role"
          key={index}
          onClick={() => onClickRole(row.role_name)}
        >
          <div className={`bullet ${rolesDetail}`}></div>
          <h4>{row.role_description}</h4>
          {row.role_name === rolesAfterRefresh ? <CheckOutlined /> : ""}
        </button>
      );
    },
    [initRole, onClickRole, rolesAfterRefresh]
  );

  const renderUserBadge = useMemo(
    () => (
      <div className="profile">
        <div className="name-profile">
          <div className="box-picture">
            {getInitialName(decodedToken?.name)}
          </div>
          <div className="name">{decodedToken?.name}</div>
        </div>
        <div className="button-menu" onClick={() => setShowMenu(!showMenu)}>
          {!showMenu ? <CaretUpOutlined /> : <CaretDownOutlined />}
        </div>
      </div>
    ),
    [decodedToken?.name, showMenu]
  );

  return (
    <div className="layout">
      <MobileView>
        <Drawer
          key={placement}
          title=""
          placement={placement}
          closable={false}
          onClose={onClose}
          open={open}
        >
          <div className="sidebar-mobile">
            <div className="menu">
              <div className="title">MENU</div>
              <div className="menu-list">{renderMenu}</div>
            </div>

            <div
              className="permission-tab"
              style={{ display: !showMenu ? "none" : "block" }}
            >
              <div className="logout-area">
                <button onClick={handleLogout}>Log Out</button>
              </div>
              <div className="administration-roles">
                <div className="heading">
                  <h5>Administration Roles</h5>
                </div>
                <div className="roles-list">
                  {decodedToken?.rolesModules?.map(renderRoleRow)}
                </div>
              </div>
            </div>
            {renderUserBadge}
          </div>
        </Drawer>
      </MobileView>

      <div className="sidebar">
        <div className="menu">
          <div className="title">MENU</div>
          <div className="menu-list">{renderMenu}</div>
        </div>
        <div
          className="permission-tab"
          style={{ display: !showMenu ? "none" : "block" }}
        >
          <div className="logout-area">
            <button
              className="back-button"
              onClick={() => setShowMenu((state) => !state)}
            >
              <ChevronLeft stroke="#7a7a7a" />
            </button>
            <button className="logout-button" onClick={handleLogout}>
              {" "}
              Log Out
            </button>
          </div>
          <div className="administration-roles">
            <div className="heading">
              <h5>Roles</h5>
            </div>
            <div className="roles-list">
              {decodedToken?.rolesModules?.map(renderRoleRow)}
            </div>
          </div>
        </div>
        {renderUserBadge}
      </div>

      <div className="section-content">
        <div className="header-content">
          <Button
            className="hamburger-menu"
            type="primary"
            onClick={showDrawer}
          >
            <MenuOutlined />
          </Button>
        </div>
        <div className="content">
          <div className="page-table">
            <div className="header">
              <div className="title">{docTitle}</div>
              {rightHeader?.length ? [...rightHeader] : null}
            </div>
            {children}
          </div>
        </div>
      </div>

      <MobileView>
        <div
          className="section-footer-mobile"
          style={
            initRole === RoleEnum.COORDINATOR ||
            rolesAfterRefresh === RoleEnum.COORDINATOR
              ? {}
              : { display: "none" }
          }
        >
          {menuData && menuData[RoleEnum.COORDINATOR]?.map(renderMenuCard)}
        </div>
      </MobileView>
    </div>
  );
};

export default LayoutComponent;
