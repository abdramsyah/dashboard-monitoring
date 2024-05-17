import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "antd";
import { useFieldArray, useForm } from "react-hook-form";
import nProgress from "nprogress";
import ReactFormBuilder from "@/components/ReactHookForm/ReactFormBuilder";
import {
  QueueRequestDataEnum,
  QueueRequestDataProps,
  QueueRequestEnum,
  QueueRequestManagementPayload,
  QueueRequestProps,
  RequestModeEnum,
} from "@/types/queue";
import { queueFormList, requestModeOptions } from "@/constants/queue";
import styles from "./styles.module.scss";
import {
  CoordinatorManagementModel,
  CoordinatorModelRequestEnum,
} from "@/types/coordinators";
import ChipSelector, { ChipSelectorOption } from "@/components/ChipSelector";
import { UserModelRequestEnum } from "@/types/users";
import { ModuleEnum, RoleEnum, RoleModulesType } from "@/types/auth";
import {
  ErrorResponseType,
  SearchFilterSortParams,
  SuccessResponseType,
} from "@/types/global";
import { useMutation } from "@tanstack/react-query";
import { MUTATION_KEY } from "@/api/queries/key";
import { createQueueRequest, getPartners } from "@/api/queries/fetch";
import { PartnerModel } from "@/types/partnership";
import { toast } from "react-toastify";
import MessageError from "@/components/Notification/MessageError";

interface ModalRequestQueueFormProps {
  isModalOpen: boolean;
  params: any;
  onClose: () => void;
}

