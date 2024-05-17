"use client";

import React, { useEffect, useMemo } from "react";
import Logo from "@/assets/new.png";
import { useDispatch, useSelector } from "react-redux";
import decodeToken from "@/util/decodeToken";
import { DecodedTokenType, RoleModulesType } from "@/types/auth";
import { RoleEnum } from "@/types/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { httpClient } from "@/api/httpClient";
import nProgress from "nprogress";
import { FormProvider, useForm } from "react-hook-form";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import ReactInput from "@/components/ReactHookForm/ReactInput";
import { moduleDataOption } from "@/constants/auth";
import { STORAGE_KEY } from "@/constants/localStorageKey";

interface LoginPayloadProps {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const methods = useForm<LoginPayloadProps>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const { authData, loading } = useSelector(({ auth }) => auth);

  const token = useMemo(() => localStorage.getItem(STORAGE_KEY.TOKEN), []);

  const submitLogin = (form: LoginPayloadProps) => {
    nProgress.start();
    dispatch({ type: "auth/POST_LOGIN", body: form });
  };

  useEffect(() => {
    if (authData?.status === 200 || token) {
      if (authData?.status === 200) {
        localStorage.setItem(STORAGE_KEY.TOKEN, authData?.data.token);
      }

      httpClient.interceptors.request.use((config) => {
        config.headers["Authorization"] = `Bearer ${
          token || authData?.data.token
        }`;

        return config;
      });

      let data: DecodedTokenType = decodeToken(token || authData?.data?.token);
      console.log("asdad - login - data", data);
      const roles: RoleModulesType[] = data?.rolesModules;

      dispatch({
        type: "userRoles/SET_SELECTED_ROLE",
        param: roles[0],
      });
      localStorage.setItem(STORAGE_KEY.SELECTED_ROLE, roles[0].role_name);
      localStorage.setItem(STORAGE_KEY.IS_SUPER, JSON.stringify(data.isSuper));

      const pathRoute =
        moduleDataOption[roles[0].modules[0].module_name]?.module_path;

      if (pathRoute) {
        router.push(pathRoute);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData, router, token]);

  return (
    <div className="login-page">
      <div className="box-form">
        <div className="logo">
          <Image priority src={Logo} alt="logo_sentadel" />
          <div className="box-title">
            <div className="title">One Gate System</div>
            <div className="version">V1.01</div>
          </div>
        </div>

        <div className="welcome-box">
          <div className="welcome-text">Welcome Back!</div>
          <div className="credentials-text">
            Masukan username dan password anda.
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(submitLogin)} className="form-input">
            <ReactInput
              name="username"
              label="Username"
              disabled={loading}
              placeholder="Username"
            />
            <ReactInput
              name="password"
              label="Password"
              disabled={loading}
              placeholder="Password"
              type="PASSWORD"
            />
            <ReactButton
              title="Login"
              type="submit"
              loading={nProgress.isStarted()}
              disabled={
                !(watch("username") && watch("password")) ||
                !!errors.username ||
                !!errors.password
              }
              customClassName="button-custom"
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default LoginPage;
