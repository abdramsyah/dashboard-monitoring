import { View, Image, Keyboard } from 'react-native';
import React from 'react';
import Base from '@sentadell-src/components/Base/Base';
import { FormProvider, useForm } from 'react-hook-form';
import TextBase from '@sentadell-src/components/Text/TextBase';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  alignStyle,
  flexiStyle,
  fwStyle
} from '@sentadell-src/utils/moderateStyles';
import { LampionLogoRed } from '@sentadell-src/config/Svgs';
import {
  LOG,
  decodeToken,
  getInitialNavigation
} from '@sentadell-src/utils/commons';
import { postLogin } from '@sentadell-src/apis/queries/fetch';
import {
  ErrorResponseType,
  SuccessResponseType
} from '@sentadell-src/types/global';
import ReactFormInput from '@sentadell-src/components/Form/ReactFormInput/ReactFormInput';
import styles from './Login.styles';
import Button from '@sentadell-src/components/Button/Button';
import { MUTATION_KEY } from '@sentadell-src/apis/queries/key';
import { useMutation } from '@tanstack/react-query';
import { STORAGE_KEYS, storage } from '@sentadell-src/database/mmkv';
import {
  DecodedTokenType,
  UsersDataType,
  LoginPayloadType
} from '@sentadell-src/types/auth';
import { useDispatch } from 'react-redux';
import { setIsAuth } from '@sentadell-src/stores/rtk/actions/auth';
import { CommonActions } from '@react-navigation/native';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.LOGIN_SCREEN
>;

interface LoginScreenProps {
  navigation: NavigationProps;
}

const LoginScreen: React.FC<LoginScreenProps> = (props: LoginScreenProps) => {
  const { navigation } = props;

  const dispatch = useDispatch();

  const methods = useForm<LoginPayloadType>({
    defaultValues: {
      username: '',
      password: '',
      is_mobile: true
    },
    mode: 'onBlur'
  });

  const { handleSubmit, watch } = methods;

  const onSuccess = (
    data: SuccessResponseType<UsersDataType, LoginPayloadType>
  ) => {
    LOG.info('On success login', data);
    const userData: UsersDataType = data.data.data;

    const decodedToken: DecodedTokenType = decodeToken(userData.token);

    LOG.info('On success login - userData', userData);
    LOG.info('On success login - decodedToken', decodedToken);

    storage.set(STORAGE_KEYS.USER, JSON.stringify(userData));
    storage.set(STORAGE_KEYS.DECODED_TOKEN, JSON.stringify(decodedToken));
    dispatch(setIsAuth(true));
    const route = getInitialNavigation(
      decodedToken.rolesModules.map(roleM => roleM.role_name)
    );

    if (route) {
      navigation.replace(route);

      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: route }]
        })
      );
    }
  };

  const onError = (
    err: ErrorResponseType<
      { data?: unknown; message?: string },
      LoginPayloadType
    >
  ) => {
    LOG.error('On error login', err, err.response?.data);
    if (
      err.response?.data.message ===
      "There aren't any Role that this user had can be use to login into mobile platform"
    ) {
      methods.setError('username', {
        message: 'User tidak memiliki role yang dapat login di Mobile App'
      });
    }
  };

  const { mutate, isPending } = useMutation({
    mutationKey: [MUTATION_KEY.LOGIN],
    mutationFn: postLogin,
    onSuccess,
    onError
  });

  const onSubmit = (formData: LoginPayloadType) => {
    Keyboard.dismiss();
    mutate(formData);
  };

  return (
    <Base noScroll centerView>
      <Image
        style={styles.backgroundImage}
        resizeMode="cover"
        source={require('@sentadell-src/assets/images/login-bg.png')}
      />
      <View style={styles.loginArea}>
        <View style={[flexiStyle.flexRow, alignStyle.allCenter]}>
          <LampionLogoRed height={70} width={70} />
          <View>
            <TextBase.XL style={fwStyle[700]}>One Gate System</TextBase.XL>
            <TextBase.M>V1.01</TextBase.M>
          </View>
        </View>
        <View>
          <TextBase.XL style={fwStyle[700]}>
            Selamat Datang Kembali!
          </TextBase.XL>
          <TextBase.M>Masukan informati autentikasi anda!</TextBase.M>
        </View>
        <FormProvider {...methods}>
          <View style={styles.gap20}>
            <ReactFormInput
              outlined
              name="username"
              label="Username"
              inputProps={{ placeholder: 'Username' }}
              rules={{
                required: 'Username wajib diisi',
                pattern: {
                  value: /^[a-zA-Z0-9äöüÄÖÜ]*$/g,
                  message: 'Tidak boleh ada spesial karakter'
                }
              }}
            />
            <ReactFormInput
              outlined
              name="password"
              label="Password"
              inputProps={{ placeholder: 'Password' }}
              rules={{
                required: 'Password wajib diisi'
              }}
              isPassword
            />
          </View>
        </FormProvider>
        <Button
          theme="solid-blue"
          title="Masuk"
          onPress={handleSubmit(onSubmit)}
          isLoading={isPending}
          disabled={!watch('username') && !watch('password')}
          customStyle={{
            container: styles.buttonContainer
          }}
        />
      </View>
    </Base>
  );
};

export default LoginScreen;
