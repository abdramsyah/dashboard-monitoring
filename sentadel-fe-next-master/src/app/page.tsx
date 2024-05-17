"use client";

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { httpClient } from "@/api/httpClient";
import decodeToken from "@/util/decodeToken";
import { DecodedTokenType, MenuDataType, RoleEnum } from "@/types/auth";
import { useDispatch } from "react-redux";
import { moduleDataOption } from "@/constants/auth";
import { STORAGE_KEY } from "@/constants/localStorageKey";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useMemo(() => localStorage.getItem(STORAGE_KEY.TOKEN), []);

  const routeTo = useCallback(() => {
    if (token) {
      httpClient.interceptors.request.use((config) => {
        config.headers["Authorization"] = `Bearer ${token}`;

        return config;
      });

      const decodedToken: DecodedTokenType = decodeToken(token);

      let body: MenuDataType = {};
      decodedToken?.rolesModules?.forEach((rl) => {
        body[rl.role_name] = rl.modules.map((md) => {
          if (md.module_name in moduleDataOption) {
            return { ...md, ...moduleDataOption[md.module_name] };
          }
          return { ...md };
        });
      });
      const selectedRole: RoleEnum = decodedToken?.rolesModules[0].role_name;

      dispatch({
        type: "userRoles/SET_SELECTED_ROLE",
        param: selectedRole,
      });

      let pathRoute = "/";
      const selectedBody = body[selectedRole];

      if (selectedBody) {
        pathRoute = selectedBody[0].module_path;
      }

      if (pathRoute) {
        router.push(pathRoute);
      }
    } else {
      router.replace("/login");
    }
  }, [dispatch, router, token]);

  useEffect(() => {
    routeTo();
  }, [routeTo]);

  return <main className={styles.main}>Splash Screen</main>;
}
