import { FlatList, ScrollView, TextInput, View } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Base from '@sentadell-src/components/Base/Base';
import { useDispatch, useSelector } from 'react-redux';
import styles from './OperationalGradingScan.styles';
import Colors from '@sentadell-src/config/Colors';
import { serialNumberPattern } from '@sentadell-src/utils/regexp';
import ReactFormBuilder from '@sentadell-src/components/Form/ReactFormBuilder/ReactFormBuilder';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  GradingQueueEnum,
  GradingQueueProps,
  SelectedGradeType,
  StoredGraderType
} from '@sentadell-src/types/grading';
import { graderList, gradingFormList } from '@sentadell-src/constants/grading';
import { STORAGE_KEYS, storage } from '@sentadell-src/database/mmkv';
import Dropdown, {
  DropdownItemEnum,
  DropdownItemProps,
  DynamicDropdownRef
} from '@sentadell-src/components/Dropdown/Dropdown';
import dayjs from 'dayjs';
import Button from '@sentadell-src/components/Button/Button';
import {
  useGetLatestStoredBarcodeSales,
  useRefreshingBarcodeSales,
  useChangeBarcodeSalesStatus
} from '@sentadell-src/stores/realm/actions/barcodeSales';
import TextBase from '@sentadell-src/components/Text/TextBase';
import { ClientBarcodeSalesR } from '@sentadell-src/stores/realm/schemas/barcodeSales';
import { GradeModel } from '@sentadell-src/types/grades';
import {
  CustomOnChangeParamsProps,
  ReactFormDynamicDropdownRef
} from '@sentadell-src/components/Form/ReactFormDropdown/ReactFormDropdown';
import {
  setHookIsAppended,
  setHookIsRemoved
} from '@sentadell-src/stores/rtk/actions/hookForm';
import { RootState } from '@sentadell-src/database/reduxStore';
import { showMessage } from 'react-native-flash-message';
import {
  useCreateFetchQueue,
  useGetFetchQueues,
  useResetGradingQueue
} from '@sentadell-src/stores/realm/actions/fetchQueue';
import {
  useCreateGradesStorage,
  useGetGradesStorage
} from '@sentadell-src/stores/realm/actions/grades';
import FetchQueueList from '@sentadell-src/components/Screen/OperationalGrade/GradingQueueList/FetchQueueList';
import GradingQueueDetailModal, {
  GradingQueueDetailModalProps
} from '@sentadell-src/components/Screen/OperationalGrade/GradingQueueDetailModal/GradingQueueDetailModal';
import { GradingQueueData } from '@sentadell-src/stores/realm/schemas/grading';

require('dayjs/locale/id');

const graderOption: DropdownItemProps[] = JSON.parse(
  JSON.stringify(graderList)
);

