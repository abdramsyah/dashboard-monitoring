import { View } from 'react-native';
import React, { useEffect } from 'react';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import Base from '@sentadell-src/components/Base/Base';
import ReactFormBuilder from '@sentadell-src/components/Form/ReactFormBuilder/ReactFormBuilder';
import {
  QueueRequestDataEnum,
  QueueRequestEnum,
  QueueRequestProps
} from '@sentadell-src/types/queue';
import { useFieldArray, useForm } from 'react-hook-form';
import { queueFormList } from '@sentadell-src/constants/queue';
import { ErrorResponseType } from '@sentadell-src/types/global';
import { useMutation } from '@tanstack/react-query';
import { MUTATION_KEY } from '@sentadell-src/apis/queries/key';
import { createQueueRequest } from '@sentadell-src/apis/queries/fetch';
import {
  useCreatePartners,
  useGetPartners
} from '@sentadell-src/stores/realm/actions/partners';
import Button from '@sentadell-src/components/Button/Button';
import { showMessage } from 'react-native-flash-message';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.COORDINATOR_QUEUE_REQUEST_FORM
>;

type RoutesProps = RouteProp<
  RootNavigationParams,
  routes.COORDINATOR_QUEUE_REQUEST_FORM
>;

interface QueueRequestFormScreenProps {
  navigation: NavigationProps;
  route: RoutesProps;
}

const QueueRequestFormScreen: React.FC<QueueRequestFormScreenProps> = (
  props: QueueRequestFormScreenProps
) => {
  const { navigation, route } = props;

  const partners = useGetPartners({});
  const { isSuccess, isLoading, create, error } = useCreatePartners();

  const methods = useForm<QueueRequestProps>({
    mode: 'onBlur',
    defaultValues: {
      queues: [{}]
    }
  });

  const queueFields = useFieldArray({
    control: methods.control,
    name: QueueRequestEnum.QUEUES
  });

  const onSuccess = () => {
    navigation.replace(routes.COORDINATOR_QUEUE_REQUEST_TABLE, {});
  };

  const onError = (
    err: ErrorResponseType<{ data?: unknown; message?: string }, unknown>
  ) => {
    showMessage({
      type: 'danger',
      message: 'Terjadi Kesalahan ' + err.message
    });
  };

  const { mutate, isPending } = useMutation({
    mutationKey: [MUTATION_KEY.CREATE_QUEUE_REQUEST],
    mutationFn: createQueueRequest,
    onSuccess,
    onError
  });

  const submitRequest = (form: QueueRequestProps) => {
    const newForm: QueueRequestProps = {
      queues: form[QueueRequestEnum.QUEUES].map(e => {
        const newFormData = () => {
          if (typeof e[QueueRequestDataEnum.FARMER] === 'string') {
            return {
              product_type: e[QueueRequestDataEnum.PRODUCT_TYPE],
              request_quantity: parseInt(
                e[QueueRequestDataEnum.REQUEST_QUANTITY] as string
              ),
              farmer: e[QueueRequestDataEnum.FARMER]
            };
          }

          return {
            product_type: e[QueueRequestDataEnum.PRODUCT_TYPE],
            request_quantity: parseInt(
              e[QueueRequestDataEnum.REQUEST_QUANTITY] as string
            ),
            farmer: e[QueueRequestDataEnum.FARMER].partner_name || '',
            partner_id: e[QueueRequestDataEnum.FARMER].partner_id || 0
          };
        };

        return newFormData();
      })
    };

    mutate(newForm);
  };

  const refreshPartner = () => {
    create();
  };

  useEffect(() => {
    if (
      !isLoading &&
      !partners.data.length &&
      typeof error === 'object' &&
      error.message !== 'empty'
    ) {
      refreshPartner();
    }
  }, [isSuccess, isLoading, partners.data.length, error]);

  return (
    <Base headerTitle={route.params?.title} noScroll>
      <View
        style={{
          paddingVertical: 20,
          paddingHorizontal: 8,
          flex: 1,
          gap: 10
        }}>
        <Button
          title="Perbaharui Daftar Mitra"
          onPress={refreshPartner}
          isLoading={isLoading}
        />
        <ReactFormBuilder
          methods={methods}
          formList={queueFormList(queueFields, partners.dropdown)}
          onSubmit={submitRequest}
          isLoading={isPending}
        />
      </View>
    </Base>
  );
};

export default QueueRequestFormScreen;