const ModalRequestQueueForm: React.FC<ModalRequestQueueFormProps> = (
  props: ModalRequestQueueFormProps
) => {
  const { isModalOpen, params, onClose } = props;

  const methods = useForm<QueueRequestProps>({
    mode: "onBlur",
    defaultValues: {
      queues: [
        {
          farmer: "",
          product_type: "",
          request_quantity: 0,
        },
      ],
    },
  });

  const queueFields = useFieldArray({
    control: methods.control,
    name: QueueRequestEnum.QUEUES,
  });

  const dispatch = useDispatch();
  const [isNewFarmer, setIsNewFarmer] = useState(false);
  const [partners, setPartners] = useState<PartnerModel[]>([]);

  const {
    coordinatorData,
  }: { coordinatorData?: { data?: CoordinatorManagementModel[] } } =
    useSelector(({ coordinatorManagement }) => coordinatorManagement);

  const { rolesData }: { rolesData?: { data?: RoleModulesType[] } } =
    useSelector(({ userRoles }) => userRoles);

  const onSuccessCreateQueue = (
    data: SuccessResponseType<unknown, unknown>
  ) => {
    console.info("On success create", data);
    dispatch({ type: "queueRequest/GET_QUEUE_GROUP", param: params });
    nProgress.done();
    onClose();
  };

  const onErrorCreateQueue = (
    err: ErrorResponseType<{ data?: unknown; message?: string }, unknown>
  ) => {
    console.error("On error create", err, err.response?.data);
    toast.error(
      <MessageError msg={err.response?.data.message || err.message} />,
      { className: "toast-message-error" }
    );
  };

  const createQueueMt = useMutation({
    mutationKey: [MUTATION_KEY.CREATE_QUEUE_REQUEST],
    mutationFn: createQueueRequest,
    onSuccess: onSuccessCreateQueue,
    onError: onErrorCreateQueue,
  });

  const onSuccessGetPartners = (
    data: SuccessResponseType<PartnerModel[], SearchFilterSortParams>
  ) => {
    console.info("On success get partners", data);
    setPartners(data.data.data);
  };

  const onErrorGetPartners = (
    err: ErrorResponseType<{ data?: unknown; message?: string }, unknown>
  ) => {
    console.error("On error create", err, err.response?.data);
  };

  const getPartnersMt = useMutation({
    mutationKey: [MUTATION_KEY.GET_PARTNERS],
    mutationFn: getPartners,
    onSuccess: onSuccessGetPartners,
    onError: onErrorGetPartners,
  });

  const getQueues = (e: QueueRequestDataProps) => {
    const objString: PartnerModel | string = JSON.parse(
      e[QueueRequestDataEnum.FARMER]
    );

    if (typeof objString === "string") {
      return {
        product_type: e[QueueRequestDataEnum.PRODUCT_TYPE],
        request_quantity: e[QueueRequestDataEnum.REQUEST_QUANTITY],
        farmer: objString,
      };
    }

    return {
      product_type: e[QueueRequestDataEnum.PRODUCT_TYPE],
      request_quantity: e[QueueRequestDataEnum.REQUEST_QUANTITY],
      farmer: objString.partner_name || "",
      partner_id: objString.coordinator_id || 0,
    };
  };

  const submitRequest = (form: QueueRequestProps) => {
    nProgress.start();

    let newForm: QueueRequestManagementPayload;
    if (isNewFarmer) {
      const username = form[UserModelRequestEnum.NAME]
        .toLocaleLowerCase()
        .split(" ")
        .join("");

      const coordinatorRoleModule = rolesData?.data?.find(
        (rm) => rm.role_name === RoleEnum.COORDINATOR
      );
      const queueRequestModule = coordinatorRoleModule?.modules.find(
        (module) => module.module_name === ModuleEnum.QUEUE_REQUEST
      )?.module_id;

      newForm = {
        is_not_member: true,
        coordinator_user_data: {
          coordinator_param: {
            code: form[CoordinatorModelRequestEnum.CODE],
            quota: 1,
          },
          user_param: {
            phone_number: "dummy",
            modules: [queueRequestModule || 0],
            email: username + "@dummy.co",
            name: form[UserModelRequestEnum.NAME],
            username,
            roles: [coordinatorRoleModule?.role_id || 0],
            password: "dummy",
          },
        },
        queues: form[QueueRequestEnum.QUEUES].map(getQueues),
      };
    } else {
      newForm = {
        is_not_member: false,
        coordinator_id: form[QueueRequestEnum.COORDINATOR_ID] || 0,
        queues: form[QueueRequestEnum.QUEUES].map(getQueues),
      };
    }

    createQueueMt.mutate(newForm);
  };

  const selectedCoordinatorId = methods.watch("coordinator_id");

  useEffect(() => {
    dispatch({
      type: "coordinatorManagement/GET_COORDINATOR_LIST",
    });
    dispatch({ type: "userRoles/GET_DATA" });
  }, [dispatch, params]);

  useEffect(() => {
    if (!!selectedCoordinatorId) {
      getPartnersMt.mutate({
        "filter[0]": `coordinator_id:${selectedCoordinatorId}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoordinatorId]);

  return (
    <Modal
      className="modal-edit modal-mobile"
      open={isModalOpen}
      onCancel={onClose}
      width={700}
      footer={null}
    >
      <div className={styles.container}>
        <ChipSelector
          isMultiple={false}
          title=""
          options={requestModeOptions}
          onChange={(val: ChipSelectorOption<RequestModeEnum>) =>
            setIsNewFarmer(val.enum === "newCoordinator")
          }
        />
        <ReactFormBuilder
          methods={methods}
          formList={(_) =>
            queueFormList({
              queueFields,
              fieldArrayStyle: {
                farmerInput: styles.farmerInput,
                partnerSelect: styles.partnerSelect,
                typeSelect: styles.typeSelect,
                totalInput: styles.totalInput,
              },
              isNewFarmer,
              coordinatorList: coordinatorData?.data,
              partnerList: partners,
            })
          }
          onSubmit={submitRequest}
          buttonProps={{
            title: "Buat Antrian",
            customClassName: "button-custom",
            loading: nProgress.isStarted(),
          }}
        />
      </div>
    </Modal>
  );
};

export default ModalRequestQueueForm;