const OperationalGradingScanScreen: React.FC = () => {
  const dispatch = useDispatch();
  const refreshBarcodeSales = useRefreshingBarcodeSales();
  const createFetchQueue = useCreateFetchQueue();
  const resetFetchQueue = useResetGradingQueue();
  const gradingQueue = useGetFetchQueues({
    limit: 5,
    isReversed: true,
    filter: {
      type: ['GRADING', 'GRADING_UPDATE']
    }
  });
  const barcodeSalesCodes = useGetLatestStoredBarcodeSales({
    limit: 50,
    status: 'free'
  });
  const chageBarcodeSalesStatus = useChangeBarcodeSalesStatus(
    barcodeSalesCodes?._id
  );
  const gradesStorage = useGetGradesStorage({});
  const createGradesStorage = useCreateGradesStorage();

  const methods = useForm<GradingQueueProps>({ mode: 'all' });

  const gradingFields = useFieldArray({
    control: methods.control,
    name: GradingQueueEnum.BUCKETS
  });

  const { isFaAppended, faRemove } = useSelector(
    (state: RootState) => state.hookForm
  );

  const gradeFieldArrayRef = useRef<{
    [K: string]: React.RefObject<ReactFormDynamicDropdownRef>;
  }>({});
  const dropdownGraderRef = useRef<DynamicDropdownRef>(null);
  const scanContainerRef = useRef<TextInput>(null);
  const flatlistRef = useRef<FlatList>(null);
  const scanQueueRef = useRef<{ code: string; status: 'Failed' | 'Success' }[]>(
    []
  );
  const selectedGradeFA = useRef<{
    [K: string]: SelectedGradeType;
  }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeout: any = useRef(false);

  const storedGraderString = storage.getString(STORAGE_KEYS.GRADER) || 'null';
  const storedGrader: StoredGraderType | null = JSON.parse(storedGraderString);
  const [dropdownGraderMessage, setDropdownGraderMessage] = useState('');
  const [gradeOptions, setGradeOptions] = useState<DropdownItemProps[]>([]);
  const [scanModeLocal, setScanModeLocal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [submitValidation, setSubmitValidation] = useState<{
    type: 'serial_number' | 'sales_code';
    idxs: number[];
  } | null>(null);
  const [gradingQueueDetailModalState, setGradingQueueDetailModalState] =
    useState<Omit<GradingQueueDetailModalProps, 'onClose'>>({
      visible: false
    });

  const submitRequest = (form: GradingQueueProps) => {
    if (form[GradingQueueEnum.BUCKETS].length > 1) {
      const newForm = form[GradingQueueEnum.BUCKETS];

      const isDuplicate = newForm.some(function (item1, idx1) {
        return newForm.some((item2, idx2) => {
          if (idx1 !== idx2) {
            if (item1.serial_number === item2.serial_number) {
              setSubmitValidation({
                type: 'serial_number',
                idxs: [idx1, idx2]
              });
              return true;
            }
            if (!item1.sales_code && !item2.sales_code) return false;
            if (item1.sales_code === item2.sales_code) {
              setSubmitValidation({
                type: 'sales_code',
                idxs: [idx1, idx2]
              });
              return true;
            }
            return false;
          }
          return false;
        });
      });

      if (isDuplicate) return;
    }

    gradeFieldArrayRef.current = {};
    createFetchQueue.create({
      type: 'GRADING',
      status: 'QUEUED',
      data: form[GradingQueueEnum.BUCKETS],
      onSuccess: () => methods.setValue(`buckets`, [] as never)
    });
  };

  const setUnitPrice = (val: string, idx: number) =>
    methods.setValue(`buckets.${idx}.unit_price`, val.toString() as never);

  const setSalesCode = (
    idx: number,
    gradeData: GradeModel,
    salesCodeIdx?: number
  ) => {
    const assignedSalesCode: string = methods.getValues(
      `buckets.${idx}.sales_code`
    );
    const clientCode = barcodeSalesCodes.list?.find(
      e => e.client_code === gradeData.client_code
    );
    const barcodeSalesR = clientCode?.codes[salesCodeIdx || 0];

    if (
      (!assignedSalesCode ||
        (assignedSalesCode &&
          assignedSalesCode.split('-')[0] !==
            gradeData.client_sales_code_initial)) &&
      barcodeSalesR
    ) {
      methods.setValue(
        `buckets.${idx}.sales_code`,
        barcodeSalesR?.code.toString() as never
      );
      methods.setValue(
        `buckets.${idx}.sales_code_data`,
        barcodeSalesR as never
      );
      chageBarcodeSalesStatus({
        clientId: clientCode?.client_id || 0,
        data: [barcodeSalesR],
        status: 'assigned'
      });
      return true;
    }

    return false;
  };

  const setSelectedGrade = (id: string, idx: number) => {
    try {
      gradeFieldArrayRef.current[id]?.current?.setSelected({
        ...gradeOptions[idx],
        selected: false
      });
    } catch (err) {
      showMessage({
        type: 'danger',
        message: 'Gagal, terjadi kesalahan! ' + err
      });
    }
  };

  const onCompleteScan = useCallback(
    (val: string) => {
      let isSuccess = true;

      const isSerialNumber = serialNumberPattern.test(val);
      const gradeIdx = gradeOptions.findIndex(
        grade => (grade[DropdownItemEnum.DATA] as GradeModel).grade === val
      );

      if (isSerialNumber) {
        const checkerIdx = gradingFields.fields.findIndex(
          field => field.serial_number === val
        );

        if (checkerIdx === -1) {
          gradingFields.append(
            {
              serial_number: val,
              grader_name: storedGrader?.grader
            } as GradingQueueData,
            { shouldFocus: false }
          );
          dispatch(setHookIsAppended(true));
        } else {
          flatlistRef.current?.scrollToOffset({
            animated: true,
            offset: checkerIdx * 80
          });
          isSuccess = false;
          showMessage({
            type: 'danger',
            message: 'Kode Sudah di scan'
          });
        }
      } else if (gradeIdx > -1) {
        const selectedIdxList: SelectedGradeType[] = Object.values(
          selectedGradeFA.current || []
        );

        if (
          selectedIdxList.length &&
          selectedIdxList[0] &&
          JSON.stringify(selectedIdxList[0]) !== '{}'
        ) {
          let salesCodeIdx = 0;

          selectedIdxList.forEach(e => {
            setSelectedGrade(e.id, gradeIdx);
            const isSuccessSetSalesCode = setSalesCode(
              e.index,
              gradeOptions[gradeIdx][DropdownItemEnum.DATA],
              salesCodeIdx
            );

            if (isSuccessSetSalesCode) salesCodeIdx += 1;
          });
        } else {
          let salesCodeIdx = 0;

          gradingFields.fields.forEach((field, idx) => {
            setSelectedGrade(field.id, gradeIdx);
            const isSuccessSetSalesCode = setSalesCode(
              idx,
              gradeOptions[gradeIdx][DropdownItemEnum.DATA],
              salesCodeIdx
            );

            if (isSuccessSetSalesCode) salesCodeIdx += 1;
          });
        }
      } else if (!isNaN(+val)) {
        const selectedIdxList = Object.values(selectedGradeFA);

        if (selectedIdxList.length) {
          selectedIdxList.forEach(e => {
            setUnitPrice(val.toString(), e.index);
          });
        } else {
          gradingFields.fields.forEach((_, idx) => {
            setUnitPrice(val.toString(), idx);
          });
        }
      } else if (val.toLocaleLowerCase() === 'submit form') {
        methods.handleSubmit(submitRequest)();
      }
      if (isSuccess) {
        showMessage({
          type: 'success',
          message: 'Scan sukses'
        });
      }
    },
    [
      gradingFields,
      gradeOptions,
      selectedGradeFA,
      gradeFieldArrayRef,
      showMessage
    ]
  );

  const onErrorScan = useCallback(
    (err: string) => {
      showMessage({
        type: 'danger',
        message: 'Scan gagal, ada yang salah -' + err
      });
    },
    [showMessage]
  );

  const buildTimer = (storedDataString: string) => {
    const storedData = storedDataString;
    const todayEpoch = dayjs().unix() + 25200;
    const today = dayjs(todayEpoch * 1000);
    const todayTS = `${today.year()}-${
      today.month() + 1
    }-${today.date()}T08:00:00+00:00`;
    const refetchEpoch = dayjs(todayTS).unix();
    const storedEpoch = dayjs(storedData).unix() + 25200;
    const storedDate = dayjs(storedEpoch * 1000).date();

    return { today, storedDate, todayEpoch, refetchEpoch };
  };

  const scanModeToggle = (val?: boolean) => {
    if (storedGrader) {
      setScanModeLocal(state => {
        if (!state) {
          scanContainerRef.current?.focus();
        }

        return val || !state;
      });
    } else {
      dropdownGraderRef.current?.focus();
    }
  };

  const handleScan = useCallback(
    (text: string) => {
      if (!isScanning) setIsScanning(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        scanQueueRef.current.push({
          code: text.replace('\n', ''),
          status: 'Success'
        });
        scanContainerRef.current?.clear();
        setIsScanning(false);
      }, 300);
    },
    [isScanning]
  );

  useEffect(() => {
    if (gradesStorage?.grades?.length) {
      const list: DropdownItemProps[] = gradesStorage.grades.map(grade => ({
        value: grade.id,
        label: `${grade.client_code} - ${grade.grade}`,
        selected: false,
        data: grade
      }));

      setGradeOptions(list);
    }
  }, [gradesStorage]);

  useEffect(() => {
    if (scanQueueRef.current.length) {
      const firstQueue = scanQueueRef.current[0];

      if (firstQueue.status === 'Success') {
        onCompleteScan(firstQueue.code);
      } else {
        onErrorScan(firstQueue.code);
      }

      if (scanQueueRef.current.length > 1) {
        scanQueueRef.current = scanQueueRef.current.slice(1);
      } else {
        scanQueueRef.current = [];
      }
    }
  }, [scanQueueRef, onCompleteScan, onErrorScan]);

  useEffect(() => {
    if (isFaAppended) {
      gradingFields.fields.every(e => {
        if (!gradeFieldArrayRef.current[`${e.id}`]) {
          gradeFieldArrayRef.current[`${e.id}`] =
            React.createRef<ReactFormDynamicDropdownRef>();
          return false;
        }

        return true;
      });
      dispatch(setHookIsAppended(false));
    }
  }, [isFaAppended, gradingFields, gradeFieldArrayRef]);

  useEffect(() => {
    if (faRemove.isRemoved) {
      delete gradeFieldArrayRef.current[`${faRemove.key}`];
      dispatch(setHookIsRemoved({ isRemoved: false }));
    }
  }, [faRemove, gradeFieldArrayRef]);

  // Barcode Sales daily refetch
  useEffect(() => {
    const storedDataString = storage.getString(
      STORAGE_KEYS.BARCODE_SALES_DAILY_REFETCH
    );

    if (storedDataString) {
      const { today, storedDate, todayEpoch, refetchEpoch } =
        buildTimer(storedDataString);

      if (today.date() > storedDate && todayEpoch > refetchEpoch) {
        refreshBarcodeSales.refresh();
      }
    }
  }, []);

  // Grades daily refetch
  useEffect(() => {
    const storedDataString = storage.getString(
      STORAGE_KEYS.GRADES_DAILY_REFETCH
    );

    if (storedDataString) {
      const { today, storedDate, todayEpoch, refetchEpoch } =
        buildTimer(storedDataString);

      if (today.date() > storedDate && todayEpoch > refetchEpoch) {
        createGradesStorage.create();
      }
    }
  }, []);

  useEffect(() => {
    if (storedGrader) {
      const now = Math.round(new Date().getTime() / 1000);

      if (storedGrader.exp <= now) {
        storage.delete(STORAGE_KEYS.GRADER);
      } else {
        const idx = graderOption.findIndex(
          e => e[DropdownItemEnum.VALUE] === storedGrader.grader
        );

        if (idx !== -1) {
          graderOption[idx][DropdownItemEnum.SELECTED] = true;
        }
      }
    } else {
      setDropdownGraderMessage('Grader belum dipilih');
    }
  }, [storedGrader]);

  useEffect(() => {
    if (isScanning) {
      showMessage({
        message: 'Sedang proses . . .',
        textStyle: {
          color: Colors.text.fullWhite
        }
      });
    }
  }, [isScanning]);

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  useEffect(() => {
    let validateTimeout: NodeJS.Timeout | null = null;

    if (submitValidation) {
      const { idxs, type } = submitValidation;
      const message = `${type} duplikat`;

      methods.setError(`buckets.${idxs[0]}.${type}`, { message });
      methods.setError(`buckets.${idxs[1]}.${type}`, { message });
      validateTimeout = setTimeout(() => {
        methods.clearErrors(`buckets.${idxs[0]}.${type}`);
        methods.clearErrors(`buckets.${idxs[1]}.${type}`);
        setSubmitValidation(null);
      }, 5000);
    }

    return () => {
      if (validateTimeout) clearTimeout(validateTimeout);
    };
  }, [submitValidation]);

  const renderQueueBarcodeSales = (item: ClientBarcodeSalesR, idx: number) => {
    const firstItem = item.codes[0];

    return (
      <View key={idx.toString()} style={[styles.barcodeSalesChip]}>
        <TextBase.M style={styles.textWhite800}>
          {item.client_code} |
        </TextBase.M>
        <TextBase.M style={styles.textWhite800}>{firstItem?.code}</TextBase.M>
      </View>
    );
  };

  const renderModal = () => {
    return (
      <>
        <GradingQueueDetailModal
          {...gradingQueueDetailModalState}
          onClose={() => setGradingQueueDetailModalState({ visible: false })}
          onUpdateData={gradingDataList => {
            createFetchQueue.create({
              type: 'GRADING_UPDATE',
              status: 'QUEUED',
              data: gradingDataList
            });
          }}
        />
      </>
    );
  };

  const onCheck = (id: string, index: number) => {
    const newState = { ...selectedGradeFA.current };

    if (newState[id]) {
      delete newState[id];
    } else {
      newState[id] = { id, index };
    }
    if (!scanModeLocal) scanModeToggle();
    selectedGradeFA.current = newState;
  };

  const customOnChange = (props: CustomOnChangeParamsProps) => {
    if (props.isMultiple) return;

    const gradeData: GradeModel = gradeOptions.find(
      e => e[DropdownItemEnum.VALUE] === props.data[DropdownItemEnum.VALUE]
    )?.[DropdownItemEnum.DATA];
    const idx = parseInt(props.name.split('.')[1]);

    if (gradeData.client_code !== 'DJRM') setSalesCode(idx, gradeData);
    setUnitPrice(gradeData.price.toString(), idx);
    scanModeToggle(true);
  };

  const renderAutoContainer = () => {
    return (
      <View style={styles.formContainer}>
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.barcodeSalesContainer}>
            {barcodeSalesCodes.list?.map(renderQueueBarcodeSales)}
          </ScrollView>
        </View>
        <ReactFormBuilder
          flatlistRef={flatlistRef}
          methods={methods}
          formList={gradingFormList(gradingFields, {
            gradeOptions: gradeOptions || [],
            salesCode: {
              onFocus: () => scanModeToggle(false),
              onBlur: () => scanModeToggle(true)
            },
            onCheck,
            customOnChange,
            ref: gradeFieldArrayRef
          })}
          onSubmit={submitRequest}
          buttonProps={{ disabled: !!dropdownGraderMessage }}
        />
      </View>
    );
  };

  return (
    <Base headerTitle={'Grading (Scan)'} noScroll>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Button
            title="Reset"
            theme="solid-blue"
            onPress={() => {
              refreshBarcodeSales.refresh();
              createGradesStorage.create();
            }}
          />
          <Button
            isLoading={createGradesStorage.isLoading}
            title={`${scanModeLocal ? 'Matikan Scan' : 'Aktifkan Scan'}`}
            theme={scanModeLocal ? 'solid-red' : 'solid-blue'}
            onPress={() => scanModeToggle()}
          />
          <TextInput
            ref={scanContainerRef}
            onBlur={() => scanModeToggle()}
            style={styles.scanInputContainer}
            multiline
            onChangeText={handleScan}
            showSoftInputOnFocus={false}
          />
          <Dropdown
            ref={dropdownGraderRef}
            isMultiple={false}
            label="Pilih Grader"
            options={graderOption || []}
            onChange={val => {
              const graderData: StoredGraderType = {
                grader: val[DropdownItemEnum.VALUE] as 'Evan' | 'Jopie',
                exp: Math.round(new Date().getTime() / 1000) + 10800
              };

              storage.set(STORAGE_KEYS.GRADER, JSON.stringify(graderData));
              setDropdownGraderMessage('');
            }}
            errorMessage={dropdownGraderMessage}
          />
          <Button
            title="Reset"
            theme="solid-blue"
            onPress={() => resetFetchQueue.reset()}
            isLoading={resetFetchQueue.isLoading}
          />
        </View>
        <FetchQueueList
          fetchQueue={gradingQueue}
          onPressItem={queue =>
            setGradingQueueDetailModalState({ visible: true, queue })
          }
        />
      </View>
      {renderAutoContainer()}
      {renderModal()}
    </Base>
  );
};

export default OperationalGradingScanScreen;
